import path from "path";
import Redis from "ioredis";
import Job from "../../base/Job.js";
import FelonyJobDispatched from "../../support/events/FelonyJobDispatched.js";

/**
 * Worker class that handles dispatching and executing jobs.
 *
 * @class
 */
export default class Worker {
  /**
   * Redis client used for connecting to queue database.
   * @type {Redis|null}
   * @private
   */
  static _client = null;

  /**
   * Array of loaded jobs that are ready for dispatch.
   *
   * @type Job[]
   */
  jobs = [];

  /**
   * Status that lets us know in what stage the listener is
   *
   * @type string
   */
  status = "inactive";

  /**
   * @param {Felony} felony
   */
  constructor(felony) {
    /**
     * @type Felony
     */
    this.felony = felony;
  }

  /**
   * Load all the available jobs onto the worker.
   *
   * @return {Promise<void>}
   */
  async load() {
    const jobs = await this.felony.kernel.readRecursive(path.resolve(this.felony.appRootPath, "jobs"));

    for (const job of jobs) {
      const Imported = (await import(job)).default;
      let replacePath = `${path.resolve(this.felony.appRootPath, "jobs")}/`; //we need to adjust the path depending on operating system
        if(job.startsWith('file://')){
          replacePath = `file://${path.resolve(this.felony.appRootPath, "jobs")}/`;
        }
      Imported.__path = job.replace(replacePath, "");
      const Instance = new Imported();

      if (Instance && Instance.__kind === "Job") {
        this.jobs.push(Imported);
      }
    }

    await this.connectRedis();
  }

  /**
   * Create new redis client and store it on static _client property of the Worker.
   *
   * @return {Promise<void>}
   */
  connectRedis() {
    return new Promise((resolve) => {
      if (this.felony.config.queue && this.felony.config.queue.connection) {
        Worker._client = new Redis(this.felony.config.queue.connection);

        Worker._client.on("ready", () => resolve());
      }
      else {
        resolve();
      }
    });
  }

  /**
   * Listener for the queue that will run on queue instances.
   *
   * @param {string} queue
   * @return {Promise<void>}
   */
  async listen(queue) {
    this.felony.log.log(`Worker: listening for incoming jobs on '${queue}'.`);

    while (!this.felony.shuttingDown) {
      this.status = "listening";

      let job = await Worker.pop(queue);

      if (job && job.__kind === "Job") {
        this.status = "working";

        job = await job.run();

        if (!job.finishedAt) {
          await Worker.push(job, `failed:${queue}`);

          // We have to null the job here to help the garbage collector
          job = null;
        }

        this.status = "finished";
      } else {
        this.status = "finished";
        await this.felony.setTimeout(null, 2000);
      }
    }
  }

  /**
   * This will make sure we stop the queue gracefully once Felony starts shutting down
   *
   * @param {number} force In seconds
   * @return {Promise<void>}
   */
  async stop(force = 300) {
    if (this.status !== "inactive") {
      const started = new Date();

      while (this.status !== "finished") {
        await this.felony.setTimeout(null, 500);

        const now = new Date();
        const diff = now.valueOf() - started.valueOf();

        // After we reach the force parameter we will just allow the force shutdown
        if (diff >= (force * 1000)) {
          if (Worker._client) {
            await Worker._client.disconnect();
          }

          return console.warn(`Worker: queue '${this.felony.arguments.queue}' didn't end gracefully, job was stuck longer then Felony was waiting for it (${force}s). If this is a problem, please increase the force timeout by passing 'FORCE_SHUTDOWN={N in seconds}' argument when starting up queue listener.`);
        }
      }

      if (Worker._client) {
        await Worker._client.disconnect();
      }
    }
  }

  /**
   * Instantiate job from the jobs array.
   *
   * @param {string} job
   * @param {object} payload
   * @return {Promise<Job | null>}
   */
  async getJob(job, payload) {
    let loaded = null;

    for (const Imported of this.jobs) {
      if (Imported.__path !== job) {
        continue;
      }

      loaded = new Imported(payload);

      // Set same __path to instantiated job
      loaded.__path = Imported.__path;
    }

    if (loaded.__kind !== "Job") {
      return null;
    }

    return loaded;
  }

  /**
   * Dispatch job by its internal URL to the queue.
   *
   * @param {string|object[]} job
   * @param {object} payload
   * @param {string|null} [queue]
   * @return {Promise<Job>}
   */
  async dispatch(job, payload = {}, queue = null) {
    const loaded = await this.getJob(job, payload);

    if (loaded.__kind !== "Job") {
      throw new Error(`Queue: ${job} is not a valid job`);
    }

    if (queue === null) {
      queue = loaded.queueOn;
    }

    if (typeof queue === "string") {
      return Worker.push(loaded, queue);
    }

    return loaded;
  }

  /**
   * Batch dispatch jobs onto queue all at once.
   *
   * @param {object[]} jobs
   * @return {Promise<{
   *     executed: Job[]
   *     dispatched: object[],
   *     errored: object[]
   * }>}
   */
  async batchDispatch(jobs) {
    const multi = Worker.redis().multi();
    const executed = [];
    const pending = [];
    const errored = [];

    // Loop through all sent jobs and prepare them for dispatch
    for (const item of jobs) {
      try {
        const loaded = await this.getJob(item.job, item.payload || {});

        if (loaded.__kind !== "Job") {
          throw new Error(`Queue: ${item.job} is not a valid job`);
        }

        item.job = loaded;

        if (typeof item.queue !== "string" && item.queue !== false) {
          item.queue = loaded.queueOn;
        }

        if (typeof item.queue === "string") {
          multi.rpush(Worker.queue(item.queue), loaded.toString());
          pending.push(item);
        }
        else {
          executed.push(await loaded.run());
        }
      }
      catch (error) {
        errored.push({ ...item, error });
      }
    }

    // Execute multi redis command that will dispatch them all,
    // loop through results and verify everything was dispatched,
    // if not, move the job to errored list and return it all back.
    const results = await multi.exec();

    for (let i = 0; i < results.length; i++) {
      if (results[i][0] !== null || isNaN(results[i][1])) {
        errored.push({ ...pending[i], error: results[i][1] });
        pending[i] = null;
      }
    }

    return {
      executed,
      dispatched: pending.filter((item) => item !== null),
      errored,
    };
  }

  /**
   * Pop single job from the queue.
   *
   * @param {string} queue
   * @return {Promise<Job|void>}
   */
  static async pop(queue) {
    let job = await Worker.redis().lpop(Worker.queue(queue));

    if (job && job.slice(0, 1) === "{") {
      job = JSON.parse(job);
    }

    if (job) {
      const _job = await Felony.queue.getJob(job.__path, job.payload);

      if (_job) {
        _job.id = job.id;
        _job.retries = job.retries || 0;
        _job.runs = job.runs || 0;
        _job.error = job.error;
        _job.result = job.result;
        _job.queueOn = job.queueOn;

        _job.createdAt = new Date(job.createdAt);

        if (job.startedAt) {
          _job.startedAt = new Date(job.startedAt);
        }

        if (job.failedAt) {
          _job.failedAt = new Date(job.failedAt);
        }

        if (job.finishedAt) {
          _job.finishedAt = new Date(job.finishedAt);
        }

        return _job;
      }
    }
  }

  /**
   * Push the job into redis key that will leave it for worker to pick up.
   *
   * @param {Job} job
   * @param {string} queue
   * @return {Promise<Job>}
   */
  static async push(job, queue) {
    await Worker.redis().rpush(Worker.queue(queue), job.toString());

    await Felony.event.raise(new FelonyJobDispatched(job));

    return job;
  }

  /**
   * Subscribe and listen for messages for queue
   *
   * @param {string} queue
   * @param {Function} callback
   */
  subscribe(queue, callback) {
    if (!queue || typeof queue !== "string") {
      throw new Error("Worker: queue defined for subscribe must be string");
    }

    if (!callback || typeof callback !== "function") {
      callback = (channel, message) => {
        console.log(`Queue: got message from '${channel}':`);
        console.log(message);
      };
    }

    Worker.redis().subscribe(Worker.queue(queue));
    Worker.redis().on("message", (channel, message) => {
      callback(channel, JSON.parse(message));
    });
  }

  /**
   * Format the queue name
   *
   * @param {string} queue
   * @return {string}
   */
  static queue(queue) {
    return `queue:${queue}`;
  }

  /**
   * Get the redis database instance defined for queue
   *
   * @return {Redis}
   */
  static redis() {
    if (!Worker._client) {
      throw new Error("Worker: no redis connection for queue, please add configuration for queue redis connection in 'config/queue.js'");
    }

    return Worker._client;
  }
}

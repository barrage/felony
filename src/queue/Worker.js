import Job from "../../base/Job.js";
import Database from "../../base/Database.js";
import { app as Felony } from "../../Felony.js";

import FelonyJobDispatched from "../../support/events/FelonyJobDispatched.js";

/**
 * Worker class that handles dispatching and executing jobs.
 *
 * @class
 */
export default class Worker {
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
   * Load all the available jobs onto the worker.
   *
   * @return {Promise<void>}
   */
  async load() {
    const jobs = await Felony.kernel.readRecursive(
      `${Felony.appRootPath}/jobs/`,
      ".js",
    );

    for (const job of jobs) {
      const Imported = (await import(job)).default;
      Imported.__path = job.replace(`${Felony.appRootPath}/jobs/`, "");

      const Instance = new Imported();

      if (Instance instanceof Job) {
        this.jobs.push(Imported);
      }
    }
  }

  /**
   * Listener for the queue that will run on queue instances.
   *
   * @param {string} queue
   * @return {Promise<void>}
   */
  async listen(queue) {
    console.log(`Worker: listening for incoming jobs on '${queue}'.`);

    while (!Felony.shuttingDown) {
      this.status = "listening";

      let job = await Worker.pop(queue);

      if (job instanceof Job) {
        this.status = "working";

        job = await job.run();

        if (!job.finishedAt) {
          await Worker.push(job, `failed:${queue}`);

          // We have to null the job here to help the garbage collector
          job = null;
        }

        this.status = "finished";
      } else {
        await Felony.setTimeout(null, 2000);
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
        await Felony.setTimeout(null, 2000);

        const now = new Date();
        const diff = now.valueOf() - started.valueOf();

        // After we reach the force parameter we will just allow the force shutdown
        if (diff >= (force * 1000)) {
          return console.warn(`Worker: queue '${Felony.arguments.queue}' didn't end gracefully, job was stuck longer then Felony was waiting for it (${force}s). If this is a problem, please increase the force timeout by passing 'FORCE_SHUTDOWN={N in seconds}' argument when starting up queue listener.`);
        }
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
      // @ts-ignore
      if (Imported.__path !== job) {
        continue;
      }

      loaded = new Imported(payload);

      // Set same __path to instantiated job
      loaded.__path = Imported.__path;
    }

    if (!(loaded instanceof Job)) {
      return null;
    }

    return loaded;
  }

  /**
   * Dispatch job by its internal URL to the queue.
   *
   * @param {string} job
   * @param {object} payload
   * @param {string|null} [queue]
   * @return {Promise<Job>}
   */
  async dispatch(job, payload = {}, queue = null) {
    const loaded = await this.getJob(job, payload);

    if (!(loaded instanceof Job)) {
      throw new Error(`Queue: ${job} is not a valid job`);
    }

    if (queue === null) {
      queue = loaded.queueOn;
    }

    if (typeof queue === "string") {
      return Worker.push(loaded, queue);
    }

    await Felony.event.raise(new FelonyJobDispatched(loaded));

    return loaded;
  }

  /**
   * Pop single job from the queue.
   *
   * @param {string} queue
   * @return {Promise<Job|void>}
   */
  static async pop(queue) {
    let job = await Worker.redis().client.lpop(Worker.queue(queue));

    if (job && job.slice(0, 1) === '{') {
      job = JSON.parse(job);
    }

    if (job) {
      const _job = await Felony.queue.getJob(job.__path, job.payload);

      if (_job) {
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
    await Worker.redis().client.rpush(Worker.queue(queue), job.toString());

    return job;
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
   * @return {Database}
   */
  static redis() {
    if (
      !Felony.config.queue || typeof Felony.config.queue.connection !== "string"
    ) {
      throw new Error(`Worker: no queue defined in the configuration`);
    }

    if (!(Felony.db[Felony.config.queue.connection] instanceof Database)) {
      throw new Error(`Worker: invalid queue connection defined`);
    }

    // @ts-ignore
    return Felony.db[Felony.config.queue.connection];
  }
}

import { v4 as uuidV4 } from "uuid";
import FelonyJobFailed from "../support/events/FelonyJobFailed.js";
import FelonyJobStarted from "../support/events/FelonyJobStarted.js";
import FelonyJobFinished from "../support/events/FelonyJobFinished.js";

/**
 * Job definition class that every job has to extend
 *
 * @class
 */
export default class Job {
  /**
   * Static property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  static __kind = "Job";

  /**
   * Property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  __kind = "Job";

  /**
   * Path that will be attached to the job as a static instance and jobs will be searched on worker by this key. (filled in automatically)
   *
   * @type string
   */
  static __path = "";

  /**
   * Once the job is dispatched we will attach the path we got on it so it's not static. (filled in automatically)
   *
   * @type string
   */
  __path = "";

  /**
   * Job id that will be used for emitting messages through pub/sub
   *
   * @type string
   */
  id = uuidV4();

  /**
   * Number of retries this job has (after the initial try).
   * If you wish to have a smarter restrict you can do so in retryStrategy()
   * method in your job.
   *
   * @type number
   */
  retries = 0;

  /**
   * Number of times this job was tried.
   *
   * @type number
   */
  runs = 0;

  /**
   * Date stamp of when the job has been created.
   *
   * @type Date
   */
  createdAt = new Date();

  /**
   * Date stamp of when the job has started (last time).
   *
   * @type Date | null
   */
  startedAt = null;

  /**
   * Date stamp of when the job has failed (last time).
   *
   * @type Date | null
   */
  failedAt = null;

  /**
   * Date stamp of when the job finished (if it finishes)
   *
   * @type Date | null
   */
  finishedAt = null;

  /**
   * If job fails with any error, that will be stored here.
   *
   * @type any
   */
  error = null;

  /**
   * Any results that handle() method returns after execution will be available here.
   *
   * @type any
   */
  result = null;

  /**
   * Queue name where this job will be dispatched on.
   *
   * @type string | null
   */
  queueOn = null;

  /**
   * Payload passed to the job.
   *
   * @type {object}
   */
  payload = {};

  /**
   * Construct the job and give it some payload
   *
   * @param {object} payload
   */
  constructor(payload = {}) {
    this.payload = payload;
  }

  /**
   * Handler method that will run once the job is actually executed.
   *
   * @return {Promise<any>}
   */
  async handle() {}

  /**
   * Handler that will dictate what we will do after the job fails.
   *
   * @return {Promise<boolean|void>}
   */
  async retryStrategy() {}

  /**
   * Wrapper around the handle method that will gracefully run and stop this job.
   *
   * @return {Promise<Job>}
   */
  async run() {
    let done = false;

    this.startedAt = new Date();

    // Try executing job until we exhaust all retries, or job reports its done.
    while (this.runs === 0 || (this.runs < this.retries && done === false)) {
      this.runs += 1;

      await Felony.event.raise(new FelonyJobStarted(this));

      try {
        console.info(`Job ${this.constructor.name} started on '${Felony.arguments.queue || "no-queue"}'`);

        this.result = await this.handle();
        this.finishedAt = new Date();
        done = true;

        console.info(`Job ${this.constructor.name} finished on '${Felony.arguments.queue || "no-queue"}'`);

        await Felony.event.raise(new FelonyJobFinished(this));
      }
      catch (error) {
        console.error(`Job ${this.constructor.name} failed on '${Felony.arguments.queue || "no-queue"}'`);
        this.error = error;
        this.failedAt = new Date();

        // If we have retryStrategy defined we will figure out from it
        // should we retry this job:
        // If the job returns 'false' we will stop execution.
        if (typeof this.retryStrategy === "function") {
          try {
            const retry = await this.retryStrategy();

            done = retry === false;
          }
          catch (error) {
            console.error(`Job ${this.constructor.name} failed while attempting to retry on '${Felony.arguments.queue || "no-queue"}'`, error);
            done = true;
          }
        }
      }
    }

    if (!this.finishedAt && this.failedAt) {
      await Felony.event.raise(new FelonyJobFailed(this));
    }

    return this;
  }

  /**
   * Create JSON of this job.
   *
   * @return {object}
   */
  toJson() {
    return JSON.parse(JSON.stringify({
      __path: this.__path,
      id: this.id,
      retries: this.retries,
      runs: this.runs,
      payload: this.payload,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      failedAt: this.failedAt,
      finishedAt: this.finishedAt,
      error: this.error,
      result: this.result,
      queueOn: this.queueOn,
    }));
  }

  /**
   * Create string of this job.
   *
   * @return {string}
   */
  toString() {
    return JSON.stringify(this.toJson());
  }
}

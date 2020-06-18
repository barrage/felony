import { app as Felony } from "../Felony.js";
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
   * Path that will be attached to the job as a static instance and jobs will be searched on worker by this key.
   *
   * @type string
   */
  static __path = "";

  /**
   * Once the job is dispatched we will attach the path we got on it so it's not static.
   *
   * @type string
   */
  __path = "";

  /**
   * Number of retries this job has (after the initial try).
   * If you wish to have a smarter restrict you can create retryStrategy()
   * method in your job.
   *
   * If you wish for the job to have infinite retries, set this to -1.
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
   * Date stamp of when the job finished.
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
   * Any results that job returns after execution will be available here.
   *
   * @type any
   */
  result = null;

  /**
   * Queue name where this job will be dispatched on.
   *
   * @type string | null
   */
  queueO = null;

  /**
   * Construct the job and give it some payload
   *
   * @param {object} payload
   */
  constructor(payload = {}) {}

  /**
   * Handler class that will run once the job is actually executed.
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

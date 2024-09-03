import { v4 as uuidV4 } from "uuid";
import FelonyJobFailed from "../support/events/FelonyJobFailed";
import FelonyJobStarted from "../support/events/FelonyJobStarted";
import FelonyJobFinished from "../support/events/FelonyJobFinished";
import Felony from "../Felony";

export interface JobInterface {
  handle(): Promise<any>;
  retryStrategy(): Promise<boolean | void>;
  run(): Promise<Job>;
  toJson(): object;
  toString(): string;
}

/**
 * Job definition class that every job has to extend
 *
 * @class
 */
export default class Job implements JobInterface {
  /**
   * Static property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  static __kind: string = "Job";

  /**
   * Property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  __kind: string = "Job";

  /**
   * Path that will be attached to the job as a static instance and jobs will be searched on worker by this key. (filled in automatically)
   *
   * @type {string}
   */
  static __path: string = "";

  /**
   * Once the job is dispatched we will attach the path we got on it so it's not static. (filled in automatically)
   *
   * @type {string}
   */
  __path: string = "";

  /**
   * Job id that will be used for emitting messages through pub/sub
   *
   * @type {string}
   */
  id: string = uuidV4();

  /**
   * Number of retries this job has (after the initial try).
   * If you wish to have a smarter restrict you can do so in retryStrategy()
   * method in your job.
   *
   * @type {number}
   */
  retries: number = 0;

  /**
   * Number of times this job was tried.
   *
   * @type {number}
   */
  runs: number = 0;

  /**
   * Date stamp of when the job has been created.
   *
   * @type {Date}
   */
  createdAt: Date = new Date();

  /**
   * Date stamp of when the job has started (last time).
   *
   * @type {Date | null}
   */
  startedAt: Date | null = null;

  /**
   * Date stamp of when the job has failed (last time).
   *
   * @type {Date | null}
   */
  failedAt: Date | null = null;

  /**
   * Date stamp of when the job finished (if it finishes)
   *
   * @type {Date | null}
   */
  finishedAt: Date | null = null;

  /**
   * If job fails with any error, that will be stored here.
   *
   * @type {any}
   */
  error: any = null;

  /**
   * Any results that handle() method returns after execution will be available here.
   *
   * @type {any}
   */
  result: any = null;

  /**
   * Queue name where this job will be dispatched on.
   *
   * @type {string | null}
   */
  queueOn: string | null = null;

  /**
   * Payload passed to the job.
   *
   * @type {object}
   */
  payload: object = {};

  /**
   * Instance of the framework
   *
   * @type {Felony}
   */
  felony: Felony;

  /**
   * Construct the job and give it some payload
   *
   * @param {object} payload
   * @param {Felony} felony
   */
  constructor(payload: object = {}, felony: Felony) {
    this.payload = payload;
    this.felony = felony;
  }

  /**
   * Handler method that will run once the job is actually executed.
   *
   * @return {Promise<any>}
   */
  async handle(): Promise<any> {}

  /**
   * Handler that will dictate what we will do after the job fails.
   *
   * @return {Promise<boolean|void>}
   */
  async retryStrategy(): Promise<boolean | void> {}

  /**
   * Wrapper around the handle method that will gracefully run and stop this job.
   *
   * @return {Promise<Job>}
   */
  async run(): Promise<Job> {
    let done = false;

    this.startedAt = new Date();

    // Try executing job until we exhaust all retries, or job reports its done.
    while (this.runs === 0 || (this.runs < this.retries && done === false)) {
      this.runs += 1;

      await this.felony.event.raise(new FelonyJobStarted(this));

      try {
        console.info(`Job ${this.constructor.name} started on '${this.felony.arguments.queue || "no-queue"}'`);

        this.result = await this.handle();
        this.finishedAt = new Date();
        done = true;

        console.info(`Job ${this.constructor.name} finished on '${this.felony.arguments.queue || "no-queue"}'`);

        await this.felony.event.raise(new FelonyJobFinished(this));
      }
      catch (handleError) {
        console.error(`Job ${this.constructor.name} failed on '${this.felony.arguments.queue || "no-queue"}'`);
        this.error = handleError;
        this.failedAt = new Date();

        // If we have retryStrategy defined we will figure out from it
        // should we retry this job:
        // If the job returns 'false' we will stop execution.
        if (typeof this.retryStrategy === "function") {
          try {
            const retry = await this.retryStrategy();

            done = retry === false;
          }
          catch (retryError) {
            console.error(`Job ${this.constructor.name} failed while attempting to retry on '${this.felony.arguments.queue || "no-queue"}'`, retryError);
            done = true;
          }
        }
      }
    }

    if (!this.finishedAt && this.failedAt) {
      await this.felony.event.raise(new FelonyJobFailed(this));
    }

    return this;
  }

  /**
   * Create JSON of this job.
   *
   * @return {object}
   */
  toJson(): object {
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
  toString(): string {
    return JSON.stringify(this.toJson());
  }
}

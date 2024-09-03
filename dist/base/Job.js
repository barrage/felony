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
     * Construct the job and give it some payload
     *
     * @param {object} payload
     * @param {Felony} felony
     */
    constructor(payload = {}, felony) {
        /**
         * Property lettings us know what kind of class this is
         *
         * @type {string}
         * @private
         */
        this.__kind = "Job";
        /**
         * Once the job is dispatched we will attach the path we got on it so it's not static. (filled in automatically)
         *
         * @type {string}
         */
        this.__path = "";
        /**
         * Job id that will be used for emitting messages through pub/sub
         *
         * @type {string}
         */
        this.id = uuidV4();
        /**
         * Number of retries this job has (after the initial try).
         * If you wish to have a smarter restrict you can do so in retryStrategy()
         * method in your job.
         *
         * @type {number}
         */
        this.retries = 0;
        /**
         * Number of times this job was tried.
         *
         * @type {number}
         */
        this.runs = 0;
        /**
         * Date stamp of when the job has been created.
         *
         * @type {Date}
         */
        this.createdAt = new Date();
        /**
         * Date stamp of when the job has started (last time).
         *
         * @type {Date | null}
         */
        this.startedAt = null;
        /**
         * Date stamp of when the job has failed (last time).
         *
         * @type {Date | null}
         */
        this.failedAt = null;
        /**
         * Date stamp of when the job finished (if it finishes)
         *
         * @type {Date | null}
         */
        this.finishedAt = null;
        /**
         * If job fails with any error, that will be stored here.
         *
         * @type {any}
         */
        this.error = null;
        /**
         * Any results that handle() method returns after execution will be available here.
         *
         * @type {any}
         */
        this.result = null;
        /**
         * Queue name where this job will be dispatched on.
         *
         * @type {string | null}
         */
        this.queueOn = null;
        /**
         * Payload passed to the job.
         *
         * @type {object}
         */
        this.payload = {};
        this.payload = payload;
        this.felony = felony;
    }
    /**
     * Handler method that will run once the job is actually executed.
     *
     * @return {Promise<any>}
     */
    async handle() { }
    /**
     * Handler that will dictate what we will do after the job fails.
     *
     * @return {Promise<boolean|void>}
     */
    async retryStrategy() { }
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
/**
 * Static property lettings us know what kind of class this is
 *
 * @type {string}
 * @private
 */
Job.__kind = "Job";
/**
 * Path that will be attached to the job as a static instance and jobs will be searched on worker by this key. (filled in automatically)
 *
 * @type {string}
 */
Job.__path = "";
//# sourceMappingURL=Job.js.map
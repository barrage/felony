import Redis from "ioredis";
import Job from "../../base/Job";
import Felony from "../../Felony";
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
    static _client: Redis | null;
    /**
     * Array of loaded jobs that are ready for dispatch.
     *
     * @type {Array<typeof Job>}
     */
    jobs: Array<typeof Job>;
    /**
     * Status that lets us know in what stage the listener is
     *
     * @type {string}
     */
    status: string;
    /**
      * @type {Felony}
      */
    felony: Felony;
    /**
     * @param {Felony} felony
     */
    constructor(felony: Felony);
    /**
     * Load all the available jobs onto the worker.
     *
     * @return {Promise<void>}
     */
    load(): Promise<void>;
    /**
     * Create new redis client and store it on static _client property of the Worker.
     *
     * @return {Promise<void>}
     */
    connectRedis(): Promise<void>;
    /**
     * Listener for the queue that will run on queue instances.
     *
     * @param {string} queue
     * @return {Promise<void>}
     */
    listen(queue: string): Promise<void>;
    /**
     * This will make sure we stop the queue gracefully once Felony starts shutting down
     *
     * @param {number} force In seconds
     * @return {Promise<void>}
     */
    stop(force?: number): Promise<void>;
    /**
     * Instantiate job from the jobs array.
     *
     * @param {string} job
     * @param {any} payload
     * @return {Promise<Job>}
     */
    getJob(job: string, payload?: any): Promise<Job | null>;
    /**
     * Dispatch job by its internal URL to the queue.
     *
     * @param {string} job
     * @param {any} [payload]
     * @param {string|null} [queue]
     * @return {Promise<Job>}
     */
    dispatch(job: string, payload?: any, queue?: string | null): Promise<Job>;
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
    batchDispatch(jobs: {
        job: string;
        payload: any;
        queue: string | boolean;
    }[]): Promise<{
        executed: Array<typeof Job>;
        dispatched: any[];
        errored: any[];
    }>;
    /**
     * Pop single job from the queue.
     *
     * @param {string} queue
     * @return {Promise<Job|void>}
     */
    pop(queue: string): Promise<Job | void>;
    /**
     * Push the job into redis key that will leave it for worker to pick up.
     *
     * @param {Job} job
     * @param {string} [queue]
     * @return {Promise<Job>}
     */
    push(job: Job, queue?: string): Promise<Job>;
    /**
     * Subscribe and listen for messages for queue
     *
     * @param {string} queue
     * @param {Function} callback
     */
    subscribe(queue: string, callback: Function): void;
    /**
     * Format the queue name
     *
     * @param {string} queue
     * @return {string}
     */
    static queue(queue: string): string;
    /**
     * Get the redis database instance defined for queue
     *
     * @return {Redis}
     */
    static redis(): Redis;
}

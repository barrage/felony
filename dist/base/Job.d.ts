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
    static __kind: string;
    /**
     * Property lettings us know what kind of class this is
     *
     * @type {string}
     * @private
     */
    __kind: string;
    /**
     * Path that will be attached to the job as a static instance and jobs will be searched on worker by this key. (filled in automatically)
     *
     * @type {string}
     */
    static __path: string;
    /**
     * Once the job is dispatched we will attach the path we got on it so it's not static. (filled in automatically)
     *
     * @type {string}
     */
    __path: string;
    /**
     * Job id that will be used for emitting messages through pub/sub
     *
     * @type {string}
     */
    id: string;
    /**
     * Number of retries this job has (after the initial try).
     * If you wish to have a smarter restrict you can do so in retryStrategy()
     * method in your job.
     *
     * @type {number}
     */
    retries: number;
    /**
     * Number of times this job was tried.
     *
     * @type {number}
     */
    runs: number;
    /**
     * Date stamp of when the job has been created.
     *
     * @type {Date}
     */
    createdAt: Date;
    /**
     * Date stamp of when the job has started (last time).
     *
     * @type {Date | null}
     */
    startedAt: Date | null;
    /**
     * Date stamp of when the job has failed (last time).
     *
     * @type {Date | null}
     */
    failedAt: Date | null;
    /**
     * Date stamp of when the job finished (if it finishes)
     *
     * @type {Date | null}
     */
    finishedAt: Date | null;
    /**
     * If job fails with any error, that will be stored here.
     *
     * @type {any}
     */
    error: any;
    /**
     * Any results that handle() method returns after execution will be available here.
     *
     * @type {any}
     */
    result: any;
    /**
     * Queue name where this job will be dispatched on.
     *
     * @type {string | null}
     */
    queueOn: string | null;
    /**
     * Payload passed to the job.
     *
     * @type {object}
     */
    payload: object;
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
    constructor(payload: object, felony: Felony);
    /**
     * Handler method that will run once the job is actually executed.
     *
     * @return {Promise<any>}
     */
    handle(): Promise<any>;
    /**
     * Handler that will dictate what we will do after the job fails.
     *
     * @return {Promise<boolean|void>}
     */
    retryStrategy(): Promise<boolean | void>;
    /**
     * Wrapper around the handle method that will gracefully run and stop this job.
     *
     * @return {Promise<Job>}
     */
    run(): Promise<Job>;
    /**
     * Create JSON of this job.
     *
     * @return {object}
     */
    toJson(): object;
    /**
     * Create string of this job.
     *
     * @return {string}
     */
    toString(): string;
}

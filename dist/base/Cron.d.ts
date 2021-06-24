export interface CronInterface {
    handle(): Promise<any>;
}
/**
 * Basic cron definition of the attributes.
 *
 * @class
 */
export default class Cron implements CronInterface {
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
     * Path to the cron that will be attached while loading (this is automatically filled in)
     *
     * @type {string}
     */
    static __path: string;
    /**
     * User friendly description of the cron that has to be static.
     *
     * @type {string}
     */
    static description: string;
    /**
     * Cron schedule
     *
     * @type {string}
     */
    static schedule: string;
    /**
     * Is this cron job currently active
     *
     * @type {boolean}
     */
    static active: boolean;
    /**
     * Method that will be run once the cron is initiated
     *
     * @return {Promise<any>}
     */
    handle(): Promise<any>;
}

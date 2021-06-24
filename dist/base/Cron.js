/**
 * Basic cron definition of the attributes.
 *
 * @class
 */
export default class Cron {
    constructor() {
        /**
         * Property lettings us know what kind of class this is
         *
         * @type {string}
         * @private
         */
        this.__kind = "Cron";
    }
    /**
     * Method that will be run once the cron is initiated
     *
     * @return {Promise<any>}
     */
    async handle() { }
}
/**
 * Static property lettings us know what kind of class this is
 *
 * @type {string}
 * @private
 */
Cron.__kind = "Cron";
/**
 * Path to the cron that will be attached while loading (this is automatically filled in)
 *
 * @type {string}
 */
Cron.__path = "";
/**
 * User friendly description of the cron that has to be static.
 *
 * @type {string}
 */
Cron.description = "";
/**
 * Cron schedule
 *
 * @type {string}
 */
Cron.schedule = "";
/**
 * Is this cron job currently active
 *
 * @type {boolean}
 */
Cron.active = true;
//# sourceMappingURL=Cron.js.map
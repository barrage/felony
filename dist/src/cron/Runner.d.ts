import Cron from "../../base/Cron";
import Felony from "../../Felony";
/**
 * Runenr class that will load and run cron jobs
 *
 * @class
 */
export default class Runner {
    /**
     * Array of loaded cron jobs
     *
     * @type {Array<typeof Cron>}
     */
    _crons: Array<typeof Cron>;
    /**
     * List of crons loaded and ready to run.
     *
     * @type {object[typeof Cron]}
     */
    crons: object;
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
     * Run the crons if arguments allow it
     *
     * @return {Promise<any>}
     */
    run(): Promise<any>;
}

import Cron from "../../../base/Cron";
import Command from "../../../base/Command";
/**
 * Hello world command used as an example.
 *
 * @class
 */
export default class CronDisplayCommand extends Command {
    /**
     * Static signature key that will be callable name of our command.
     *
     * @type {string}
     */
    static signature: string;
    /**
     * User friendly description of the command that has to be static.
     *
     * @type {string}
     */
    static description: string;
    /**
     * User friendly example of your command usage.
     *
     * @type {string}
     */
    static usage: string;
    /**
     * Handler method of the command that will run the action.
     *
     * @return {Promise<any>}
     */
    handle(): Promise<any>;
    /**
     * Load all the cron jobs available
     *
     * @return {Promise<Cron[]>}
     */
    load(): Promise<Array<typeof Cron>>;
}

import Command from "../../../base/Command";
/**
 * Get status of jobs in queue and failed jobs on given queues by name
 *
 * @class
 */
export default class QueueStatusCommand extends Command {
    /**
     * Integrated command flag
     *
     * @type {boolean}
     */
    static integrated: boolean;
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
     * Example of the command usage.
     *
     * @type {string}
     */
    static usage: string;
    /**
     * Handler method of the command that will run the action.
     *
     * @return {Promise<{
     *   queue: string,
     *   pending: number,
     *   failed: number,
     * }[]>}
     */
    handle(): Promise<{
        queue: string;
        pending: number;
        failed: number;
    }[]>;
}

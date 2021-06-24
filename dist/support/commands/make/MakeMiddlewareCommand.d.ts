import Make from "./Make";
/**
 * Generator command
 *
 * @class
 */
export default class MakeMiddlewareCommand extends Make {
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
     * @return {Promise<void>}
     */
    handle(): Promise<void>;
}

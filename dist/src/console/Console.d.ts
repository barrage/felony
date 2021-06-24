import Command from "../../base/Command";
import Kernel from "../Kernel";
/**
 * Handler for console commands that will preload all commands and handle their running.
 *
 * @class
 */
export default class Console {
    /**
     * @type { Array<typeof Command>}
     */
    commands: Array<typeof Command>;
    /**
     * @type {Kernel}
     */
    kernel: Kernel;
    /**
     * @param {Kernel} kernel
     */
    constructor(kernel: Kernel);
    /**
     * List all the available commands loaded in the console.
     *
     * @return {Promise<void>}
     */
    list(): Promise<void>;
    /**
     * Run the command with given payload.
     *
     * @param {string} signature
     * @param {object} payload
     * @return {Promise<any>}
     */
    run(signature: string, payload: object): Promise<any>;
    /**
     * Load all the commands onto the object and prepare them for running.
     *
     * @return {Promise<any>}
     */
    load(): Promise<any>;
}

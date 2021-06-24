import Server from "./http/Server";
import Console from "./console/Console";
import Felony from "../Felony";
/**
 * Framework kernel that will raise actual workers and gather the configurations.
 *
 * @class
 */
export default class Kernel {
    /**
     * Router instance with all the preloaded routes and server
     *
     * @type {Server}
     */
    server: Server;
    /**
     * Console instance that will handle loading and running of the commands
     *
     * @type {Console}
     */
    console: Console;
    /**
     * Instance of the framework calling the kernel
     *
     * @type {Felony}
     */
    felony: Felony;
    /**
     * @param {Felony} felony
     */
    constructor(felony: Felony);
    /**
     * Parse command line arguments passed to node app
     *
     * @param {object} args
     * @return {object}
     */
    arguments(args: object): object;
    /**
     * Parse all config files contained in {Felony.appRootPath}/config/*.ts
     * and return them as a single object.
     *
     * @return {Promise<AppConfig>}
     */
    config(): Promise<object>;
    /**
     * By the start of this method, Felony should already have the
     * whole argumentation and configuration.
     *
     * @return {Promise<any>}
     */
    bootstrap(): Promise<any>;
    /**
     * Setup signal listeners for graceful shutdown
     *
     * @return {Promise<void>}
     */
    signal(): Promise<void>;
    /**
     * Reads directory and returns paths to files within it.
     *
     * @param {string} dir
     * @param {string[]} [suffix]
     * @param {string[]} [dirIgnore]
     * @return {Promise<string[]>}
     */
    readRecursive(dir: string, suffix?: string[], dirIgnore?: string[]): Promise<string[]>;
    /**
     * Load single configuration file.
     *
     * @param {string} filePath
     * @return {Promise<object>}
     * @private
     */
    static loadConfig(filePath: string): Promise<object>;
}

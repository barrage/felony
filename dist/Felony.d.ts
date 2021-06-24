import Kernel from "./src/Kernel";
import Bus from "./src/events/Bus";
import Logger from "./src/log/Logger";
import Runner from "./src/cron/Runner";
import Worker from "./src/queue/Worker";
import Connector from "./src/database/Connector";
interface CliArguments {
    /**
     * Override default application port
     */
    SERVER_PORT?: number;
    /**
     * Timeout after sending the interupt signal
     * for how long the server will wait to finish
     * processing queue jobs and http requests
     * before it forcefully shuts itself down
     */
    FORCE_SHUTDOWN?: number;
    /**
     * Lets the server know should the http instance
     * start running
     *
     * default: false
     */
    http?: boolean;
    /**
     * Name of the queue that this instance will run
     *
     * cannot be combined with http
     *
     * default: undefined
     */
    queue?: string;
    /**
     * This will run the output of all the comands
     * with their usage and descriptions in terminal
     *
     * default: undefined
     */
    commands?: boolean;
    /**
     * Command that should be started, and the rest
     * of the arguments will be passed to it
     *
     * default: undefined
     */
    command?: string;
    /**
     * Lets the application know to continue running until
     * interupted if no other processes keep it running.
     *
     * This will not keep the process active unless something else
     * is keeping it up (tests for example)
     *
     * default: false
     */
    exit?: boolean;
    /**
     * Flag to let the application to start processing
     * cron jobs.
     *
     * default: false
     */
    cron?: boolean;
    /**
     * When this flag is set to true almost none of the cli
     * messages are emitted
     *
     * default: false
     */
    silent?: boolean;
}
interface AppConfig {
    server?: AppConfigServer;
    cors?: object;
    queue?: AppConfigQueue;
}
interface AppConfigServer {
    https?: object;
    port?: number;
    router?: object;
    json?: object;
    raw?: object;
    helmet?: object;
    static?: string;
}
interface AppConfigQueue {
    connection?: AppConfigQueueConnection;
}
interface AppConfigQueueConnection {
    host?: string;
    port?: number;
    db?: number;
    password?: number;
}
export interface FelonyInterface {
    environment: string;
    appRootPath: string;
    felonyPath: string;
    shuttingDown: boolean;
    kernel: Kernel;
    event: Bus;
    queue: Worker;
    cron: Runner;
    db: Connector;
    log: Logger;
    arguments: CliArguments;
    commit(): Promise<void>;
    down(): Promise<void>;
    setTimeout(payload: any, ms: any): Promise<any>;
    getStack(error: any): string[];
    ucFirst(text: string): string;
}
/**
 * Felony framework global class with everything exposed for global usage.
 *
 * @class
 */
export default class Felony implements FelonyInterface {
    /**
     * Application environment from where it's running:
     *
     * export NODE_ENV=production
     *
     * in order to change this
     *
     * @type {string}
     */
    environment: string;
    /**
     * @type {string}
     */
    appRootPath: string;
    /**
     * @type {string}
     */
    felonyPath: string;
    /**
     * Once we get signal to shut down, this will turn to true.
     *
     * @type {boolean}
     */
    shuttingDown: boolean;
    /**
     * @type {Kernel}
     */
    kernel: Kernel;
    /**
     * @type {Bus}
     */
    event: Bus;
    /**
     * @type {Worker}
     */
    queue: Worker;
    /**
     * Router instance with all the preloaded routes and server
     *
     * @type {Runner}
     */
    cron: Runner;
    /**
     * Database connector
     *
     * @type {Connector}
     */
    db: Connector;
    /**
     * Internal logging instance that can be silenced
     *
     * @type {Logger}
     */
    log: Logger;
    /**
     * Arguments passed from the CLI to Felony.
     *
     * Some of the present arguments are used internally:
     *
     * @type {object}
     */
    arguments: CliArguments;
    /**
     * Loaded and prepared configuration that will be used anywhere in the application.
     *
     * @type {object}
     */
    config: AppConfig;
    /**
     * Construct the framework
     *
     * @param {string} appRootPath
     * @param {object} args Suppresses almost all the logs
     */
    constructor(appRootPath?: string, args?: CliArguments | any);
    /**
     * NO RUNNING BACK HERE!
     *
     * Takes all the set configurations and files, compiles them all together and starts running.
     *
     * @return {Promise<void>}
     */
    commit(): Promise<void>;
    /**
     * Tries to shut down everything gracefully, will resolve only once everything is down.
     *
     * @return {Promise<void>}
     */
    down(): Promise<void>;
    /**
     * Create
     * @param {any} payload
     * @param {number} ms
     */
    setTimeout(payload: any, ms: any): Promise<any>;
    /**
     * Get error stack as user friendly array.
     *
     * @param {any} error
     * @return string[]
     */
    getStack(error: any): string[];
    /**
     * Capitalize first letter of given text.
     *
     * @param {string} text
     * @return string
     */
    ucFirst(text?: string): string;
}
/**
  * Start the framework right away
  *
  * @param {string} [appRootPath] Location where your application will be located
  * @param {CliArguments | any} [args] Arguments for starting up Felony
  * @return {Promise<void>}
  */
export declare function commit(appRootPath?: string, args?: CliArguments | any): Promise<void>;
/**
 * Will return the global Felony instance if it is instantiated
 * and running.
 *
 * @returns {Felony | undefined}
 */
export declare function singelton(): Felony | undefined;
export {};

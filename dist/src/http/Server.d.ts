import Express from "express";
import { RouteInterface } from "../../base/Route";
import Kernel from "../Kernel";
/**
 * Server instance that will load the routes and launch the server.
 *
 * @class
 */
export default class Server {
    /**
     * All the routes loaded
     *
     * @type {RouteInterface[]}
     */
    routes: RouteInterface[];
    /**
     * Server instance
     *
     * @type {Function}
     */
    application: Express.Application;
    /**
     * Router instance
     *
     * @type {any}
     */
    router: any;
    /**
     * Status of the HTTP server
     *
     * @type {string}
     */
    status: string;
    /**
     * @type {Kernel}
     */
    kernel: Kernel;
    /**
     * @type {any}
     */
    server: any;
    /**
     * @param {Kernel} kernel
     */
    constructor(kernel: Kernel);
    /**
     * Load all defined routes within the framework and set them up for listening.
     *
     * @return {Promise<any>}
     */
    load(): Promise<any>;
    /**
     * Launch the actual server that will listen to the incoming requests.
     *
     * @return {Promise<any>}
     */
    serve(): Promise<any>;
    /**
     * Close the server listeners
     *
     * @param {number} [force] In seconds
     * @return {Promise<void>}
     */
    close(force?: number): Promise<void>;
    /**
     * Internal runner for each route.
     *
     * @param {RouteInterface} route
     * @return {Promise<Function[]>}
     */
    compileCallbacks(route: RouteInterface): Promise<Function[]>;
    /**
     * Setup application before we start attaching routes and middleware to it.
     *
     * @return {Promise<void>}
     */
    setupApplication(): Promise<void>;
    /**
     * Setup helmet on the application with sane defaults.
     * https://helmetjs.github.io/
     *
     * @return {Promise<void>}
     */
    setupHelmet(): Promise<void>;
    /**
     * Setup cors on the server application
     *
     * @return {Promise<void>}
     */
    setupCors(): Promise<void>;
}

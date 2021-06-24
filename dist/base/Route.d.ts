import Middleware from "./Middleware";
import { Request, Response } from "express";
import Felony from "../Felony";
export interface RouteInterface {
    handle(request: Request, response: Response): Promise<any>;
    getMiddleware(): Promise<Middleware[]>;
    method: string;
    path: string;
    description: string;
}
/**
 * Base route class that defines basic attributes that the route will have to have.
 *
 * @class
 */
export default class Route implements RouteInterface {
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
     * HTTP method used for this route
     *
     * @type {string}
     */
    method: string;
    /**
     * HTTP path path after the hostname for this route
     *
     * @type {string}
     */
    path: string;
    /**
     * Description of this route that will be used while loading to describe this route
     *
     * @type {string}
     */
    description: string;
    /**
     * Internal path to route file location for logging.
     *
     * @type {string}
     */
    __path: string;
    /**
     * Array containing all the middleware that will be launched before request
     * enters this route.
     *
     * Types allowed for this define:
     * @type {string[] | string | Middleware[] | Middleware}
     * Type string[]
     *  - Here you can define files with their full import path, they will have to each export default class that extends Middleware class
     *
     * Type string
     *  - There is no need for array if you only have one path to middleware
     *
     * Type Middleware[]
     *  - You can preload multiple middleware classes in your route and then push them into this array
     *
     * Type Middleware
     *  - You can assign a single middleware class to this key
     */
    middleware: string[] | string | Middleware[] | Middleware;
    /**
     * @type {Felony}
     */
    felony: Felony;
    /**
     * @param {Felony} felony
     */
    constructor(felony: Felony);
    /**
     * Handler method that will return the response.
     *
     * @param {Request} request
     * @param {Response} response
     * @return {Promise<any>}
     */
    handle(request: Request, response: Response): Promise<any>;
    /**
     * Load middleware files and prepare them for execution.
     *
     * @return {Promise<Middleware[]>}
     */
    getMiddleware(): Promise<Middleware[]>;
    /**
     * Load the middleware and validate its correct class.
     *
     * @param {Middleware|string} middleware
     * @return {Promise<Middleware>}
     */
    loadMiddleware(middleware: Middleware | string): Promise<Middleware>;
}

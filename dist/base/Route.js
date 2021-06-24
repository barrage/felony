import path from "path";
import { promises as fs } from "fs";
import Middleware from "./Middleware.js";
/**
 * Base route class that defines basic attributes that the route will have to have.
 *
 * @class
 */
export default class Route {
    /**
     * @param {Felony} felony
     */
    constructor(felony) {
        /**
         * Property lettings us know what kind of class this is
         *
         * @type {string}
         * @private
         */
        this.__kind = "Route";
        /**
         * HTTP method used for this route
         *
         * @type {string}
         */
        this.method = "";
        /**
         * HTTP path path after the hostname for this route
         *
         * @type {string}
         */
        this.path = "";
        /**
         * Description of this route that will be used while loading to describe this route
         *
         * @type {string}
         */
        this.description = "";
        /**
         * Internal path to route file location for logging.
         *
         * @type {string}
         */
        this.__path = "";
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
        this.middleware = [];
        this.felony = felony;
    }
    /**
     * Handler method that will return the response.
     *
     * @param {Request} request
     * @param {Response} response
     * @return {Promise<any>}
     */
    async handle(request, response) {
        response.status(401).send({ message: "Not found" });
    }
    /**
     * Load middleware files and prepare them for execution.
     *
     * @return {Promise<Middleware[]>}
     */
    async getMiddleware() {
        const pipeline = [];
        if (this.middleware) {
            if (Array.isArray(this.middleware)) {
                for (const middleware of this.middleware) {
                    const Mid = await this.loadMiddleware(middleware);
                    // @ts-ignore
                    pipeline.push(new Mid(this.felony));
                }
            }
            // @ts-ignore
            else {
                const Mid = await this.loadMiddleware(this.middleware);
                // @ts-ignore
                pipeline.push(new Mid(this.felony));
            }
        }
        return pipeline;
    }
    /**
     * Load the middleware and validate its correct class.
     *
     * @param {Middleware|string} middleware
     * @return {Promise<Middleware>}
     */
    async loadMiddleware(middleware) {
        if (!middleware) {
            throw new Error(`Route: Middleware '${middleware}' is not processable entity`);
        }
        // @ts-ignore
        else if (middleware instanceof Middleware || middleware.__kind === "Middleware") {
            // @ts-ignore
            return middleware;
        }
        else if (typeof middleware !== "string") {
            throw new Error(`Route: Middleware '${middleware}' is not processable file`);
        }
        let _path = middleware;
        if (middleware.slice(0, 2) === "..") {
            _path = path.resolve(`${this.felony.appRootPath}`, middleware);
        }
        if (middleware.slice(0, 1) === ".") {
            _path = path.resolve(`${this.felony.appRootPath}`, middleware);
        }
        const stat = await fs.stat(_path);
        let importPath = _path;
        if (process.platform === "win32") {
            importPath = `file://${importPath}`;
        }
        if (!stat.isFile()) {
            throw new Error(`Route: Middleware '${middleware}' which resolved to '${_path}' is not a processable file.`);
        }
        const Imported = (await import(importPath)).default || null;
        if (!Imported) {
            throw new Error(`Route: Middleware '${middleware}' which resolved to '${_path}' failed loading, check that it has default export.`);
        }
        const Instance = new Imported();
        if (Instance instanceof Middleware && Instance.__kind === "Middleware") {
            return Instance;
        }
        throw new Error(`Route: Middleware '${middleware}' which resolved to '${_path}' could not be loaded.`);
    }
}
/**
 * Static property lettings us know what kind of class this is
 *
 * @type {string}
 * @private
 */
Route.__kind = "Route";
//# sourceMappingURL=Route.js.map
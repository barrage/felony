import path from "path";
import { promises as fs } from "fs";
import Middleware from "./Middleware.js";
import { app as Felony } from "../Felony.js";

/**
 * Base route class that defines basic attributes that the route will have to have.
 *
 * @class
 */
export default class Route {
  /**
   * HTTP method used for this route
   *
   * @type string
   */
  method = "";

  /**
   * HTTP path path after the hostname for this route
   *
   * @type string
   */
  path = "";

  /**
   * Description of this route that will be used while loading to describe this route
   *
   * @type string
   */
  description = "";

  /**
   * Internal path to route file location for logging.
   *
   * @type string
   */
  __path = "";

  /**
   * Array containing all the middleware that will be launched before request
   * enters this route.
   *
   * Types allowed for this define:
   * @type string[] | string | Middleware[] | Middleware
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
  middleware = [];

  /**
   * Handler method that will return the response.
   *
   * @param request
   * @param response
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
          pipeline.push(await Route.loadMiddleware(middleware));
        }
      }
      else {
        pipeline.push(await Route.loadMiddleware(this.middleware));
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
  static async loadMiddleware(middleware) {
    if (!middleware) {
      throw new Error(`Route: Middleware '${middleware}' is not processable entity`);
    }
    else if (middleware instanceof Middleware) {
      return middleware;
    }
    else if (typeof middleware !== "string") {
      throw new Error(`Route: Middleware '${middleware}' is not processable file`);
    }

    let _path = middleware;

    if (middleware.slice(0, 2) === "..") {
      _path = path.resolve(`${Felony.appRootPath}/routes`, middleware);
    }

    if (middleware.slice(0, 1) === ".") {
      _path = path.resolve(`${Felony.appRootPath}/routes`, middleware);
    }

    const stat = await fs.stat(_path);

    if (!stat.isFile()) {
      throw new Error(`Route: Middleware '${middleware}' which resolved to '${_path}' is not a processable file.`);
    }

    const Imported = (await import(_path)).default || null;

    if (!Imported) {
      throw new Error(`Route: Middleware '${middleware}' which resolved to '${_path}' failed loading, check that it has default export.`);
    }

    const Instance = new Imported();

    if (Instance instanceof Middleware) {
      return Instance;
    }

    throw new Error(`Route: Middleware '${middleware}' which resolved to '${_path}' could not be loaded.`);
  }
}

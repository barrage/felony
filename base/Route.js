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
   * This array will be filled with whatever you give it under middleware
   *
   * @type Middleware[]
   */
  _middleware = [];

  /**
   * Handler method that will return the response.
   *
   * @param request
   * @return {Promise<any>}
   */
  async handle(request) {
    return {};
  }

  /**
   * Gracefully respond to error.
   *
   * @param context
   * @param error
   */
  async handleError(context, error) {
    const errorResponse = {
      status: 500,
      body: { message: "Something went wrong" },
    };

    if (
      error && typeof error === "object" && (error.statusCode || error.status)
    ) {
      errorResponse.status = parseInt(error.statusCode || error.status);
    }

    if (error && typeof error === "object" && error.message) {
      errorResponse.body = { message: error.message };
    }

    if (Felony.arguments.debug) {
      // @ts-ignore
      errorResponse.body.stack = Felony.getStack(error);
    }

    console.error({
      Route: this.__path,
      ...errorResponse,
      stack: Felony.getStack(error),
    });

    context.response.body = errorResponse.body;
    // context.response.status = errorResponse.status;
  }

  /**
   * Load middleware files and prepare them for execution.
   *
   * @return {Promise<Middleware[]>}
   */
  async getMiddleware() {
    const pipeline = [];

    if (this.middleware instanceof Middleware) {
      pipeline.push(this.middleware);
    }
    else if (typeof this.middleware === "string") {
      const loaded = await Route.loadMiddleware(this.middleware);

      if (loaded instanceof Middleware) {
        pipeline.push(loaded);
      }
    }
    else if (Array.isArray(this.middleware)) {
      for (const mid of this.middleware) {
        if (mid instanceof Middleware) {
          pipeline.push(mid);
        }
        else if (typeof mid === "string") {
          const loaded = await Route.loadMiddleware(mid);

          if (loaded instanceof Middleware) {
            pipeline.push(loaded);
          }
        }
      }
    }

    return pipeline;
  }

  /**
   * Load the middleware and validate its correct class.
   *
   * @param p
   * @return {Promise<Middleware>}
   */
  static async loadMiddleware(p) {
    let _path = p;

    if (p.slice(0, 2) === "..") {
      _path = path.resolve(`${Felony.appRootPath}/routes`, p);
    }

    if (p.slice(0, 1) === ".") {
      _path = path.resolve(`${Felony.appRootPath}/routes`, p);
    }

    try {
      const stat = await fs.stat(_path);

      if (!stat.isFile()) {
        throw new Error(`Route: Middleware ${path} is not a processable .js file.`);
      }
    } catch (error) {
      throw error;
    }

    const Imported = (await import(_path)).default || null;

    if (!Imported) {
      throw new Error(`Route: Middleware ${_path} failed loading, check that it has default export.`);
    }

    const Instance = new Imported();

    if (Instance instanceof Middleware) {
      return Instance;
    }

    throw new Error(`Route: Middleware ${_path} could not be loaded.`);
  }
}

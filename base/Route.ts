import path from "path";
import { promises as fs } from "fs";
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
  static __kind: string = "Route";

  /**
   * Property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  __kind: string = "Route";

  /**
   * HTTP method used for this route
   *
   * @type {string}
   */
  method: string = "";

  /**
   * HTTP path path after the hostname for this route
   *
   * @type {string}
   */
  path: string = "";

  /**
   * Description of this route that will be used while loading to describe this route
   *
   * @type {string}
   */
  description: string = "";

  /**
   * Internal path to route file location for logging.
   *
   * @type {string}
   */
  __path: string = "";

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
  middleware: string[] | string | Middleware[] | Middleware = [];

  /**
   * @type {Felony}
   */
  felony: Felony;

  /**
   * @param {Felony} felony
   */
  constructor(felony: Felony) {
    this.felony = felony;
  }

  /**
   * Handler method that will return the response.
   *
   * @param {Request} request
   * @param {Response} response
   * @return {Promise<any>}
   */
  async handle(request: Request, response: Response): Promise<any> {
    response.status(401).send({ message: "Not found" });
  }

  /**
   * Load middleware files and prepare them for execution.
   *
   * @return {Promise<Middleware[]>}
   */
  async getMiddleware(): Promise<Middleware[]> {
    const pipeline = [];

    if (this.middleware) {
      if (Array.isArray(this.middleware)) {
        for (const middleware of this.middleware) {
          const Mid = await this.loadMiddleware(middleware);

          if (this.felony.isConstructor(Mid)) {
            // @ts-ignore
            pipeline.push(new Mid(this.felony));
          } else {
            pipeline.push(Mid);
          }
        }
      }
      // @ts-ignore
      else {
        const Mid = await this.loadMiddleware(this.middleware);

        if (this.felony.isConstructor(Mid)) {
          // @ts-ignore
          pipeline.push(new Mid(this.felony));
        } else {
          pipeline.push(Mid);
        }
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
  async loadMiddleware(middleware: Middleware | string): Promise<Middleware> {
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

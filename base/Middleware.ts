import { Request, Response } from "express";
import Felony from "../Felony";

export interface MiddlewareInterface {
  handle(request: Request, response: Response, next: Function): Promise<any>;
}

/**
 * Definition for each middleware
 *
 * @class
 */
export default class Middleware implements MiddlewareInterface {
  /**
   * Static property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  static __kind: string = "Middleware";

  /**
   * Property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  __kind: string = "Middleware";

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
   * This is the middleware action handler.
   *
   *  - If you set context.response.body within any of the middleware
   *    it will stop propagation through other middleware and request
   *    won't reach the route.
   *
   * @param {Request} request
   * @param {Response} response
   * @param {Function} next
   * @return {Promise<any>}
   *
   * @throws any
   *  - Throwing error will stop request propagation through
   *    other middleware and will stop it from reaching the route.
   */
  async handle(request: Request, response: Response, next: Function): Promise<any> {
    next();
  }
}

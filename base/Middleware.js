/**
 * Definition for each middleware
 *
 * @class
 */
export default class Middleware {
  /**
   * Static property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  static __kind = "Middleware";

  /**
   * Property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  __kind = "Middleware";

  /**
   * This is the middleware action handler.
   *
   *  - If you set context.response.body within any of the middleware
   *    it will stop propagation through other middleware and request
   *    won't reach the route.
   *
   * @param {any} request
   * @param {any} response
   * @param {Function} next
   * @return {Promise<any>}
   *
   * @throws any
   *  - Throwing error will stop request propagation through
   *    other middleware and will stop it from reaching the route.
   */
  async handle(request, response, next) {
    next();
  }
}

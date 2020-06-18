/**
 * Definition for each middleware
 *
 * @class
 */
export default class Middleware {
  /**
   * This is the middleware action handler.
   *
   *  - If you set context.response.body within any of the middleware
   *    it will stop propagation through other middleware and request
   *    won't reach the route.
   *
   * @param {any} context
   * @return {Promise<any>}
   *
   * @throws any
   *  - Throwing error will stop request propagation through
   *    other middleware and will stop it from reaching the route.
   */
  async handle(context) {
    return false;
  }
}

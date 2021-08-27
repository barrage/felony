import Middleware from "../../dist/base/Middleware.js";

export default class TestMiddleware extends Middleware {
  handle(request, response, next) {
    request.body = { isMiddlewareActive: true };

    next();
  }
}

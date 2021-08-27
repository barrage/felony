import Middleware from "../../dist/base/Middleware.js";

export default class TestMiddleware extends Middleware {
  handle(request, response, next) {
    if (typeof request.body.data !== "number") {
      return response.status(422).send("Validation Error");
    }

    next();
  }
}

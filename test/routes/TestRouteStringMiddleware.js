import Route from "../../dist/base/Route.js";

export default class TestRouteInstancedMiddleware extends Route {
  method = "GET";

  path = "/test-string-middleware";

  description = "";

  middleware = ["../test/middleware/TestMiddleware.js"];

  async handle(request, response) {
    response
      .status(200)
      .send({
        isMiddlewareActive: request.body.isMiddlewareActive, // loaded from test middleware
        test: "ok",
      });
  }
}

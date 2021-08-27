import Route from "../../dist/base/Route.js";
import TestMiddleware from "../middleware/TestMiddleware.js";

export default class TestRouteInstancedMiddleware extends Route {
  method = "GET";

  path = "/test-instanced-middleware";

  description = "";

  middleware = [new TestMiddleware()];

  async handle(request, response) {
    response.status(200).send({ test: "ok" });
  }
}

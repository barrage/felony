import Route from "../../dist/base/Route.js";
import TestMiddleware from "../middleware/TestMiddleware.js";

export default class TestRouteInstancedMiddleware extends Route {
  method = "GET";

  path = "/test-class-middleware";

  description = "";

  middleware = [TestMiddleware];

  async handle(request, response) {
    response.status(200).send({ test: "ok" });
  }
}

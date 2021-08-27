import Route from "../../dist/base/Route.js";
import ValidationTestMiddleware from "../middleware/ValidationTestMiddleware.js";

export default class TestRouteInstancedMiddleware extends Route {
  method = "POST";

  path = "/test-validation-middleware";

  description = "";

  middleware = [ValidationTestMiddleware];

  async handle(request, response) {
    response
      .status(200)
      .send({
        test: "ok",
      });
  }
}

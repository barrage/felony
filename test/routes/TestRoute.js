import Route from "../../dist/base/Route.js";

export default class TestRoute extends Route {
  method = "GET";

  path = "/test";

  description = "";

  middleware = [];

  async handle(request, response) {
    response.status(200).send({ test: "ok" });
  }
}

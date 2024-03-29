import assert from "assert";
import F from "../dist/Felony.js";
import Kernel from "../dist/src/Kernel.js";
import Bus from "../dist/src/events/Bus.js";
import Logger from "../dist/src/log/Logger.js";
import Worker from "../dist/src/queue/Worker.js";
import Connector from "../dist/src/database/Connector.js";
import Server from "../dist/src/http/Server.js";
import debug from "debug";
import * as regularFs from "fs";
import path from "path";
import request from "supertest";

const fs = regularFs.promises;

const appRootPath = path.resolve(process.cwd(), "test");
const log = debug("out"); // eslint-disable-line

let instance;

describe("Felony", async function () {
  before(async function beforeHook() {
    instance = new F(appRootPath, { exit: false, silent: true, http: true });
    await instance.commit();
  });
  after(async function afterHook() {
    const stat = await fs.stat(path.resolve(appRootPath, "commands"));

    if (stat.isDirectory()) {
      regularFs.rmSync(path.resolve(appRootPath, "commands"), { recursive: true });
    }

    setTimeout(() => {
      process.exit(0);
    }, 2000);
  });

  it("Should load itself and have all the instances on itself", async function () {
    assert.strictEqual(instance.kernel instanceof Kernel, true, "Felony not loaded properly, kernel not loaded");
    assert.strictEqual(instance.event instanceof Bus, true, "Felony not loaded properly, event bus not loaded");
    assert.strictEqual(instance.queue instanceof Worker, true, "Felony not loaded properly, queue not loaded");
    assert.strictEqual(instance.db instanceof Connector, true, "Felony not loaded properly, database connector not loaded");
    assert.strictEqual(instance.log instanceof Logger, true, "Felony not loaded properly, logger not loaded");
    assert.strictEqual(instance.kernel.server instanceof Server, true, "Felony not loaded properly, http server not loaded");
  });

  it("Should display all the integrated commands", function () {
    assert.strictEqual(instance.kernel.console.commands.length > 0, true);
  });

  it("Should generate a js command from stub", async function () {
    await instance.kernel.console.run("make:command", { name: "ExampleCommandJS.js", signature: "example" });

    const stat = await fs.stat(path.resolve(instance.appRootPath, "commands", "ExampleCommandJS.js"));

    assert.strictEqual(stat.isFile(), true);

    try {
      await instance.kernel.console.run("make:command", { name: "ExampleCommandJS.js", signature: "example" });

      // shouldn't get here...
      assert.strictEqual(true, false);
    }
    catch (e) {
      assert.strictEqual(e.message.split("\n")[0].startsWith("MakeCommand:"), true);
    }
  });

  it("Should generate a ts command from stub", async function () {
    await instance.kernel.console.run("make:command", { name: "ExampleCommandTS.ts", signature: "example" });

    const stat = await fs.stat(path.resolve(instance.appRootPath, "commands", "ExampleCommandTS.ts"));

    assert.strictEqual(stat.isFile(), true);

    try {
      await instance.kernel.console.run("make:command", { name: "ExampleCommandTS.ts", signature: "example" });

      // shouldn't get here...
      assert.strictEqual(true, false);
    }
    catch (e) {
      assert.strictEqual(e.message.split("\n")[0].startsWith("MakeCommand:"), true);
    }
  });

  it("Should have loaded the route from test file", function () {
    assert.notEqual(instance.kernel.server.routes, 0, "Router array empty, no routes are loaded!");
  });

  it("Should return a response from the test route", function (done) {
    request(instance.kernel.server.application)
      .get("/test")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200, done);
  });

  it("Should return a response from the test route with middleware instance", function (done) {
    request(instance.kernel.server.application)
      .get("/test-instanced-middleware")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(
        200,
        {
          test: "ok",
          isMiddlewareActive: true,
        },
        done,
      );
  });

  it("Should return a response from the test route with middleware class", function (done) {
    request(instance.kernel.server.application)
      .get("/test-class-middleware")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(
        200,
        {
          test: "ok",
          isMiddlewareActive: true,
        },
        done,
      );
  });

  it("Should return a response from the test route with middleware string", function (done) {
    request(instance.kernel.server.application)
      .get("/test-string-middleware")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(
        200,
        {
          test: "ok",
          isMiddlewareActive: true,
        },
        done,
      );
  });

  it("Should return an unprocessable entity response, body format is invalid", function (done) {
    request(instance.kernel.server.application)
      .post("/test-validation-middleware")
      .send({
        data: "this is invalid data the middleware expects data to be number",
      })
      .set("Accept", "application/json")
      .expect(
        422,
        "Validation Error",
        done,
      );
  });

  it("Should return ok code, body is of correct format", function (done) {
    request(instance.kernel.server.application)
      .post("/test-validation-middleware")
      .send({
        data: 2.321,
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(
        200,
        { test: "ok" },
        done,
      );
  });
});

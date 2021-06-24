import assert from "assert";
import F from "../dist/Felony.js";
import Kernel from "../dist/src/Kernel.js";
import Bus from "../dist/src/events/Bus.js";
import Logger from "../dist/src/log/Logger.js";
import Worker from "../dist/src/queue/Worker.js";
import Connector from "../dist/src/database/Connector.js";
import debug from "debug";
import * as regularFs from "fs";
import path from "path";

const fs = regularFs.promises;

const appRootPath = path.resolve(process.cwd(), "test");
const log = debug("out"); // eslint-disable-line

let instance;

describe("Felony", async function () {
  before(async function beforeHook() {
    instance = new F(appRootPath, { exit: false, silent: true });
    await instance.commit();
  });
  after(async function afterHook() {
    const stat = await fs.stat(path.resolve(appRootPath, "commands"));

    if (stat.isDirectory()) {
      regularFs.rmSync(path.resolve(appRootPath, "commands"), { recursive: true });
    }
  });

  it("Should load itself and have all the instances on itself", async function () {
    assert.strictEqual(instance.kernel instanceof Kernel, true, "Felony not loaded properly, kernel not loaded");
    assert.strictEqual(instance.event instanceof Bus, true, "Felony not loaded properly, event bus not loaded");
    assert.strictEqual(instance.queue instanceof Worker, true, "Felony not loaded properly, queue not loaded");
    assert.strictEqual(instance.db instanceof Connector, true, "Felony not loaded properly, database connector not loaded");
    assert.strictEqual(instance.log instanceof Logger, true, "Felony not loaded properly, logger not loaded");
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
});

import assert from "assert";
import { Felony as F } from "../Felony.js";
import Kernel from "../src/Kernel.js";
import Bus from "../src/events/Bus.js";
import Logger from "../src/log/Logger.js";
import Worker from "../src/queue/Worker.js";
import Connector from "../src/database/Connector.js";

describe("Felony", function () {
  it("Should load itself and have ", async function () {
    globalThis.Felony = new F(process.cwd(), { exit: false, silent: true });

    await Felony.commit();

    assert.strictEqual(Felony.kernel instanceof Kernel, true, "Felony not loaded properly, kernel not loaded");
    assert.strictEqual(Felony.event instanceof Bus, true, "Felony not loaded properly, event bus not loaded");
    assert.strictEqual(Felony.queue instanceof Worker, true, "Felony not loaded properly, queue not loaded");
    assert.strictEqual(Felony.db instanceof Connector, true, "Felony not loaded properly, database connector not loaded");
    assert.strictEqual(Felony.log instanceof Logger, true, "Felony not loaded properly, logger not loaded");
  });
});

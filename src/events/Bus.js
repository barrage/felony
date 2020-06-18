import Listener from "../../base/Listener.js";
import { app as Felony } from "../../Felony.js";
import FelonyEvent from "../../base/FelonyEvent.js";

/**
 * Event Bus that handles registering listeners and raising events.
 *
 * @class
 */
export default class Bus {
  /**
   * Array of all the registered listeners.
   *
   * @type {Listener[]}
   */
  listeners = [];

  /**
   * Dispatch event from anywhere in the application.
   *
   * @param {FelonyEvent} event
   * @return {Promise<void>}
   */
  async raise(event) {
    if (event instanceof FelonyEvent) {
      for (const L of this.listeners) {
        if (L.listen.indexOf(event.constructor.name) === -1) {
          continue;
        }

        // @ts-ignore
        const Instance = new L(event);

        if (typeof Instance.handle === "function") {
          await Instance.handle();
        }
      }
    }
  }

  /**
   * Loader for event listeners.
   *
   * @return {Promise<void>}
   */
  async load() {
    const listeners = await Felony.kernel.readRecursive(
      `${Felony.appRootPath}/listeners/`,
      ".js",
    );

    for (const db of listeners) {
      const Imported = await import(db);

      if (Imported && Imported.default && Array.isArray(Imported.default.listen)) {
        this.listeners.push(Imported.default);
      }
    }
  }
}

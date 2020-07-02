import path from "path";
import Listener from "../../base/Listener.js";
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
   * @param {Felony} felony
   */
  constructor(felony) {
    /**
     * @type Felony
     */
    this.felony = felony;
  }

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
    const listeners = await this.felony.kernel.readRecursive(path.resolve(this.felony.appRootPath, "listeners"));
    const _listeners = await this.felony.kernel.readRecursive(path.resolve(this.felony.felonyPath, "support", "listeners"));

    for (const listener of _listeners) {
      listeners.push(listener);
    }

    for (const listener of listeners) {
      const Imported = await import(listener);

      if (Imported && Imported.default && Array.isArray(Imported.default.listen)) {
        this.listeners.push(Imported.default);
      }
    }
  }
}

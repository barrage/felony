import path from "path";
import Listener from "../../base/Listener";
import FelonyEvent from "../../base/FelonyEvent";
import Felony from "../../Felony";

/**
 * Event Bus that handles registering listeners and raising events.
 *
 * @class
 */
export default class Bus {
  /**
   * Array of all the registered listeners.
   *
   * @type {Array<typeof Listener>}
   */
  listeners: Array<typeof Listener> = [];

  /**
    * @type {Felony}
    */
  felony: Felony;

  /**
   * @param {Felony} felony
   */
  constructor(felony: Felony) {
    this.felony = felony;
  }

  /**
   * Dispatch event from anywhere in the application.
   *
   * @param {FelonyEvent} event
   * @return {Promise<any>}
   */
  async raise(event: FelonyEvent): Promise<any> {
    if (event && event.__kind === "FelonyEvent") {
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
   * @return {Promise<any>}
   */
  async load(): Promise<any> {
    const listeners = await this.felony.kernel.readRecursive(path.resolve(this.felony.appRootPath, "listeners"));
    const _listeners = await this.felony.kernel.readRecursive(path.resolve(this.felony.felonyPath, "support", "listeners"));

    for (const listener of _listeners) {
      listeners.push(listener);
    }

    for (const listener of listeners) {
      const Imported = await import(listener);

      if (Imported && Imported.default && Imported.default.__kind === "Listener") {
        this.listeners.push(Imported.default);
      }
    }
  }
}

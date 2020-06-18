import FelonyEvent from "./FelonyEvent.js";

/**
 * Listener definition for listening on raised events during the runtime.
 *
 * @class
 */
export default class Listener {
  /**
   * List of events that this listener will listen to
   *
   * @type {string[]}
   */
  static listen = [];

  /**
   * After construction this is where the Event will be stored.
   *
   * @type {FelonyEvent}
   */
  event;

  /**
   * Constructor of the listener that will get implementation of
   * Event passed to it.
   *
   * @param {FelonyEvent} event
   */
  constructor(event) {
    this.event = event;
  }

  /**
   * Handler on the listener class that will do something
   * with forwarded job.
   *
   * @return {Promise<any>}
   */
  async handle() {}
}

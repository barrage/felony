import FelonyEvent from "../../base/FelonyEvent.js";

/**
 * Event triggered after felony has compiled the server and just before
 * the server to listen on HTTP is lifted.
 *
 * @class
 */
export default class FelonyServerReady extends FelonyEvent {
  /**
   * @type {Server|null}
   */
  server = null;

  /**
   * Construct the event
   * @param {Server} server
   */
  constructor(server) {
    super();
    this.server = server;
  }
}

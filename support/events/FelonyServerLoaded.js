import FelonyEvent from "../../base/FelonyEvent.js";

/**
 * Event triggered after felony collects routes, loads all the routes
 * and before it starts compiling the server.
 *
 * @class
 */
export default class FelonyServerLoaded extends FelonyEvent {
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

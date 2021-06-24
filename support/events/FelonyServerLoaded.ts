import FelonyEvent from "../../base/FelonyEvent";
import Server from "../../src/http/Server";

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
  server: Server = null;

  /**
   * Construct the event
   * @param {Server} server
   */
  constructor(server: Server) {
    super();
    this.server = server;
  }
}

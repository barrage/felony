import FelonyEvent from "../../base/FelonyEvent";
import Server from "../../src/http/Server";

/**
 * Event triggered after felony has compiled the server and just before
 * the server to listen on HTTP is lifted.
 *
 * @class
 */
export default class FelonyServerListening extends FelonyEvent {
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

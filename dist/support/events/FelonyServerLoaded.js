import FelonyEvent from "../../base/FelonyEvent.js";
/**
 * Event triggered after felony collects routes, loads all the routes
 * and before it starts compiling the server.
 *
 * @class
 */
export default class FelonyServerLoaded extends FelonyEvent {
    /**
     * Construct the event
     * @param {Server} server
     */
    constructor(server) {
        super();
        /**
         * @type {Server|null}
         */
        this.server = null;
        this.server = server;
    }
}
//# sourceMappingURL=FelonyServerLoaded.js.map
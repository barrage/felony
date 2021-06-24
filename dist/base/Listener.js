/**
 * Listener definition for listening on raised events during the runtime.
 *
 * @class
 */
export default class Listener {
    /**
     * Constructor of the listener that will get implementation of
     * Event passed to it.
     *
     * @param {typeof FelonyEvent|FelonyEvent|FelonyEventInterface} event
     */
    constructor(event) {
        /**
         * Property lettings us know what kind of class this is
         *
         * @type {string}
         * @private
         */
        this.__kind = "Listener";
        this.event = event;
    }
    /**
     * Handler on the listener class that will do something
     * with forwarded job.
     *
     * @return {Promise<any>}
     */
    async handle() { }
}
/**
 * Static property lettings us know what kind of class this is
 *
 * @type {string}
 * @private
 */
Listener.__kind = "Listener";
/**
 * List of events that this listener will listen to
 *
 * @type {string[]}
 */
Listener.listen = [];
//# sourceMappingURL=Listener.js.map
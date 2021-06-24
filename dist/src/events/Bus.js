import path from "path";
/**
 * Event Bus that handles registering listeners and raising events.
 *
 * @class
 */
export default class Bus {
    /**
     * @param {Felony} felony
     */
    constructor(felony) {
        /**
         * Array of all the registered listeners.
         *
         * @type {Array<typeof Listener>}
         */
        this.listeners = [];
        this.felony = felony;
    }
    /**
     * Dispatch event from anywhere in the application.
     *
     * @param {FelonyEvent} event
     * @return {Promise<any>}
     */
    async raise(event) {
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
    async load() {
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
//# sourceMappingURL=Bus.js.map
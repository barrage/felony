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
    listeners: Array<typeof Listener>;
    /**
      * @type {Felony}
      */
    felony: Felony;
    /**
     * @param {Felony} felony
     */
    constructor(felony: Felony);
    /**
     * Dispatch event from anywhere in the application.
     *
     * @param {FelonyEvent} event
     * @return {Promise<any>}
     */
    raise(event: FelonyEvent): Promise<any>;
    /**
     * Loader for event listeners.
     *
     * @return {Promise<any>}
     */
    load(): Promise<any>;
}

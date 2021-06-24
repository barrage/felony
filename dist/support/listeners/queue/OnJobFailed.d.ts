import Listener from "../../../base/Listener";
/**
 * Event listener that will trigger on the events you add in listen array
 *
 * @class
 */
export default class OnJobFailed extends Listener {
    /**
     * List of event constructor names that this listener will be triggered for
     *
     * @type {string[]}
     */
    static listen: string[];
    /**
     * Handler that will trigger after the event was raised, event will be available under this.event: Event
     *
     * @return {Promise<void>}
     */
    handle(): Promise<void>;
}

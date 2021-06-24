import FelonyEvent from "../../base/FelonyEvent.js";
/**
 * Event triggered after Felony dispatches a job
 *
 * @class
 */
export default class FelonyJobDispatched extends FelonyEvent {
    /**
     * Construct the event
     * @param {Job} job
     */
    constructor(job) {
        super();
        /**
         * @type {Job|null}
         */
        this.job = null;
        this.job = job;
    }
}
//# sourceMappingURL=FelonyJobDispatched.js.map
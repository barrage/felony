import FelonyEvent from "../../base/FelonyEvent.js";
/**
 * Event triggered after Felony finishes job
 *
 * @class
 */
export default class FelonyJobFinished extends FelonyEvent {
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
//# sourceMappingURL=FelonyJobFinished.js.map
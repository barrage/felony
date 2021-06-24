import FelonyEvent from "../../base/FelonyEvent.js";
/**
 * Event triggered after Felony fails job
 *
 * @class
 */
export default class FelonyJobFailed extends FelonyEvent {
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
//# sourceMappingURL=FelonyJobFailed.js.map
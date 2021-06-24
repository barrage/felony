import FelonyEvent from "../../base/FelonyEvent.js";
/**
 * Event triggered after Felony starts working a job, this event will raise on every consecutive job retry
 *
 * @class
 */
export default class FelonyJobStarted extends FelonyEvent {
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
//# sourceMappingURL=FelonyJobStarted.js.map
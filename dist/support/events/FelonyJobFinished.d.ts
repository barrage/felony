import Job from "../../base/Job";
import FelonyEvent from "../../base/FelonyEvent";
/**
 * Event triggered after Felony finishes job
 *
 * @class
 */
export default class FelonyJobFinished extends FelonyEvent {
    /**
     * @type {Job|null}
     */
    job: Job;
    /**
     * Construct the event
     * @param {Job} job
     */
    constructor(job: Job);
}

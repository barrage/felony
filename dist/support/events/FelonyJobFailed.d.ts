import Job from "../../base/Job";
import FelonyEvent from "../../base/FelonyEvent";
/**
 * Event triggered after Felony fails job
 *
 * @class
 */
export default class FelonyJobFailed extends FelonyEvent {
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

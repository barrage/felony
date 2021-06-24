import Job from "../../base/Job";
import FelonyEvent from "../../base/FelonyEvent";
/**
 * Event triggered after Felony dispatches a job
 *
 * @class
 */
export default class FelonyJobDispatched extends FelonyEvent {
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

import Job from "../../base/Job.js";
import FelonyEvent from "../../base/FelonyEvent.js";

/**
 * Event triggered after Felony finishes job
 *
 * @class
 */
export default class FelonyJobFinished extends FelonyEvent {
  /**
   * @type {Job|null}
   */
  job = null;

  /**
   * Construct the event
   * @param {Job} job
   */
  constructor(job) {
    super();
    this.job = job;
  }
}

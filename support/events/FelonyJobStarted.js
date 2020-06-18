import Job from "../../base/Job.js";
import FelonyEvent from "../../base/FelonyEvent.js";

/**
 * Event triggered after Felony starts working a job, this event will raise on every consecutive job retry
 *
 * @class
 */
export default class FelonyJobStarted extends FelonyEvent {
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

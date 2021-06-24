import Job from "../../base/Job";
import FelonyEvent from "../../base/FelonyEvent";

/**
 * Event triggered after Felony starts working a job, this event will raise on every consecutive job retry
 *
 * @class
 */
export default class FelonyJobStarted extends FelonyEvent {
  /**
   * @type {Job|null}
   */
  job: Job = null;

  /**
   * Construct the event
   * @param {Job} job
   */
  constructor(job: Job) {
    super();
    this.job = job;
  }
}

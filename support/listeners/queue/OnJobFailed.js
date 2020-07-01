import Listener from "../../../base/Listener.js";
import Worker from "../../../src/queue/Worker.js";
import { app as Felony } from "../../../Felony.js";

/**
 * Event listener that will trigger on the events you add in listen array
 *
 * @class
 */
export default class OnJobFailed extends Listener {
  /**
   * List of event constructor names that this listener will be triggered for
   *
   * @type {string[]}
   */
  static listen = [
      "FelonyJobFailed"
  ];

  /**
   * Handler that will trigger after the event was raised, event will be available under this.event: Event
   *
   * @return {Promise<void>}
   */
  async handle() {
    const payload = {
      status: "failed",
      job: this.event.job.toJson(),
    };

    await Worker.redis().publish(Worker.queue(Felony.arguments.queue), JSON.stringify(payload));
  }
}

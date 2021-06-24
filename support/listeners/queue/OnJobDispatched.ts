import Listener from "../../../base/Listener";
import Worker from "../../../src/queue/Worker";
/**
 * Event listener that will trigger on the events you add in listen array
 *
 * @class
 */
export default class OnJobDispatched extends Listener {
  /**
   * List of event constructor names that this listener will be triggered for
   *
   * @type {string[]}
   */
  static listen: string[] = [
    "FelonyJobDispatched",
  ];

  /**
   * Handler that will trigger after the event was raised, event will be available under this.event: Event
   *
   * @return {Promise<void>}
   */
  async handle(): Promise<void> {
    const payload = {
      status: "dispatched",
      // @ts-ignore :: there is a job on the given event, its just that the typescript doesn't know it
      job: this.event.job.toJson(),
    };

    // @ts-ignore
    if (this.event.job.queueOn) {
      // @ts-ignore
      await Worker.redis().publish(Worker.queue(this.event.job.queueOn), JSON.stringify(payload));
    }
  }
}

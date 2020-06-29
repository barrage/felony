import Worker from "../../../src/queue/Worker.js";
import Command from "../../../base/Command.js";

/**
 * Get status of jobs in queue and failed jobs on given queues by name
 *
 * @class
 */
export default class QueueStatusCommand extends Command {
  /**
   * Integrated command flag
   *
   * @type boolean
   */
  static integrated = true;

  /**
   * Static signature key that will be callable name of our command.
   *
   * @type string
   */
  static signature = "queue:status";

  /**
   * User friendly description of the command that has to be static.
   *
   * @type string
   */
  static description = "Get status of the queue instance";

  /**
   * Example of the command usage.
   *
   * @type string
   */
  static usage = "command=queue:status name=example-queue";

  /**
   * Handler method of the command that will run the action.
   *
   * @return {Promise<object[]>}
   */
  async handle() {
    if (typeof this.payload.name !== "string") {
      throw new Error(`QueueStatusCommand: please pass one or more queue names separated by comma`);
    }

    const queues = this.payload.name.split(",");
    const response = [];

    for (const name of queues) {
      response.push({
        queue: name,
        pending: await Worker.redis().client.llen(
          Worker.queue(this.payload.name),
        ),
        failed: await Worker.redis().client.llen(
          Worker.queue(`failed:${this.payload.name}`),
        ),
      });
    }

    if (this.cli === true) {
      console.table(response.map((item) => ({
        "Queue": item.queue,
        "Jobs in queue": item.pending,
        "Jobs in failed list": item.failed,
      })));
    }

    return response;
  }
}

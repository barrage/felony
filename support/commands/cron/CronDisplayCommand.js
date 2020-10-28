import path from "path";
import { CronTime } from "cron";
import cronstrue from "cronstrue";
import Command from "../../../base/Command.js";
import { app as Felony } from "../../../Felony.js";

/**
 * Hello world command used as an example.
 *
 * @class
 */
export default class CronDisplayCommand extends Command {
  /**
   * Static signature key that will be callable name of our command.
   *
   * @type string
   */
  static signature = "cron:display";

  /**
   * User friendly description of the command that has to be static.
   *
   * @type string
   */
  static description = "Display all the loaded crons that are active and time of their execution";

  /**
   * User friendly example of your command usage.
   *
   * @type string
   */
  static usage = "command=cron:display";

  /**
   * Handler method of the command that will run the action.
   *
   * @return {Promise<any>}
   */
  async handle() {
    const jobs = (await this.load()).map((job) => ({
      name: job.__path,
      schedule: job.schedule,
      "Human readable schedule": cronstrue.toString(job.schedule, {
        use24HourTimeFormat: true,
      }),
      next: new CronTime(job.schedule).sendAt().toDate(),
      active: job.active,
    }));

    if (this.cli) {
      Felony.log.table("This is a list of all CronJobs.");
      Felony.log.table(jobs);
    }

    return jobs;
  }

  /**
   * Load all the cron jobs available
   *
   * @return {Promise<Cron[]>}
   */
  async load() {
    const _jobs = await Felony.kernel.readRecursive(path.resolve(Felony.appRootPath, "crons"));
    const jobs = [];

    for (const job of _jobs) {
      const Imported = (await import(job)).default;
      let replacePath = `${path.resolve(Felony.appRootPath, "crons")}/`;
      if (job.startsWith("file://")) {
        replacePath = `file://${path.resolve(Felony.appRootPath, "crons")}/`;
      }
      Imported.__path = job.replace(replacePath, "");

      if (Imported.__kind === "Cron") {
        jobs.push(Imported);
      }
    }

    return jobs;
  }
}

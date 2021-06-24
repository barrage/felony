import path from "path";
import { CronTime } from "cron";
import cronstrue from "cronstrue";
import Command from "../../../base/Command.js";
/**
 * Hello world command used as an example.
 *
 * @class
 */
export default class CronDisplayCommand extends Command {
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
            this.console.kernel.felony.log.table("This is a list of all CronJobs.");
            this.console.kernel.felony.log.table(jobs);
        }
        return jobs;
    }
    /**
     * Load all the cron jobs available
     *
     * @return {Promise<Cron[]>}
     */
    async load() {
        const _jobs = await this.console.kernel.felony.kernel.readRecursive(path.resolve(this.console.kernel.felony.appRootPath, "crons"));
        const jobs = [];
        for (const job of _jobs) {
            const Imported = (await import(job)).default;
            let replacePath = `${path.resolve(this.console.kernel.felony.appRootPath, "crons")}/`;
            if (job.startsWith("file://")) {
                replacePath = `file://${path.resolve(this.console.kernel.felony.appRootPath, "crons")}/`;
            }
            Imported.__path = job.replace(replacePath, "");
            if (Imported.__kind === "Cron") {
                jobs.push(Imported);
            }
        }
        return jobs;
    }
}
/**
 * Static signature key that will be callable name of our command.
 *
 * @type {string}
 */
CronDisplayCommand.signature = "cron:display";
/**
 * User friendly description of the command that has to be static.
 *
 * @type {string}
 */
CronDisplayCommand.description = "Display all the loaded crons that are active and time of their execution";
/**
 * User friendly example of your command usage.
 *
 * @type {string}
 */
CronDisplayCommand.usage = "command=cron:display";
//# sourceMappingURL=CronDisplayCommand.js.map
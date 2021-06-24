import path from "path";
import { CronJob } from "cron";
/**
 * Runenr class that will load and run cron jobs
 *
 * @class
 */
export default class Runner {
    /**
     * @param {Felony} felony
     */
    constructor(felony) {
        /**
         * Array of loaded cron jobs
         *
         * @type {Array<typeof Cron>}
         */
        this._crons = [];
        /**
         * List of crons loaded and ready to run.
         *
         * @type {object[typeof Cron]}
         */
        this.crons = {};
        this.felony = felony;
    }
    /**
     * Load all the available jobs onto the worker.
     *
     * @return {Promise<void>}
     */
    async load() {
        const jobs = await this.felony.kernel.readRecursive(path.resolve(this.felony.appRootPath, "crons"));
        for (const job of jobs) {
            const Imported = (await import(job)).default;
            let replacePath = `${path.resolve(this.felony.appRootPath, "crons")}/`; // we need to adjust the path depending on operating system
            if (job.startsWith("file://")) {
                replacePath = `file://${path.resolve(this.felony.appRootPath, "crons")}/`;
            }
            Imported.__path = job.replace(replacePath, "");
            if (Imported.__kind === "Cron" && Imported.active) {
                this._crons.push(Imported);
            }
        }
    }
    /**
     * Run the crons if arguments allow it
     *
     * @return {Promise<any>}
     */
    async run() {
        if (!this.felony.arguments.cron) {
            return;
        }
        await this.load();
        for (const Job of this._crons) {
            const job = new Job();
            this.crons[Job.__path] = {
                job,
                cron: new CronJob(Job.schedule, async () => {
                    try {
                        await job.handle();
                    }
                    catch (error) {
                        this.felony.log.error(error);
                    }
                }, null, true, "UTC"),
            };
        }
    }
}
//# sourceMappingURL=Runner.js.map
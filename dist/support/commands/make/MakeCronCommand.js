import Make from "./Make.js";
/**
 * Generator command
 *
 * @class
 */
export default class MakeCronCommand extends Make {
    /**
     * Handler method of the command that will run the action.
     *
     * @return {Promise<void>}
     */
    async handle() {
        if (typeof this.payload.name !== "string"
            || (!this.payload.name.endsWith(".js")
                && !this.payload.name.endsWith(".ts"))) {
            throw new Error("MakeCronCommand: Invalid cron name provided");
        }
        if (typeof this.payload.schedule !== "string") {
            throw new Error("MakeCronCommand: Invalid cron schedule provided");
        }
        const replacements = {
            CRON_NAME: this.payload.name.split("/").pop().replace(".js", "").replace(".ts", ""),
            CRON_SCHEDULE: this.payload.schedule,
        };
        const content = await this.createFile(this.stubsDir(this.payload.name, "Cron.stub"), replacements);
        await this.storeFile(`crons/${this.payload.name}`, content);
        console.log(`Cron ${replacements.CRON_NAME} created successfully`);
    }
}
/**
 * Integrated command flag
 *
 * @type {boolean}
 */
MakeCronCommand.integrated = true;
/**
 * Static signature key that will be callable name of our command.
 *
 * @type {string}
 */
MakeCronCommand.signature = "make:cron";
/**
 * User friendly description of the command that has to be static.
 *
 * @type {string}
 */
MakeCronCommand.description = "Create new cron";
/**
 * Example of the command usage.
 *
 * @type {string}
 */
MakeCronCommand.usage = "command=make:cron name=ExampleCron.js schedule='* * * * *'";
//# sourceMappingURL=MakeCronCommand.js.map
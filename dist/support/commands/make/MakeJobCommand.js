import Make from "./Make.js";
/**
 * Generator command
 *
 * @class
 */
export default class MakeJobCommand extends Make {
    /**
     * Handler method of the command that will run the action.
     *
     * @return {Promise<void>}
     */
    async handle() {
        if (typeof this.payload.name !== "string"
            || (!this.payload.name.endsWith(".js")
                && !this.payload.name.endsWith(".ts"))) {
            throw new Error("MakeJobCommand: Invalid job name provided");
        }
        const replacements = {
            JOB_NAME: this.payload.name.split("/").pop().replace(".js", "").replace(".ts", ""),
        };
        const content = await this.createFile(this.stubsDir(this.payload.name, "Job.stub"), replacements);
        await this.storeFile(`jobs/${this.payload.name}`, content);
        console.log(`Job ${replacements.JOB_NAME} created successfully`);
    }
}
/**
 * Integrated command flag
 *
 * @type {boolean}
 */
MakeJobCommand.integrated = true;
/**
 * Static signature key that will be callable name of our command.
 *
 * @type {string}
 */
MakeJobCommand.signature = "make:job";
/**
 * User friendly description of the command that has to be static.
 *
 * @type {string}
 */
MakeJobCommand.description = "Create new job";
/**
 * Example of the command usage.
 *
 * @type {string}
 */
MakeJobCommand.usage = "command=make:job name=ExampleJob.js";
//# sourceMappingURL=MakeJobCommand.js.map
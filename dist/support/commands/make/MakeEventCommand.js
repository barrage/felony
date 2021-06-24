import Make from "./Make.js";
/**
 * Generator command
 *
 * @class
 */
export default class MakeEventCommand extends Make {
    /**
     * Handler method of the command that will run the action.
     *
     * @return {Promise<void>}
     */
    async handle() {
        if (typeof this.payload.name !== "string"
            || (!this.payload.name.endsWith(".js")
                && !this.payload.name.endsWith(".ts"))) {
            throw new Error("MakeEventCommand: Invalid event name provided");
        }
        const replacements = {
            EVENT_NAME: this.payload.name.split("/").pop().replace(".js", "").replace(".ts", ""),
        };
        const content = await this.createFile(this.stubsDir(this.payload.name, "Event.stub"), replacements);
        await this.storeFile(`events/${this.payload.name}`, content);
        console.log(`Event ${replacements.EVENT_NAME} created successfully`);
    }
}
/**
 * Integrated command flag
 *
 * @type {boolean}
 */
MakeEventCommand.integrated = true;
/**
 * Static signature key that will be callable name of our command.
 *
 * @type {string}
 */
MakeEventCommand.signature = "make:event";
/**
 * User friendly description of the command that has to be static.
 *
 * @type {string}
 */
MakeEventCommand.description = "Create new event";
/**
 * Example of the command usage.
 *
 * @type {string}
 */
MakeEventCommand.usage = "command=make:event name=ExampleEvent.js";
//# sourceMappingURL=MakeEventCommand.js.map
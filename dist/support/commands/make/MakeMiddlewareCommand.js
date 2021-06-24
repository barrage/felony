import Make from "./Make.js";
/**
 * Generator command
 *
 * @class
 */
export default class MakeMiddlewareCommand extends Make {
    /**
     * Handler method of the command that will run the action.
     *
     * @return {Promise<void>}
     */
    async handle() {
        if (typeof this.payload.name !== "string"
            || (!this.payload.name.endsWith(".js")
                && !this.payload.name.endsWith(".ts"))) {
            throw new Error("MakeMiddlewareCommand: Invalid middleware name provided");
        }
        const replacements = {
            MIDDLEWARE_NAME: this.payload.name.split("/").pop().replace(".js", "").replace(".ts", ""),
        };
        const content = await this.createFile(this.stubsDir(this.payload.name, "Middleware.stub"), replacements);
        await this.storeFile(`middleware/${this.payload.name}`, content);
        console.log(`Middleware ${replacements.MIDDLEWARE_NAME} created successfully`);
    }
}
/**
 * Integrated command flag
 *
 * @type {boolean}
 */
MakeMiddlewareCommand.integrated = true;
/**
 * Static signature key that will be callable name of our command.
 *
 * @type {string}
 */
MakeMiddlewareCommand.signature = "make:middleware";
/**
 * User friendly description of the command that has to be static.
 *
 * @type {string}
 */
MakeMiddlewareCommand.description = "Create new middleware";
/**
 * Example of the command usage.
 *
 * @type {string}
 */
MakeMiddlewareCommand.usage = "command=make:middleware name=ExampleMiddleware.js";
//# sourceMappingURL=MakeMiddlewareCommand.js.map
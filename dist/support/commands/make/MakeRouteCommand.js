import Make from "./Make.js";
/**
 * Generator command
 *
 * @class
 */
export default class MakeRouteCommand extends Make {
    /**
     * Handler method of the command that will run the action.
     *
     * @return {Promise<void>}
     */
    async handle() {
        if (typeof this.payload.name !== "string"
            || (!this.payload.name.endsWith(".js")
                && !this.payload.name.endsWith(".ts"))) {
            throw new Error("MakeRouteCommand: Invalid route name provided");
        }
        if (typeof this.payload.method !== "string"
            || ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTION"].indexOf(this.payload.method.toUpperCase()) === -1) {
            throw new Error("MakeRouteCommand: Invalid method for the route");
        }
        if (typeof this.payload.path !== "string") {
            throw new Error("MakeRouteCommand: No path provided for route");
        }
        if (!this.payload.path.startsWith("/")) {
            throw new Error("MakeRouteCommand: Route path must start with /");
        }
        const replacements = {
            FELONY_RELATIVE_PATH: "../framework",
            ROUTE_NAME: this.payload.name.split("/").pop().replace(".js", "").replace(".ts", ""),
            ROUTE_METHOD: this.payload.method,
            ROUTE_PATH: this.payload.path,
        };
        const content = await this.createFile(this.stubsDir(this.payload.name, "Route.stub"), replacements);
        await this.storeFile(`routes/${this.payload.name}`, content);
        console.log(`Route ${replacements.ROUTE_NAME} created successfully`);
    }
}
/**
 * Integrated command flag
 *
 * @type {boolean}
 */
MakeRouteCommand.integrated = true;
/**
 * Static signature key that will be callable name of our command.
 *
 * @type {string}
 */
MakeRouteCommand.signature = "make:route";
/**
 * User friendly description of the command that has to be static.
 *
 * @type {string}
 */
MakeRouteCommand.description = "Create new route";
/**
 * Example of the command usage.
 *
 * @type {string}
 */
MakeRouteCommand.usage = "command=make:route name=GetExample.js method=GET path=/example";
//# sourceMappingURL=MakeRouteCommand.js.map
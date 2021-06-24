import Make from "./Make.js";
/**
 * Generator command
 *
 * @class
 */
export default class MakeDatabaseCommand extends Make {
    /**
     * Handler method of the command that will run the action.
     *
     * @return {Promise<void>}
     */
    async handle() {
        if (typeof this.payload.name !== "string"
            || (!this.payload.name.endsWith(".js")
                && !this.payload.name.endsWith(".ts"))) {
            throw new Error("MakeDatabaseCommand: Invalid database name provided");
        }
        const replacements = {
            DATABASE_NAME: this.payload.name.split("/").pop().replace(".js", "").replace(".ts", ""),
        };
        const content = await this.createFile(this.stubsDir(this.payload.name, "Database.stub"), replacements);
        await this.storeFile(`databases/${this.payload.name}`, content);
        console.log(`Database ${replacements.DATABASE_NAME} created successfully`);
    }
}
/**
 * Integrated command flag
 *
 * @type {boolean}
 */
MakeDatabaseCommand.integrated = true;
/**
 * Static signature key that will be callable name of our command.
 *
 * @type {string}
 */
MakeDatabaseCommand.signature = "make:database";
/**
 * User friendly description of the command that has to be static.
 *
 * @type {string}
 */
MakeDatabaseCommand.description = "Create new database";
/**
 * Example of the command usage.
 *
 * @type {string}
 */
MakeDatabaseCommand.usage = "command=make:database name=ExampleDatabase.js";
//# sourceMappingURL=MakeDatabaseCommand.js.map
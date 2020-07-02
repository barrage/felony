import Make from "./Make.js";
const STUB_PATH = `${Felony.felonyPath}/stubs/Database.stub`;

/**
 * Generator command
 *
 * @class
 */
export default class MakeDatabaseCommand extends Make {
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
  static signature = "make:database";

  /**
   * User friendly description of the command that has to be static.
   *
   * @type string
   */
  static description = "Create new database";

  /**
   * Example of the command usage.
   *
   * @type string
   */
  static usage = "command=make:database name=ExampleDatabase.js";

  /**
   * Handler method of the command that will run the action.
   *
   * @return {Promise<void>}
   */
  async handle() {
    if (
      typeof this.payload.name !== "string"
      || !this.payload.name.endsWith(".js")
    ) {
      throw new Error("MakeDatabaseCommand: Invalid database name provided");
    }

    const replacements = {
      DATABASE_NAME: this.payload.name.split("/").pop().replace(".js", ""),
    };

    const content = await this.createFile(STUB_PATH, replacements);
    await this.storeFile(`databases/${this.payload.name}`, content);

    console.log(`Database ${replacements.DATABASE_NAME} created successfully`);
  }
}

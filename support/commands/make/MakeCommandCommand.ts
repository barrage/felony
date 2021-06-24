import Make from "./Make";

/**
 * Generator command
 *
 * @class
 */
export default class MakeCommandCommand extends Make {
  /**
   * Integrated command flag
   *
   * @type {boolean}
   */
  static integrated: boolean = true;

  /**
   * Static signature key that will be callable name of our command.
   *
   * @type {string}
   */
  static signature: string = "make:command";

  /**
   * User friendly description of the command that has to be static.
   *
   * @type {string}
   */
  static description: string = "Create new command";

  /**
   * Example of the command usage.
   *
   * @type {string}
   */
  static usage: string = "command=make:command name=ExampleCommand.js signature=example-signature";

  /**
   * Handler method of the command that will run the action.
   *
   * @return {Promise<void>}
   */
  async handle(): Promise<void> {
    if (
      typeof this.payload.name !== "string"
      || (!this.payload.name.endsWith(".js")
      && !this.payload.name.endsWith(".ts"))
    ) {
      throw new Error("MakeCommandCommand: Invalid command name provided");
    }

    if (typeof this.payload.signature !== "string") {
      throw new Error("MakeCommandCommand: Invalid command signature provided");
    }

    if (this.console.commands.filter((c) => c.signature === this.payload.signature).length > 0) {
      throw new Error("MakeCommandCommand: Provided signature is already in use");
    }

    const replacements = {
      COMMAND_NAME: this.payload.name.split("/").pop().replace(".js", "").replace(".ts", ""),
      COMMAND_SIGNATURE: this.payload.signature,
    };

    const content = await this.createFile(this.stubsDir(this.payload.name, "Command.stub"), replacements);
    await this.storeFile(`commands/${this.payload.name}`, content);

    console.log(`Command ${replacements.COMMAND_NAME} created successfully`);
  }
}

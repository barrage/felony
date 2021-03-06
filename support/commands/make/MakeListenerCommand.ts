import Make from "./Make";

/**
 * Generator command
 *
 * @class
 */
export default class MakeListenerCommand extends Make {
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
  static signature: string = "make:listener";

  /**
   * User friendly description of the command that has to be static.
   *
   * @type {string}
   */
  static description: string = "Create new listener";

  /**
   * Example of the command usage.
   *
   * @type {string}
   */
  static usage: string = "command=make:listener name=ExampleListener.js";

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
      throw new Error("MakeListenerCommand: Invalid listener name provided");
    }

    const replacements = {
      LISTENER_NAME: this.payload.name.split("/").pop().replace(".js", "").replace(".ts", ""),
    };

    const content = await this.createFile(this.stubsDir(this.payload.name, "Listener.stub"), replacements);
    await this.storeFile(`listeners/${this.payload.name}`, content);

    console.log(`Listener ${replacements.LISTENER_NAME} created successfully`);
  }
}

import Make from "./Make.js";
import { app as Felony } from "../../../Felony.js";
const STUB_PATH = `${Felony.felonyPath}/stubs/Listener.stub`;

/**
 * Generator command
 *
 * @class
 */
export default class MakeListenerCommand extends Make {
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
  static signature = "make:listener";

  /**
   * User friendly description of the command that has to be static.
   *
   * @type string
   */
  static description = "Create new listener";

  /**
   * Example of the command usage.
   *
   * @type string
   */
  static usage = "command=make:listener name=ExampleListener.js";

  /**
   * Handler method of the command that will run the action.
   *
   * @return {Promise<void>}
   */
  async handle() {
    if (
      typeof this.payload.name !== "string" ||
      !this.payload.name.endsWith(".js")
    ) {
      throw new Error(`MakeListenerCommand: Invalid listener name provided`);
    }

    const replacements = {
      LISTENER_NAME: this.payload.name.split("/").pop().replace(".js", ""),
    };

    const content = await this.createFile(STUB_PATH, replacements);
    await this.storeFile(`listeners/${this.payload.name}`, content);

    console.log(`Listener ${replacements.LISTENER_NAME} created successfully`);
  }
}

import Make from "./Make.js";
import { app as Felony } from "../../../Felony.js";
const STUB_PATH = `${Felony.felonyPath}/stubs/Event.stub`;

/**
 * Generator command
 *
 * @class
 */
export default class MakeEventCommand extends Make {
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
  static signature = "make:event";

  /**
   * User friendly description of the command that has to be static.
   *
   * @type string
   */
  static description = "Create new event";

  /**
   * Example of the command usage.
   *
   * @type string
   */
  static usage = "command=make:event name=ExampleEvent.js";

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
      throw new Error(`MakeEventCommand: Invalid event name provided`);
    }

    const replacements = {
      EVENT_NAME: this.payload.name.split("/").pop().replace(".js", ""),
    };

    const content = await this.createFile(STUB_PATH, replacements);
    await this.storeFile(`events/${this.payload.name}`, content);

    console.log(`Event ${replacements.EVENT_NAME} created successfully`);
  }
}

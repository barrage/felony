import Make from "./Make.js";
const STUB_PATH = `${Felony.felonyPath}/stubs/Cron.stub`;

/**
 * Generator command
 *
 * @class
 */
export default class MakeCronCommand extends Make {
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
  static signature = "make:cron";

  /**
   * User friendly description of the command that has to be static.
   *
   * @type string
   */
  static description = "Create new cron";

  /**
   * Example of the command usage.
   *
   * @type string
   */
  static usage = "command=make:cron name=ExampleCron.js schedule='* * * * *'";

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
      throw new Error("MakeCronCommand: Invalid cron name provided");
    }

    if (typeof this.payload.schedule !== "string") {
      throw new Error("MakeCronCommand: Invalid cron schedule provided");
    }

    const replacements = {
      CRON_NAME: this.payload.name.split("/").pop().replace(".js", ""),
      CRON_SCHEDULE: this.payload.schedule,
    };

    const content = await this.createFile(STUB_PATH, replacements);
    await this.storeFile(`crons/${this.payload.name}`, content);

    console.log(`Cron ${replacements.CRON_NAME} created successfully`);
  }
}

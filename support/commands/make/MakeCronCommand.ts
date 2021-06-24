import Make from "./Make";

/**
 * Generator command
 *
 * @class
 */
export default class MakeCronCommand extends Make {
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
  static signature: string = "make:cron";

  /**
   * User friendly description of the command that has to be static.
   *
   * @type {string}
   */
  static description: string = "Create new cron";

  /**
   * Example of the command usage.
   *
   * @type {string}
   */
  static usage: string = "command=make:cron name=ExampleCron.js schedule='* * * * *'";

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
      throw new Error("MakeCronCommand: Invalid cron name provided");
    }

    if (typeof this.payload.schedule !== "string") {
      throw new Error("MakeCronCommand: Invalid cron schedule provided");
    }

    const replacements = {
      CRON_NAME: this.payload.name.split("/").pop().replace(".js", "").replace(".ts", ""),
      CRON_SCHEDULE: this.payload.schedule,
    };

    const content = await this.createFile(this.stubsDir(this.payload.name, "Cron.stub"), replacements);
    await this.storeFile(`crons/${this.payload.name}`, content);

    console.log(`Cron ${replacements.CRON_NAME} created successfully`);
  }
}

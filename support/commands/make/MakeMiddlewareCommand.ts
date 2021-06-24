import Make from "./Make";

/**
 * Generator command
 *
 * @class
 */
export default class MakeMiddlewareCommand extends Make {
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
  static signature: string = "make:middleware";

  /**
   * User friendly description of the command that has to be static.
   *
   * @type {string}
   */
  static description: string = "Create new middleware";

  /**
   * Example of the command usage.
   *
   * @type {string}
   */
  static usage: string = "command=make:middleware name=ExampleMiddleware.js";

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
      throw new Error("MakeMiddlewareCommand: Invalid middleware name provided");
    }

    const replacements = {
      MIDDLEWARE_NAME: this.payload.name.split("/").pop().replace(".js", "").replace(".ts", ""),
    };

    const content = await this.createFile(this.stubsDir(this.payload.name, "Middleware.stub"), replacements);
    await this.storeFile(`middleware/${this.payload.name}`, content);

    console.log(
      `Middleware ${replacements.MIDDLEWARE_NAME} created successfully`,
    );
  }
}

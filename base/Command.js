/**
 * Basic command definition of the attributes.
 *
 * @class
 */
export default class Command {
  /**
   * Path to the command that will be attached while loading.
   *
   * @type string
   */
  static __path = "";

  /**
   * Static signature key that will be callable name of our command.
   *
   * @type string
   */
  static signature = "";

  /**
   * User friendly description of the command that has to be static.
   *
   * @type string
   */
  static description = "";

  /**
   * User friendly example of your command usage.
   *
   * @type string
   */
  static usage = "";

  /**
   * Constructor of the command will accept only one parameter which will be payload.
   *
   * @param {any} payload
   * @param {boolean} cli Defines if the command has been called from CLI or application
   */
  constructor(payload, cli = true) {
    this.payload = payload;
    this.cli = !!cli;
  }

  /**
   * Handler method of the command that will run the action.
   *
   * @return {Promise<any>}
   */
  async handle() {}
}

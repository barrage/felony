/**
 * Basic command definition of the attributes.
 *
 * @class
 */
export default class Command {
  /**
   * Static property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  static __kind = "Command";

  /**
   * Property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  __kind = "Command";

  /**
   * Path to the command that will be attached while loading (this is automatically filled in)
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
   * Constructor of the command
   *
   * @param {any} payload
   * @param {boolean} cli Defines if the command has been called from CLI or application
   */
  constructor(payload, cli = true) {
    this.payload = payload;
    this.cli = !!cli;
  }

  /**
   * Method that will be run once you call the command
   *
   * @return {Promise<any>}
   */
  async handle() {}
}

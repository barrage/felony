import Console from "../src/console/Console";

export interface CommandInterface {
  handle(): Promise<any>;
}

/**
 * Basic command definition of the attributes.
 *
 * @class
 */
export default class Command implements CommandInterface {
  /**
   * Static property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  static __kind: string = "Command";

  /**
   * Property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  __kind: string = "Command";

  /**
   * Path to the command that will be attached while loading (this is automatically filled in)
   *
   * @type {string}
   */
  static __path: string = "";

  /**
   * This is a marker that will expose commands that are integrated into Felony
   *
   * @type {boolean}
   */
  static integrated: boolean = false;

  /**
   * Static signature key that will be callable name of our command.
   *
   * @type {string}
   */
  static signature: string = "";

  /**
   * User friendly description of the command that has to be static.
   *
   * @type {string}
   */
  static description: string = "";

  /**
   * User friendly example of your command usage.
   *
   * @type {string}
   */
  static usage: string = "";

  /**
   * Paylod given to our command
   *
   * @type {any}
   */
  payload: any;

  /**
   * Flag that lets us know if we are running in cli
   *
   * @type {boolean}
   */
  cli: boolean = false;

  /**
   * Console runner from the application
   *
   * @type {Kernel}
   */
  console: Console;

  /**
   * Constructor of the command
   *
   * @param {any} payload
   * @param {boolean} cli Defines if the command has been called from CLI or application
   * @param {Console} console
   */
  constructor(payload: any, cli: boolean = true, console: Console) {
    this.payload = payload;
    this.cli = !!cli;
    this.console = console;
  }

  /**
   * Method that will be run once you call the command
   *
   * @return {Promise<any>}
   */
  async handle(): Promise<any> {}
}

/**
 * Basic cron definition of the attributes.
 *
 * @class
 */
export default class Cron {
  /**
   * Static property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  static __kind = "Cron";

  /**
   * Property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  __kind = "Cron";

  /**
   * Path to the cron that will be attached while loading (this is automatically filled in)
   *
   * @type string
   */
  static __path = "";

  /**
   * User friendly description of the cron that has to be static.
   *
   * @type string
   */
  static description = "";

  /**
   * Cron schedule
   *
   * @type string
   */
  static schedule = "";

  /**
   * Is this cron job currently active
   *
   * @type boolean
   */
  static active = true;

  /**
   * Method that will be run once the cron is initiated
   *
   * @return {Promise<any>}
   */
  async handle() {}
}

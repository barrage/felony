export interface FelonyEventInterface { }

/**
 * This is used only to recognize Felony events, you can add whatever properties to your events
 * you wish.
 *
 * @class
 */
export default class FelonyEvent implements FelonyEventInterface {
  /**
   * Static property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  static __kind: string = "FelonyEvent";

  /**
   * Property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  __kind: string = "FelonyEvent";
}

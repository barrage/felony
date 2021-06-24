/**
 * This is used only to recognize Felony events, you can add whatever properties to your events
 * you wish.
 *
 * @class
 */
export default class FelonyEvent {
    constructor() {
        /**
         * Property lettings us know what kind of class this is
         *
         * @type {string}
         * @private
         */
        this.__kind = "FelonyEvent";
    }
}
/**
 * Static property lettings us know what kind of class this is
 *
 * @type {string}
 * @private
 */
FelonyEvent.__kind = "FelonyEvent";
//# sourceMappingURL=FelonyEvent.js.map
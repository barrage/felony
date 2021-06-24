import FelonyEvent from "../../base/FelonyEvent.js";
/**
 * Event triggered before each route is compiled
 *
 * @class
 */
export default class FelonyServerBeforeRouteCompile extends FelonyEvent {
    /**
     * Construct the event
     * @param {Route} route
     */
    constructor(route) {
        super();
        /**
         * @type {Route|RouteInterface|null}
         */
        this.route = null;
        this.route = route;
    }
}
//# sourceMappingURL=FelonyServerBeforeRouteCompile.js.map
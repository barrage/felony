import FelonyEvent from "../../base/FelonyEvent.js";

/**
 * Event triggered before each route is compiled
 *
 * @class
 */
export default class FelonyServerBeforeRouteCompile extends FelonyEvent {
  /**
   * @type {Route|null}
   */
  route = null;

  /**
   * Construct the event
   * @param {Route} route
   */
  constructor(route) {
    super();
    this.route = route;
  }
}

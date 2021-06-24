import FelonyEvent from "../../base/FelonyEvent";
import Route, { RouteInterface } from "../../base/Route";

/**
 * Event triggered before each route is compiled
 *
 * @class
 */
export default class FelonyServerBeforeRouteCompile extends FelonyEvent {
  /**
   * @type {Route|RouteInterface|null}
   */
  route: Route | RouteInterface = null;

  /**
   * Construct the event
   * @param {Route} route
   */
  constructor(route: Route | RouteInterface) {
    super();
    this.route = route;
  }
}

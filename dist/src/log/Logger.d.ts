import Felony from "../../Felony";
/**
 * Placeholder for better logging so it fits better into log collection solutions.
 *
 * @class
 */
export default class Logger {
    /**
      * @type Felony
      */
    felony: Felony;
    /**
     * @param {Felony} felony
     */
    constructor(felony: Felony);
    assert(args: any): void;
    clear(args: any): void;
    count(args: any): void;
    debug(args: any): void;
    dir(args: any): void;
    dirxml(args: any): void;
    error(args: any): void;
    group(args: any): void;
    groupCollapsed(args: any): void;
    groupEnd(args: any): void;
    info(args: any): void;
    log(args: any): void;
    markTimeline(args: any): void;
    profile(args: any): void;
    profileEnd(args: any): void;
    table(args: any): void;
    time(args: any): void;
    timeEnd(args: any): void;
    timeStamp(args: any): void;
    timeline(args: any): void;
    timelineEnd(args: any): void;
    trace(args: any): void;
    warn(args: any): void;
}

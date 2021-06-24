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
  constructor(felony: Felony) {
    this.felony = felony;
  }

  // eslint-disable-next-line
  assert(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.assert(...arguments);
    }
  }

  // eslint-disable-next-line
  clear(args: any): void {
    console.clear();
  }

  // eslint-disable-next-line
  count(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.count(...arguments);
    }
  }

  // eslint-disable-next-line
  debug(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.debug(...arguments);
    }
  }

  // eslint-disable-next-line
  dir(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.dir(...arguments);
    }
  }

  // eslint-disable-next-line
  dirxml(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.dirxml(...arguments);
    }
  }

  // eslint-disable-next-line
  error(args: any): void {
    console.error(...arguments);
  }

  // eslint-disable-next-line
  exception(args: any):void {
    if (this.felony.arguments.silent !== true) {
      console.exception(...arguments);
    }
  }

  // eslint-disable-next-line
  group(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.group(...arguments);
    }
  }

  // eslint-disable-next-line
  groupCollapsed(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.groupCollapsed(...arguments);
    }
  }

  // eslint-disable-next-line
  groupEnd(args: any): void {
    if (this.felony.arguments.silent !== true) {
      // @ts-ignore
      console.groupEnd(...arguments);
    }
  }

  // eslint-disable-next-line
  info(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.info(...arguments);
    }
  }

  // eslint-disable-next-line
  log(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.log(...arguments);
    }
  }

  // eslint-disable-next-line
  markTimeline(args: any): void {
    if (this.felony.arguments.silent !== true) {
      // @ts-ignore
      console.markTimeline(...arguments);
    }
  }

  // eslint-disable-next-line
  profile(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.profile(...arguments);
    }
  }

  // eslint-disable-next-line
  profileEnd(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.profileEnd(...arguments);
    }
  }

  // eslint-disable-next-line
  table(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.table(...arguments);
    }
  }

  // eslint-disable-next-line
  time(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.time(...arguments);
    }
  }

  // eslint-disable-next-line
  timeEnd(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.timeEnd(...arguments);
    }
  }

  // eslint-disable-next-line
  timeStamp(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.timeStamp(...arguments);
    }
  }

  // eslint-disable-next-line
  timeline(args: any): void {
    if (this.felony.arguments.silent !== true) {
      // @ts-ignore
      console.timeline(...arguments);
    }
  }

  // eslint-disable-next-line
  timelineEnd(args: any): void {
    if (this.felony.arguments.silent !== true) {
      // @ts-ignore
      console.timelineEnd(...arguments);
    }
  }

  // eslint-disable-next-line
  trace(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.trace(...arguments);
    }
  }

  // eslint-disable-next-line
  warn(args: any): void {
    if (this.felony.arguments.silent !== true) {
      console.warn(...arguments);
    }
  }
}

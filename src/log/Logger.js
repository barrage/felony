/**
 * Placeholder for better logging so it fits better into log collection solutions.
 *
 * @class
 */
export default class Logger {
  /**
   * @param {Felony} felony
   */
  constructor(felony) {
    /**
     * @type Felony
     */
    this.felony = felony;
  }

  assert() {
    if (this.felony.arguments.silent !== true) {
      console.assert(...arguments);
    }
  }

  clear() {
    console.clear();
  }

  count() {
    if (this.felony.arguments.silent !== true) {
      console.count(...arguments);
    }
  }

  debug() {
    if (this.felony.arguments.silent !== true) {
      console.debug(...arguments);
    }
  }

  dir() {
    if (this.felony.arguments.silent !== true) {
      console.dir(...arguments);
    }
  }

  dirxml() {
    if (this.felony.arguments.silent !== true) {
      console.dirxml(...arguments);
    }
  }

  error() {
    console.error(...arguments);
  }

  exception() {
    if (this.felony.arguments.silent !== true) {
      console.exception(...arguments);
    }
  }

  group() {
    if (this.felony.arguments.silent !== true) {
      console.group(...arguments);
    }
  }

  groupCollapsed() {
    if (this.felony.arguments.silent !== true) {
      console.groupCollapsed(...arguments);
    }
  }

  groupEnd() {
    if (this.felony.arguments.silent !== true) {
      console.groupEnd(...arguments);
    }
  }

  info() {
    if (this.felony.arguments.silent !== true) {
      console.info(...arguments);
    }
  }

  log() {
    if (this.felony.arguments.silent !== true) {
      console.log(...arguments);
    }
  }

  markTimeline() {
    if (this.felony.arguments.silent !== true) {
      console.markTimeline(...arguments);
    }
  }

  profile() {
    if (this.felony.arguments.silent !== true) {
      console.profile(...arguments);
    }
  }

  profileEnd() {
    if (this.felony.arguments.silent !== true) {
      console.profileEnd(...arguments);
    }
  }

  table() {
    if (this.felony.arguments.silent !== true) {
      console.table(...arguments);
    }
  }

  time() {
    if (this.felony.arguments.silent !== true) {
      console.time(...arguments);
    }
  }

  timeEnd() {
    if (this.felony.arguments.silent !== true) {
      console.timeEnd(...arguments);
    }
  }

  timeStamp() {
    if (this.felony.arguments.silent !== true) {
      console.timeStamp(...arguments);
    }
  }

  timeline() {
    if (this.felony.arguments.silent !== true) {
      console.timeline(...arguments);
    }
  }

  timelineEnd() {
    if (this.felony.arguments.silent !== true) {
      console.timelineEnd(...arguments);
    }
  }

  trace() {
    if (this.felony.arguments.silent !== true) {
      console.trace(...arguments);
    }
  }

  warn() {
    if (this.felony.arguments.silent !== true) {
      console.warn(...arguments);
    }
  }
}

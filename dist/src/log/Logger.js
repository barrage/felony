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
        this.felony = felony;
    }
    // eslint-disable-next-line
    assert(args) {
        if (this.felony.arguments.silent !== true) {
            console.assert(...arguments);
        }
    }
    // eslint-disable-next-line
    clear(args) {
        console.clear();
    }
    // eslint-disable-next-line
    count(args) {
        if (this.felony.arguments.silent !== true) {
            console.count(...arguments);
        }
    }
    // eslint-disable-next-line
    debug(args) {
        if (this.felony.arguments.silent !== true) {
            console.debug(...arguments);
        }
    }
    // eslint-disable-next-line
    dir(args) {
        if (this.felony.arguments.silent !== true) {
            console.dir(...arguments);
        }
    }
    // eslint-disable-next-line
    dirxml(args) {
        if (this.felony.arguments.silent !== true) {
            console.dirxml(...arguments);
        }
    }
    // eslint-disable-next-line
    error(args) {
        console.error(...arguments);
    }
    // eslint-disable-next-line
    group(args) {
        if (this.felony.arguments.silent !== true) {
            console.group(...arguments);
        }
    }
    // eslint-disable-next-line
    groupCollapsed(args) {
        if (this.felony.arguments.silent !== true) {
            console.groupCollapsed(...arguments);
        }
    }
    // eslint-disable-next-line
    groupEnd(args) {
        if (this.felony.arguments.silent !== true) {
            // @ts-ignore
            console.groupEnd(...arguments);
        }
    }
    // eslint-disable-next-line
    info(args) {
        if (this.felony.arguments.silent !== true) {
            console.info(...arguments);
        }
    }
    // eslint-disable-next-line
    log(args) {
        if (this.felony.arguments.silent !== true) {
            console.log(...arguments);
        }
    }
    // eslint-disable-next-line
    markTimeline(args) {
        if (this.felony.arguments.silent !== true) {
            // @ts-ignore
            console.markTimeline(...arguments);
        }
    }
    // eslint-disable-next-line
    profile(args) {
        if (this.felony.arguments.silent !== true) {
            console.profile(...arguments);
        }
    }
    // eslint-disable-next-line
    profileEnd(args) {
        if (this.felony.arguments.silent !== true) {
            console.profileEnd(...arguments);
        }
    }
    // eslint-disable-next-line
    table(args) {
        if (this.felony.arguments.silent !== true) {
            console.table(...arguments);
        }
    }
    // eslint-disable-next-line
    time(args) {
        if (this.felony.arguments.silent !== true) {
            console.time(...arguments);
        }
    }
    // eslint-disable-next-line
    timeEnd(args) {
        if (this.felony.arguments.silent !== true) {
            console.timeEnd(...arguments);
        }
    }
    // eslint-disable-next-line
    timeStamp(args) {
        if (this.felony.arguments.silent !== true) {
            console.timeStamp(...arguments);
        }
    }
    // eslint-disable-next-line
    timeline(args) {
        if (this.felony.arguments.silent !== true) {
            // @ts-ignore
            console.timeline(...arguments);
        }
    }
    // eslint-disable-next-line
    timelineEnd(args) {
        if (this.felony.arguments.silent !== true) {
            // @ts-ignore
            console.timelineEnd(...arguments);
        }
    }
    // eslint-disable-next-line
    trace(args) {
        if (this.felony.arguments.silent !== true) {
            console.trace(...arguments);
        }
    }
    // eslint-disable-next-line
    warn(args) {
        if (this.felony.arguments.silent !== true) {
            console.warn(...arguments);
        }
    }
}
//# sourceMappingURL=Logger.js.map
/**
 * Basic command definition of the attributes.
 *
 * @class
 */
export default class Command {
    /**
     * Constructor of the command
     *
     * @param {any} payload
     * @param {boolean} cli Defines if the command has been called from CLI or application
     * @param {Console} console
     */
    constructor(payload, cli = true, console) {
        /**
         * Property lettings us know what kind of class this is
         *
         * @type {string}
         * @private
         */
        this.__kind = "Command";
        /**
         * Flag that lets us know if we are running in cli
         *
         * @type {boolean}
         */
        this.cli = false;
        this.payload = payload;
        this.cli = !!cli;
        this.console = console;
    }
    /**
     * Method that will be run once you call the command
     *
     * @return {Promise<any>}
     */
    async handle() { }
}
/**
 * Static property lettings us know what kind of class this is
 *
 * @type {string}
 * @private
 */
Command.__kind = "Command";
/**
 * Path to the command that will be attached while loading (this is automatically filled in)
 *
 * @type {string}
 */
Command.__path = "";
/**
 * This is a marker that will expose commands that are integrated into Felony
 *
 * @type {boolean}
 */
Command.integrated = false;
/**
 * Static signature key that will be callable name of our command.
 *
 * @type {string}
 */
Command.signature = "";
/**
 * User friendly description of the command that has to be static.
 *
 * @type {string}
 */
Command.description = "";
/**
 * User friendly example of your command usage.
 *
 * @type {string}
 */
Command.usage = "";
//# sourceMappingURL=Command.js.map
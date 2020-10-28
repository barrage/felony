import path from "path";
import { fileURLToPath } from "url";
import Kernel from "./src/Kernel.js";
import Bus from "./src/events/Bus.js";
import Logger from "./src/log/Logger.js";
import Worker from "./src/queue/Worker.js";
import Connector from "./src/database/Connector.js";
import CronRunner from "./src/cron/CronRunner.js";

import FelonyDefined from "./support/events/FelonyDefined.js";
import FelonyGotArguments from "./support/events/FelonyGotArguments.js";
import FelonyLoadedDatabases from "./support/events/FelonyLoadedDatabases.js";
import FelonyGotConfiguration from "./support/events/FelonyGotConfiguration.js";

/**
 * Display the help in cli
 */
const help = function help() {
  console.log("Usage felony <command> [args]");
  console.log("Or node index.js <command> [args] (You have to import Felony in your index)");
  console.log(" ");
  console.log("where <command> is one of:");
  console.log("  commands, command, http, queue");
  console.log(" ");
  console.log("felony commands                               Displays list of all the commands integrated in Felony and found in 'commands/' directory");
  console.log("felony command=<command signature> [args]     Runs the given command with passed arguments");
  console.log("felony http                                   Starts the HTTP server (express) with loaded routes found in 'routes/' directory");
  console.log("felony http cron                              Starts the HTTP server same as \"http\" but allows Crons to be executed ");
  console.log("felony queue=<queue name>                     Runs queue listener for given queue name.");
  console.log(" ");
  console.log("Args can be (but are not limited to):");
  console.log("felony <command> silent                       This will suppress most, if not all the console messages displayed by Felony");
  console.log("Everything passed as arguments in cli will be available in global object 'Felony.arguments'.");
  console.log(" ");
  console.log("Documentation: https://github.com/barrage/felony#readme");
};

/**
 * Felony framework global class with everything exposed for global usage.
 *
 * @class
 */
export class Felony {
  /**
   * Application environment from where it's running:
   *
   * export NODE_ENV=production
   *
   * in order to change this
   *
   * @type string
   */
  environment = "development";

  /**
   * @type string
   */
  appRootPath = "";

  /**
   * @type string
   */
  felonyPath = "";

  /**
   * Once we get signal to shut down, this will turn to true.
   *
   * @type boolean
   */
  shuttingDown = false;

  /**
   * @type Kernel
   */
  kernel = new Kernel(this);

  /**
   * @type Bus
   */
  event = new Bus(this);

  /**
   * @type Worker
   */
  queue = new Worker(this);

  /**
   * Database connector
   *
   * @type Object
   */
  db = new Connector(this);

  /**
   * Internal logging instance that can be silenced
   *
   * @type {Logger}
   */
  log = new Logger(this);

  /**
   * Cron runner
   *
   * @type Cron
   */
  cronRunner = new CronRunner(this);

  /**
   * Arguments passed from the CLI to Felony.
   *
   * Some of the present arguments are used internally:
   *
   * @type Object
   */
  arguments = {
    /**
     * 5 seconds will be timeout before we do force shutdown
     *
     * @type number
     */
    FORCE_SHUTDOWN: 5,
    /**
     * Tells the Felony to start HTTP server
     *
     * @type boolean
     */
    // "http": true,

    /**
     * Tells the Felony what queue to listen for (won't work with http server)
     *
     * @type string
     */
    // "queue": "example-queue",

    /**
     * Overrides server port from config, or default
     *
     * @type number
     */
    // "SERVER_PORT": 5445,
  };

  /**
   * Loaded and prepared configuration that will be used anywhere in the application.
   *
   * @type Object
   */
  config = {
    /**
     * Http server configuration,
     * create config/server.js file to override this.
     *
     * OR config/environments/{YOUR_ENV}/server.js
     *
     * @type object
     */
    server: {
      port: 5445,

      // https://expressjs.com/en/4x/api.html#express.router
      // router: {
      //   caseSensitive: false,
      //   mergeParams: false,
      //   strict: false,
      // },

      // https://expressjs.com/en/4x/api.html#express.json
      // json: {
      //   inflate: true,
      //   limit: "100kb",
      //   reviver: null,
      //   strict: true,
      //   type: "application/json",
      //   verify: undefined,
      // },

      // https://expressjs.com/en/4x/api.html#express.raw
      // raw: {
      //   inflate: true,
      //   limit: "100kb",
      //   type: "application/octet-stream",
      //   verify: undefined,
      // },

      // https://helmetjs.github.io/
      helmet: {},
    },

    /**
     * Cors configurations for your server,
     * create config/cors.js file to override this.
     *
     * OR config/environments/{YOUR_ENV}/cors.js
     */
    cors: {
      origin: "*",
      preflightContinue: false,
      optionsSuccessStatus: 204,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      headers: [
        "user-agent",
        "content-type",
        "accept-language",
        "x-forwarded-for",
      ],
    },

    /**
     * Queue listener and runner configuration
     * create config/queue.ts file to override this.
     *
     * OR config/environments/{YOUR_ENV}/queue.js
     *
     * @type Object
     */
    queue: {
      /**
       * Queue requires this connection information
       * for the redis instance.
       */
      // connection: {
      //   host: "localhost",
      //   port: 6379,
      //   db: 0,
      //   password: "auth-password-for-redis",
      // },
    },
  };

  /**
   * Construct the framework
   *
   * @param {string} appRootPath
   * @param {object} args Suppresses almost all the logs
   */
  constructor(appRootPath = process.cwd(), args = {}) {
    this.appRootPath = appRootPath;
    this.felonyPath = path.dirname(fileURLToPath(import.meta.url));

    if (args && typeof args === "object") {
      this.arguments = { ...this.arguments, ...args };
    }

    // Load the arguments
    this.arguments = this.kernel.arguments(this.arguments);
  }

  /**
   * NO RUNNING BACK HERE!
   *
   * Takes all the set configurations and files, compiles them all together and starts running.
   *
   * @return {Promise<void>}
   */
  async commit() {
    if (
      this.arguments["--help"] === true
      || this.arguments["-h"] === true
    ) {
      return help();
    }

    this.environment = process.env.NODE_ENV || "development";

    // This has to happen first in order to be able to catch events.
    await this.event.load();
    await this.event.raise(new FelonyDefined());
    await this.event.raise(new FelonyGotArguments());

    // Cache the configurations
    this.config = await this.kernel.config();

    await this.event.raise(new FelonyGotConfiguration());

    // Load and connect all the databases
    await this.db._load();
    await this.event.raise(new FelonyLoadedDatabases());

    // Load the jobs
    await this.queue.load();

    // Load crons
    await this.cronRunner.initialize();

    // Lift off!
    await this.kernel.bootstrap();
  }

  /**
   * Tries to shut down everything gracefully, will resolve only once everything is down.
   *
   * @return {Promise<void>}
   */
  async down() {
    this.shuttingDown = true;

    console.log("Starting graceful shutdown...");

    await this.kernel.server.close(this.arguments.FORCE_SHUTDOWN);
    await this.queue.stop(this.arguments.FORCE_SHUTDOWN);
    await this.db._close();

    console.log("Bye");

    process.exit(0);
  }

  /**
   * Create
   * @param payload
   * @param ms
   */
  setTimeout(payload, ms) {
    return new Promise((resolve) => setTimeout(() => resolve(payload), ms));
  }

  /**
   * Get error stack as user friendly array.
   *
   * @param {any} error
   * @return string[]
   */
  getStack(error) {
    let len = 0;

    if (!(error instanceof Error)) {
      error = new Error();

      len = 1;
    }

    return error.stack.split("\n")
      .map((line) => line.trim()
        .replace("at ", ""))
      .filter((line, key) => key > len);
  }

  /**
   * Capitalize first letter of given text.
   *
   * @param {string} text
   * @return string
   */
  ucFirst(text = "") {
    return text.substring(0, 1).toUpperCase() + text.substring(1).toLowerCase();
  }
}

const app = new Felony();
globalThis.Felony = app;

export { app };

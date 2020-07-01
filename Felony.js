import path from "path";
import Kernel from "./src/Kernel.js";
import Bus from "./src/events/Bus.js";
import Worker from "./src/queue/Worker.js";
import Connector from "./src/database/Connector.js";

import FelonyDefined from "./support/events/FelonyDefined.js";
import FelonyGotArguments from "./support/events/FelonyGotArguments.js";
import FelonyLoadedDatabases from "./support/events/FelonyLoadedDatabases.js";
import FelonyGotConfiguration from "./support/events/FelonyGotConfiguration.js";

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
  kernel = new Kernel();

  /**
   * @type Bus
   */
  event = new Bus();

  /**
   * @type Worker
   */
  queue = new Worker();

  /**
   * Database connector
   *
   * @type Object
   */
  db = new Connector();

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
    "FORCE_SHUTDOWN": 5,
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
     * @type object
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
      // }
    },
  };

  /**
   * Construct the framework
   *
   * @param {string} appRootPath
   */
  constructor(appRootPath = path.resolve('./')) {
    this.appRootPath = appRootPath;

    this.felonyPath = import.meta.url
        .replace("file://", "")
        .replace("/Felony.js", "");
  }

  /**
   * NO RUNNING BACK HERE!
   *
   * Takes all the set configurations and files, compiles them all together and starts running.
   *
   * @return {Promise<void>}
   */
  async commit() {
    this.environment = process.env.NODE_ENV || "development";

    // This has to happen first in order to be able to catch events.
    await this.event.load();
    await this.event.raise(new FelonyDefined());

    // Cache the arguments
    this.arguments = await this.kernel.arguments();
    await this.event.raise(new FelonyGotArguments());

    // Cache the configurations
    this.config = await this.kernel.config();
    await this.event.raise(new FelonyGotConfiguration());

    // Load and connect all the databases
    await this.db._load();
    await this.event.raise(new FelonyLoadedDatabases());

    // Load the jobs
    await this.queue.load();

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

    console.log("Starting graceful shutdown procedures...");

    await this.kernel.server.close(this.arguments.FORCE_SHUTDOWN);
    await this.queue.stop(this.arguments.FORCE_SHUTDOWN);
    await this.db._close();

    console.log("Bye");

    process.exit();
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
      .map((line) =>
        line.trim()
          .replace("at ", "")
      )
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

export const app = globalThis.Felony = new Felony();

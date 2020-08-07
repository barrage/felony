import path from "path";
import Database from "../../base/Database.js";

/**
 * Loader of all the database connections.
 *
 * @class
 */
export default class Connector {
  /**
   * @param {Felony} felony
   */
  constructor(felony) {
    /**
     * @type Felony
     */
    this.felony = felony;
  }

  /**
   * Key definition for database connections that will be attached to Connector
   * object.
   *
   * @type Database
   */
  // [key: string]: Database

  /**
   * Load database connections and return them as an object.
   *
   * @return {Promise<void>}
   */
  async _load() {
    const _databases = await this.felony.kernel.readRecursive(path.resolve(this.felony.appRootPath, "databases"));

    for (const db of _databases) {
      const Imported = (await import(db)).default;
      const Instance = new Imported();

      if (Instance && Instance.__kind === "Database") {
        Instance.__path = db.replace(`${this.felony.appRootPath}/`, "");

        try {
          // Here we will try to load user defined database client.
          await Instance.handle();

          if (Instance.client) {
            this.felony.log.log(`${Instance.constructor.name} database loaded and connected`);
          }
        }
        catch (error) {
          this.felony.log.error(`${Instance.constructor.name} database failed loading`);
          throw error;
        }

        this[Instance.constructor.name] = Instance;
      }
    }
  }

  /**
   * Close database connections
   *
   * @return {Promise<void>}
   */
  async _close() {
    for (const key in this) {
      if (
        this.hasOwnProperty(key)
        && ["_load", "_close"].indexOf(key) !== -1
      ) {
        continue;
      }

      if (
        this.hasOwnProperty(key)
        && this[key].__kind === "Database"
        && typeof this[key].close === "function"
      ) {
        this.felony.log.warn(`Closing connection on ${key} database...`);

        await this[key].close();

        this.felony.log.info(`Closed connection on ${key} database`);
      }
    }
  }
}

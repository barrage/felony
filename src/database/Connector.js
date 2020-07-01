import path from "path";
import Database from "../../base/Database.js";
import { app as Felony } from "../../Felony.js";

/**
 * Loader of all the database connections.
 *
 * @class
 */
export default class Connector {
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
    const _databases = await Felony.kernel.readRecursive(path.resolve(Felony.appRootPath, "databases"));

    for (const db of _databases) {
      const Imported = (await import(db)).default;
      const Instance = new Imported();

      if (Instance instanceof Database) {
        Instance.__path = db.replace(`${Felony.appRootPath}/`, "");

        try {
          // Here we will try to load user defined database client.
          await Instance.handle();

          if (Instance.client) {
            console.log(`${Instance.constructor.name} database loaded and connected`);
          }
        }
        catch (error) {
          console.error(`${Instance.constructor.name} database failed loading`);
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
      if (["_load", "_close"].indexOf(key) !== -1) {
        continue;
      }

      if (
          this[key] &&
          this[key] instanceof Database &&
          typeof this[key].close === "function"
      ) {
        console.warn(`Closing connection on ${key} database...`);

        await this[key].close();

        console.info(`Closed connection on ${key} database`);
      }
    }
  }
}

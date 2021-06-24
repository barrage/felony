import Database from "../../base/Database";
import Felony from "../../Felony";
/**
 * Loader of all the database connections.
 *
 * @class
 */
export default class Connector {
    /**
     * @type {Felony}
     */
    felony: Felony;
    /**
     * @param {Felony} felony
     */
    constructor(felony: Felony);
    /**
     * Key definition for database connections that will be attached to Connector
     * object.
     *
     * @type {Database}
     */
    anyDbInstance: Database;
    /**
     * Load database connections and return them as an object.
     *
     * @return {Promise<any>}
     */
    _load(): Promise<any>;
    /**
     * Close database connections
     *
     * @return {Promise<any>}
     */
    _close(): Promise<any>;
}

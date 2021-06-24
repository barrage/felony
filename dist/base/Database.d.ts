export interface DatabaseInterface {
    handle(): Promise<void>;
    close(): Promise<void>;
}
/**
 * Database definition class that will set on itself client to be used for the connection and actions.
 * The client can be anything your heart desires (mongoose, redis, sql, whatever, even custom db connector)
 *
 * @class
 */
export default class Database implements DatabaseInterface {
    /**
     * Static property lettings us know what kind of class this is
     *
     * @type {string}
     * @private
     */
    static __kind: string;
    /**
     * Property lettings us know what kind of class this is
     *
     * @type {string}
     * @private
     */
    __kind: string;
    /**
     * Every loaded database will have path from where it's loaded stored here (automatically filled in)
     *
     * @type {string}
     */
    __path: string;
    /**
     * This will be the place where client for the given database is stored.
     *
     * @type {any}
     */
    client: any;
    /**
     * Once the database starts loading, handle method will be called,
     * you will have to create logic that connects your database and stores
     * the client of your database onto this.client
     *
     * @return {Promise<void>}
     */
    handle(): Promise<void>;
    /**
     * Handle closing of database instance, this method will be called
     * before application shuts down.
     *
     * @return {Promise<void>}
     */
    close(): Promise<void>;
}

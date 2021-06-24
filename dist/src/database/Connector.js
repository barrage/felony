import path from "path";
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
        this.felony = felony;
    }
    /**
     * Load database connections and return them as an object.
     *
     * @return {Promise<any>}
     */
    async _load() {
        const _databases = await this.felony.kernel.readRecursive(path.resolve(this.felony.appRootPath, "databases"));
        for (const db of _databases) {
            const Imported = (await import(db)).default;
            const Instance = new Imported();
            if (Instance && Instance.__kind === "Database") {
                let replacePath = `${this.felony.appRootPath}/`; // we need to adjust the path depending on operating system
                if (db.startsWith("file://")) {
                    replacePath = `file://${this.felony.appRootPath}\\`;
                }
                Instance.__path = db.replace(replacePath, "");
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
     * @return {Promise<any>}
     */
    async _close() {
        for (const key in this) {
            if (this.hasOwnProperty(key)
                && ["_load", "_close", "db"].indexOf(key) !== -1) {
                continue;
            }
            // We are ignoring some typescript errors in here,
            // but it is working properly and should compile and work in javascript
            // typescript simply doesn't know that we are dynamically adding keys
            // to our `this` instance and is have a fit about it.
            if (this.hasOwnProperty(key)
                // @ts-ignore
                && this[key].__kind === "Database"
                // @ts-ignore
                && typeof this[key].close === "function") {
                this.felony.log.warn(`Closing connection on ${key} database...`);
                // @ts-ignore
                await this[key].close();
                this.felony.log.info(`Closed connection on ${key} database`);
            }
        }
    }
}
//# sourceMappingURL=Connector.js.map
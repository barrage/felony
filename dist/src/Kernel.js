import path from "path";
import { promises as fs } from "fs";
import Server from "./http/Server.js";
import Console from "./console/Console.js";
/**
 * Framework kernel that will raise actual workers and gather the configurations.
 *
 * @class
 */
export default class Kernel {
    /**
     * @param {Felony} felony
     */
    constructor(felony) {
        /**
         * Router instance with all the preloaded routes and server
         *
         * @type {Server}
         */
        this.server = new Server(this);
        /**
         * Console instance that will handle loading and running of the commands
         *
         * @type {Console}
         */
        this.console = new Console(this);
        this.felony = felony;
    }
    /**
     * Parse command line arguments passed to node app
     *
     * @param {object} args
     * @return {object}
     */
    arguments(args) {
        const argv = process.argv ? process.argv : [];
        for (const arg of argv) {
            const [key, value] = arg.split("=");
            args[key] = value || true;
        }
        for (const key in args) {
            if (typeof args[key] !== "string")
                continue;
            if (args[key].toLowerCase() === "true") {
                args[key] = true;
            }
            else if (args[key].toLowerCase() === "false") {
                args[key] = false;
            }
            else if (args[key].toLowerCase() === "null") {
                args[key] = null;
            }
        }
        return args;
    }
    /**
     * Parse all config files contained in {Felony.appRootPath}/config/*.ts
     * and return them as a single object.
     *
     * @return {Promise<AppConfig>}
     */
    async config() {
        // Load all the files from config directory, ignore the environment directory,
        // we will take care of that one later.
        const files = await this.readRecursive(path.resolve(this.felony.appRootPath, "config"), [".ts", ".js"], ["environments"]);
        // Taking in consideration environment directory here, we will scan the current env
        // directory and attach files from it at the end so they can override any global configurations.
        if (this.felony.environment) {
            const p = path.resolve(this.felony.appRootPath, "config", "environments", this.felony.environment);
            try {
                const stat = await fs.stat(p);
                if (stat.isDirectory()) {
                    const envFiles = await this.readRecursive(p);
                    for (const file of envFiles) {
                        files.push(file);
                    }
                }
            }
            catch (error) {
                // Do nothing...
            }
        }
        let config = this.felony.config;
        for (const file of files) {
            const name = file.split("/")[file.split("/").length - 1].split(".")[0];
            const data = await Kernel.loadConfig(file);
            // We will accept only object data for config
            if (!data || typeof data !== "object") {
                continue;
            }
            if (data.config && typeof data.config === "object") {
                config = { ...config, ...data.config };
            }
            if (data.default && typeof data.default === "object") {
                config[name] = { ...(config[name] || {}), ...data.default };
            }
        }
        return config;
    }
    /**
     * By the start of this method, Felony should already have the
     * whole argumentation and configuration.
     *
     * @return {Promise<any>}
     */
    async bootstrap() {
        await this.signal();
        // Load commands
        await this.console.load();
        // List all the loaded commands.
        if (this.felony.arguments.commands) {
            await this.console.list();
            return process.exit();
        }
        // Execute the given command.
        if (this.felony.arguments.command) {
            try {
                await this.console.run(this.felony.arguments.command, this.felony.arguments);
                return process.exit();
            }
            catch (error) {
                this.felony.log.error(error);
                return process.exit();
            }
        }
        // On specified queue, listen here.
        if (typeof this.felony.arguments.queue === "string") {
            try {
                if (this.felony.arguments.cron === true) {
                    return await Promise.all([
                        this.felony.cron.run(),
                        this.felony.queue.listen(this.felony.arguments.queue),
                    ]);
                }
                return await this.felony.queue.listen(this.felony.arguments.queue);
            }
            catch (error) {
                this.felony.log.error(error);
                return process.exit();
            }
        }
        // If cron argument is passed into the cli, and is not combined with http, we'll start
        // only the cron runner by itself.
        if (this.felony.arguments.cron === true && this.felony.arguments.http !== true) {
            return this.felony.cron.run();
        }
        // If http argument is passed in cli that will startup the http server
        if (this.felony.arguments.http === true) {
            await this.server.load();
            if (this.felony.arguments.cron === true) {
                return Promise.all([
                    this.felony.cron.run(),
                    this.server.serve(),
                ]);
            }
            return this.server.serve();
        }
        // If no startup arguments are defined (http, queue or command)
        // we will only put out entire felony object with everything loaded.
        // This is sort of a --dry-run option.
        this.felony.log.dir(this.felony);
        // Special argument passed in order to not exit the runtime (used for testing)
        if (this.felony.arguments.exit !== false) {
            process.exit(0);
        }
    }
    /**
     * Setup signal listeners for graceful shutdown
     *
     * @return {Promise<void>}
     */
    async signal() {
        const graceful = async () => this.felony.down();
        process.on("SIGINT", graceful);
        process.on("SIGTERM", graceful);
    }
    /**
     * Reads directory and returns paths to files within it.
     *
     * @param {string} dir
     * @param {string[]} [suffix]
     * @param {string[]} [dirIgnore]
     * @return {Promise<string[]>}
     */
    async readRecursive(dir, suffix = [".js"], dirIgnore = []) {
        if (dir[dir.length - 1] === "/" || dir[dir.length - 1] === "\\") {
            dir = dir.slice(0, dir.length - 1);
        }
        if (typeof suffix === "string") {
            suffix = [suffix];
        }
        if (typeof dirIgnore === "string") {
            dirIgnore = [dirIgnore];
        }
        try {
            const stat = await fs.stat(dir);
            if (!stat.isDirectory()) {
                return [];
            }
        }
        catch (error) {
            return [];
        }
        const files = [];
        for (const filename of (await fs.readdir(dir))) {
            if ([".", ".."].indexOf(filename) !== -1) {
                continue;
            }
            let include = false;
            for (const s of suffix) {
                include = filename.endsWith(s);
            }
            if (include === true) {
                let prefix = "";
                if (process.platform === "win32") { // we need to know which operating system are we using
                    prefix = "file://";
                }
                files.push(`${prefix + dir}/${filename}`);
            }
            else if (dirIgnore.indexOf(filename) === -1) {
                files.push(await this.readRecursive(`${dir}/${filename}`, suffix));
            }
        }
        return files.flat().filter((item, i, arr) => arr.indexOf(item) === i);
    }
    /**
     * Load single configuration file.
     *
     * @param {string} filePath
     * @return {Promise<object>}
     * @private
     */
    static async loadConfig(filePath) {
        try {
            let filePathStat = filePath;
            if (filePathStat.startsWith("file://")) {
                filePathStat = filePathStat.replace("file://", "");
            }
            const stat = await fs.stat(filePathStat);
            if (!stat.isFile()) {
                return {};
            }
        }
        catch (error) {
            return {};
        }
        return import(filePath);
    }
}
//# sourceMappingURL=Kernel.js.map
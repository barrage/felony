import { promises as fs } from "fs";
import Server from "./http/Server.js";
import Console from "./console/Console.js";
import { app as Felony } from "../Felony.js";

/**
 * Framework kernel that will raise actual workers and gather the configurations.
 *
 * @class
 */
export default class Kernel {
  /**
   * Router instance with all the preloaded routes and server
   *
   * @type Server
   */
  server = new Server();

  /**
   * Console instance that will handle loading and running of the commands
   *
   * @type Console
   */
  console = new Console();

  /**
   * Parse command line arguments passed to node app
   *
   * @return {Promise<object>}
   */
  async arguments() {
    const args = Felony.arguments; // Make sure we got all the default arguments
    const argv = process.argv ? process.argv : [];

    for (const arg of argv) {
      const [key, value] = arg.split("=");

      args[key] = value || true;
    }

    for (const key in args) {
      if (typeof args[key] !== "string") continue;

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
   * @return {Promise<object>}
   */
  async config() {
    // Load all the files from config directory, ignore the environment directory,
    // we will take care of that one later.
    const files = await this.readRecursive(
      `${Felony.appRootPath}/config/`,
      [".js"],
      ["environments"],
    );

    // Taking in consideration environment directory here, we will scan the current env
    // directory and attach files from it at the end so they can override any global configurations.
    if (Felony.environment) {
      const path = `${Felony.appRootPath}/config/environments/${Felony.environment}/`;

      try {
        const stat = await Deno.stat(path);

        if (stat.isDirectory) {
          const envFiles = await this.readRecursive(path, ".js");

          for (const file of envFiles) {
            files.push(file, path);
          }
        }
      } catch (error) {
        // Do nothing...
      }
    }

    let config = {};

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
        config[name] = data.default;
      }
    }

    return config;
  }

  /**
   * By the start of this method, Felony should already have the
   * whole argumentation and configuration.
   *
   * @return {Promise<void>}
   */
  async bootstrap() {
    await this.signal();

    // Load commands
    await this.console.load();

    // List all the loaded commands.
    if (Felony.arguments.commands) {
      return this.console.list();
    }

    // Execute the given command.
    if (Felony.arguments.command) {
      try {
        return await this.console.run(Felony.arguments.command, Felony.arguments);
      }
      catch (error) {
        return console.error(error);
      }
    }

    // On specified queue, listen here.
    if (typeof Felony.arguments.queue === "string") {
      try {
        return await Felony.queue.listen(Felony.arguments.queue);
      }
      catch (error) {
        return console.error(error);
      }
    }

    // If http argument is passed in cli that will startup the http server
    if (Felony.arguments.http === true) {
      await this.server.load();

      return this.server.serve();
    }

    // If no startup arguments are defined (http, queue or command)
    // we will only put out entire felony object with everything loaded.
    // This is sort of a --dry-run option.
    console.dir(Felony);
  }

  /**
   * Setup signal listeners for graceful shutdown
   *
   * @return {Promise<void>}
   */
  async signal() {
    const graceful = async () => await Felony.down();

    process.on('SIGINT', graceful);
    process.on('SIGTERM', graceful);
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
    if (dir[dir.length - 1] === "/") {
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
    } catch (error) {
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
        files.push(`${dir}/${filename}`);
      } else if (dirIgnore.indexOf(filename) === -1) {
        files.push(await this.readRecursive(`${dir}/${filename}`, suffix));
      }
    }

    return files.flat().filter((item, i, arr) => arr.indexOf(item) === i);
  }

  /**
   * Load single configuration file.
   *
   * @param {string} path
   * @return {Promise<object>}
   * @private
   */
  static async loadConfig(path) {
    try {
      const stat = await fs.stat(path);

      if (!stat.isFile()) {
        return {};
      }
    } catch (error) {
      return {};
    }

    if (path.endsWith(".json")) {
      const file = await fs.readFile(path);
      return JSON.parse(file.toString());
    }
    else {
      return import(path);
    }
  }
}

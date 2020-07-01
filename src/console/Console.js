import path from "path";
import Command from "../../base/Command.js";
import { app as Felony } from "../../Felony.js";

/**
 * Handler for console commands that will preload all commands and handle their running.
 *
 * @class
 */
export default class Console {
  /**
   * @type Command[]
   */
  commands = [];

  /**
   * List all the available commands loaded in the console.
   *
   * @return {Promise<void>}
   */
  async list() {
    let commands = [];
    let integrated = [];

    for (const Cmd of this.commands) {
      commands.push({
        command: Cmd.signature,
        description: Cmd.description,
        usage: Cmd.usage || `command=${Cmd.signature}`,
      });

      if (Cmd.integrated === true) {
        integrated.push(Cmd.signature);
      }
    }

    commands = commands.sort((a, b) => {
      return a.command.localeCompare(b.command);
    });

    const I = commands.filter((c) => integrated.indexOf(c.command) !== -1);
    const A = commands.filter((c) => integrated.indexOf(c.command) === -1);

    console.log(` `);
    console.log(`| Integrated commands:`);
    console.table(I);

    if (A.length) {
      console.log(` `);
      console.log(`| Application commands:`);
      console.table(A);
    }
  }

  /**
   * Run the command with given payload.
   *
   * @param {string} signature
   * @param {object} payload
   * @return {Promise<any>}
   */
  async run(signature, payload) {
    for (const Cmd of this.commands) {
      if (Cmd.signature !== signature) {
        continue;
      }

      return new Cmd(payload, Felony.arguments.command === Cmd.signature).handle();
    }

    throw new Error(`Unresolved command with signature ${signature}`);
  }

  /**
   * Load all the commands onto the object and prepare them for running.
   *
   * @return {Promise<void>}
   */
  async load() {
    const commands = (await Felony.kernel.readRecursive(path.resolve(Felony.appRootPath, "commands")))
        .concat(await Felony.kernel.readRecursive(path.resolve(Felony.felonyPath, "support", "commands")));

    for (const command of commands) {
      const Imported = (await import(command)).default;

      if (Imported && Imported.signature) {
        if (Imported.integrated) {
          Imported.__path = command.replace(`${Felony.felonyPath}/`, "Felony/");
        } else {
          Imported.__path = command.replace(`${Felony.appRootPath}/`, "");
        }

        this.commands.push(Imported);
      }
    }
  }
}

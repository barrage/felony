import path from "path";
import Command from "../../base/Command.js";

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
   * @param {Kernel} kernel
   */
  constructor(kernel) {
    this.kernel = kernel;
  }

  /**
   * List all the available commands loaded in the console.
   *
   * @return {Promise<void>}
   */
  async list() {
    const commands = [];
    const integrated = [];

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

    const I = commands
      .filter((c) => integrated.indexOf(c.command) !== -1)
      .sort((a, b) => {
        return a.command.localeCompare(b.command);
      });

    const A = commands
      .filter((c) => integrated.indexOf(c.command) === -1)
      .sort((a, b) => {
        return a.command.localeCompare(b.command);
      });

    console.log(" ");
    console.log("| Integrated commands:");
    console.table(I);

    if (A.length) {
      console.log(" ");
      console.log("| Application commands:");
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

      return new Cmd(payload, this.kernel.felony.arguments.command === Cmd.signature).handle();
    }

    throw new Error(`Unresolved command with signature ${signature}`);
  }

  /**
   * Load all the commands onto the object and prepare them for running.
   *
   * @return {Promise<void>}
   */
  async load() {
    const commands = (await this.kernel.readRecursive(path.resolve(this.kernel.felony.appRootPath, "commands")))
      .concat(await this.kernel.readRecursive(path.resolve(this.kernel.felony.felonyPath, "support", "commands")));

    for (const command of commands) {
      const Imported = (await import(command)).default;

      if (Imported && Imported.__kind === "Command" && Imported.signature) {
        if (Imported.integrated) {
          let replacePath = `${this.kernel.felony.felonyPath}/`; //we need to adjust the path depending on operating system
          if(command.startsWith('file://')){
            replacePath = `file://${this.kernel.felony.felonyPath}\\`;
          }
          Imported.__path = command.replace(replacePath, "Felony/");
          if(replacePath.startsWith('file://')){
            Imported.__path = Imported.__path.replace('\\', '/'); //adjusting the path
          }
        } else {
          let replacePath = `${this.kernel.felony.appRootPath}/`;
          if(command.startsWith('file://')){ //we need to adjust the path depending on operating system
            replacePath = `file://${this.kernel.felony.appRootPath}\\`
          }
          Imported.__path = command.replace(replacePath, "");
        }

        this.commands.push(Imported);
      }
    }
  }
}

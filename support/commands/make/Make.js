import path from "path";
import { promises as fs } from "fs";
import Command from "../../../base/Command.js";

/**
 * Base generator command class
 *
 * @class
 */
export default class Make extends Command {
  /**
   * Create file from given stub path and replacements object.
   *
   * @param {string} p
   * @param {object} replacements
   * @return {Promise<string>}
   */
  async createFile(p, replacements) {
    const _path = path.resolve(p);

    const loaded = await fs.readFile(_path);
    const decoder = new TextDecoder("utf-8");
    const stub = decoder.decode(loaded).split("\n");

    for (let i = 0; i < stub.length; i++) {
      for (const variable in replacements) {
        stub[i] = stub[i].replace(`{${variable}}`, replacements[variable]);
      }
    }

    return stub.join("\n");
  }

  /**
   * Store given content to path.
   *
   * @param {string} p
   * @param {string} content
   * @return {Promise<void>}
   */
  async storeFile(p, content) {
    while (p.startsWith(".") || p.startsWith("/")) {
      p = p.slice(1, p.length);
    }

    const dirs = p.split("/");
    dirs.pop();

    let create = `${Felony.appRootPath}/`;

    for (const dir of dirs) {
      create = `${create}${dir}/`;

      try {
        await fs.stat(create);
      }
      catch (error) {
        await fs.mkdir(create);
      }
    }

    const _path = path.resolve(Felony.appRootPath, p);

    let stat = null;

    try {
      stat = await fs.stat(_path);
    }
    catch (error) {
      // do nothing
    }

    if (stat && stat.isFile()) {
      throw new Error(`MakeCommand: file ${_path} already exists`);
    }

    await fs.writeFile(_path, content);
  }
}

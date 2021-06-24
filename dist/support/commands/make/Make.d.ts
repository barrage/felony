import Command from "../../../base/Command";
/**
 * Base generator command class
 *
 * @class
 */
export default class Make extends Command {
    /**
     * Use the this.payload.name in order to figure out if we need
     * typescript or javascript file and return the proper stubs file location.
     *
     * @param {string} filename
     * @param {string} [stubsFilename]
     * @return {string}
     */
    stubsDir(filename: string, stubsFilename?: string): string;
    /**
     * Create file from given stub path and replacements object.
     *
     * @param {string} p
     * @param {any} replacements
     * @return {Promise<string>}
     */
    createFile(p: string, replacements: any): Promise<string>;
    /**
     * Store given content to path.
     *
     * @param {string} p
     * @param {string} content
     * @return {Promise<void>}
     */
    storeFile(p: string, content: string): Promise<void>;
}

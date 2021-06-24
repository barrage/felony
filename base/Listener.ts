import FelonyEvent, { FelonyEventInterface } from "./FelonyEvent";

interface ListenerInterface {
  handle(): Promise<any>;
}

/**
 * Listener definition for listening on raised events during the runtime.
 *
 * @class
 */
export default class Listener implements ListenerInterface {
  /**
   * Static property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  static __kind: string = "Listener";

  /**
   * Property lettings us know what kind of class this is
   *
   * @type {string}
   * @private
   */
  __kind: string = "Listener";

  /**
   * List of events that this listener will listen to
   *
   * @type {string[]}
   */
  static listen: string[] = [];

  /**
   * After construction this is where the Event will be stored.
   *
   * @type {typeof FelonyEvent|FelonyEvent|FelonyEventInterface}
   */
  event: typeof FelonyEvent|FelonyEvent|FelonyEventInterface;

  /**
   * Constructor of the listener that will get implementation of
   * Event passed to it.
   *
   * @param {typeof FelonyEvent|FelonyEvent|FelonyEventInterface} event
   */
  constructor(event: typeof FelonyEvent|FelonyEvent|FelonyEventInterface) {
    this.event = event;
  }

  /**
   * Handler on the listener class that will do something
   * with forwarded job.
   *
   * @return {Promise<any>}
   */
  async handle(): Promise<any> {}
}

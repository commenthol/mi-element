/**
 * @implements {HostController}
 */
export class ContextProvider implements HostController {
    /**
     * @param {HTMLElement} host
     * @param {Context} context
     * @param {any} initialValue
     */
    constructor(host: HTMLElement, context: Context, initialValue: any);
    host: HTMLElement;
    context: Context;
    state: any;
    hostConnected(): void;
    hostDisconnected(): void;
    /**
     * @param {any} newValue
     */
    set value(newValue: any);
    /**
     * @returns {any}
     */
    get value(): any;
    notify(): void;
    /**
     * @private
     * @param {ContextRequestEvent} ev
     */
    private onContextRequest;
}
export class ContextRequestEvent extends Event {
    /**
     * @param {Context} context
     * @param {(value: any, unsubscribe?: () => void) => void} callback
     * @param {boolean} [subscribe=false] subscribe to value changes
     */
    constructor(context: Context, callback: (value: any, unsubscribe?: () => void) => void, subscribe?: boolean | undefined);
    context: Context;
    callback: (value: any, unsubscribe?: () => void) => void;
    subscribe: boolean | undefined;
}
/**
 * @implements {HostController}
 */
export class ContextConsumer implements HostController {
    /**
     * @param {HTMLElement} host
     * @param {Context} context
     * @param {object} [options]
     * @param {boolean} [options.subscribe=false] subscribe to value changes
     * @param {(any) => boolean} [options.validate] validation function
     */
    constructor(host: HTMLElement, context: Context, options?: {
        subscribe?: boolean | undefined;
        validate?: ((any: any) => boolean) | undefined;
    } | undefined);
    host: HTMLElement;
    context: Context;
    subscribe: boolean;
    validate: (any: any) => boolean;
    value: any;
    unsubscribe: any;
    hostConnected(): void;
    hostDisconnected(): void;
    dispatchRequest(): void;
    _callback(value: any, unsubscribe: any): void;
}
export type HostController = import("./element.js").HostController;
export type Context = string | Symbol;

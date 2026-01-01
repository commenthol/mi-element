/**
 * @template T
 * @implements {HostController}
 */
export class ContextProvider<T> implements HostController {
    /**
     * @param {HTMLElement} host
     * @param {Context} context
     * @param {T|null} [initialValue]
     */
    constructor(host: HTMLElement, context: Context, initialValue?: T | null);
    host: HTMLElement;
    context: Context;
    state: import("mi-signal").State<T | null | undefined>;
    hostConnected(): void;
    hostDisconnected(): void;
    /**
     * @param {T|null|undefined} newValue
     */
    set(newValue: T | null | undefined): void;
    /**
     * @returns {T|null|undefined}
     */
    get(): T | null | undefined;
    set value(newValue: T | null | undefined);
    get value(): T | null | undefined;
    /**
     * @private
     * @param {ContextRequestEvent} ev
     */
    private onContextRequest;
}
/**
 * @template T
 */
export class ContextRequestEvent<T> extends Event {
    /**
     * @param {Context} context
     * @param {(value: T|null|undefined, unsubscribe?: () => void) => void} callback
     * @param {boolean} [subscribe=false] subscribe to value changes
     */
    constructor(context: Context, callback: (value: T | null | undefined, unsubscribe?: () => void) => void, subscribe?: boolean);
    context: Context;
    callback: (value: T | null | undefined, unsubscribe?: () => void) => void;
    subscribe: boolean | undefined;
}
/**
 * @template T
 * @implements {HostController}
 */
export class ContextConsumer<T> implements HostController {
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
    });
    host: HTMLElement;
    context: Context;
    subscribe: boolean;
    validate: (any: any) => boolean;
    unsubscribe: any;
    /**
     * @returns {T|null|undefined}
     */
    get(): T | null | undefined;
    /**
     * @returns {T|null|undefined}
     */
    get value(): T | null | undefined;
    hostConnected(): void;
    hostDisconnected(): void;
    dispatchRequest(): void;
    _callback(value: any, unsubscribe: any): void;
    #private;
}
export type HostController = import("./element.js").HostController;
export type Context = string | Symbol;

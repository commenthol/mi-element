/**
 * effect subscribes to state at first run only. Do not hide a signal.get()
 * inside conditionals!
 * @param {() => void|Promise<void>} cb
 */
export function effect(cb: () => void | Promise<void>): () => void;
/**
 * @template T
 * @typedef {(value?: T|null, nextValue?: T|null) => boolean} EqualsFn
 * Custom comparison function between old and new value
 * default `(value, nextValue) => value === nextValue`
 */
/**
 * @template T
 * @typedef {{equals: EqualsFn<T>}} SignalOptions
 */
/**
 * read- write signal
 * @template T
 */
export class State<T> extends EventTarget {
    /**
     * @param {T|null} [value]
     * @param {SignalOptions<T>} [options]
     */
    constructor(value?: T | null | undefined, options?: SignalOptions<T> | undefined);
    /**
     * @returns {T|null|undefined}
     */
    get(): T | null | undefined;
    /**
     * @param {T|null|undefined} nextValue
     */
    set(nextValue: T | null | undefined): void;
    #private;
}
export function createSignal<T>(initialValue: T, options?: SignalOptions<T> | undefined): State<T>;
/**
 * @template T
 */
export class Computed<T> {
    /**
     * @param {() => T} cb
     */
    constructor(cb: () => T);
    /**
     * @template T
     * @returns {T}
     */
    get<T_1>(): T_1;
    #private;
}
declare namespace _default {
    export { State };
    export { createSignal };
    export { effect };
    export { Computed };
}
export default _default;
/**
 * Custom comparison function between old and new value
 * default `(value, nextValue) => value === nextValue`
 */
export type EqualsFn<T> = (value?: T | null, nextValue?: T | null) => boolean;
export type SignalOptions<T> = {
    equals: EqualsFn<T>;
};

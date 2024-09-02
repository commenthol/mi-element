/**
 * @param {() => void} cb
 */
export function effect(cb: () => void): () => void;
/**
 * @template T
 * @typedef {{equals: (value?: T|null, nextValue?: T|null) => boolean}} SignalOptions
 */
/**
 * tries to follow proposal (a bit)
 * @see https://github.com/tc39/proposal-signals
 * @template T
 */
export class State<T> {
    /**
     * @param {T|null} [value]
     * @param {SignalOptions<T>} [options]
     */
    constructor(value?: T | null | undefined, options?: SignalOptions<T> | undefined);
    subscribers: Set<any>;
    value: T | null | undefined;
    equals: (value?: T | null | undefined, nextValue?: T | null | undefined) => boolean;
    /**
     * @returns {T|null|undefined}
     */
    get(): T | null | undefined;
    /**
     * @param {T|null|undefined} nextValue
     */
    set(nextValue: T | null | undefined): void;
}
export function createSignal<T>(value: T): State<T>;
export class Computed {
    /**
     * @param {() => void} cb
     */
    constructor(cb: () => void);
    state: State<any>;
    /**
     * @template T
     * @returns {T}
     */
    get<T>(): T;
}
declare namespace _default {
    export { State };
    export { createSignal };
    export { effect };
    export { Computed };
}
export default _default;
export type SignalOptions<T> = {
    equals: (value?: T | null, nextValue?: T | null) => boolean;
};

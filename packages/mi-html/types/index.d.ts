export * from "uhtml/reactive";
export const render: <T>(where: T, what: (() => import("uhtml/reactive").Hole) | import("uhtml/reactive").Hole) => T;
export { default as Signal, createSignal, effect, State, Computed } from "mi-signal";

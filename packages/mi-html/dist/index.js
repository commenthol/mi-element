import { effect } from 'mi-signal';

export { Computed, default as Signal, State, createSignal, effect } from 'mi-signal';

import { attach } from 'uhtml/reactive';

export * from 'uhtml/reactive';

const render = attach(effect);

export { render };

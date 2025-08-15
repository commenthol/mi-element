import { effect } from 'mi-signal';

import { reactive as reactive$1 } from 'uhtml/reactive';

export * from 'uhtml/reactive';

const render = reactive$1(effect);

export { render };

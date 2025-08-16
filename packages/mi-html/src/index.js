export {
  default as Signal,
  createSignal,
  effect,
  State,
  Computed
} from 'mi-signal'
export * from 'uhtml/reactive'
import { effect } from 'mi-signal'
import { reactive } from 'uhtml/reactive'
export const render = reactive(effect)

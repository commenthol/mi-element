export {
  default as Signal,
  createSignal,
  effect,
  State,
  Computed
} from 'mi-signal'
export * from 'uhtml/reactive'
import { effect } from 'mi-signal'
import { attach } from 'uhtml/reactive'
export const render = attach(effect)

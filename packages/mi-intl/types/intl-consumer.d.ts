/** @typedef {import('mi-element').MiElement} MiElement */
/**
 * ContextConsumer subscribing to MiIntlProvider context
 */
export class IntlConsumer extends ContextConsumer<any> {
    /**
     * @param {MiElement} miElement
     * @param {boolean} [subscribe=true]
     */
    constructor(miElement: MiElement, subscribe?: boolean);
}
export type MiElement = import("mi-element").MiElement;
import { ContextConsumer } from 'mi-element';

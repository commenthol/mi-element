/**
 * Connects IntlConsumer to MiIntlProvider context
 * @example
 * ```js
 * import { define } from 'mi-element'
 * import { MiIntlMessage } from 'mi-intl'
 *
 * define('mi-message',
 *   class extends MiIntlMessage {
 *     static get properties() {
 *       return { label: {}, value: {} }
 *     }
 *     update() {
 *       this.renderRoot.textContent = this.t(this.label, this.value)
 *     }
 *   }
 * )
 * ```
 */
export class MiIntlMessage extends MiElement {
    t(label: any, value: any): any;
    #private;
}
import { MiElement } from 'mi-element';

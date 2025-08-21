/**
 * Connects IntlConsumer to MiIntlProvider context
 * @example
 * ```js
 * import { define } from 'mi-element'
 * import { MiIntlMessage } from 'mi-intl'
 *
 * define('mi-message',
 *   class extends MiIntlMessage {
 *     static get attributes() {
 *       return { label: String, value: String }
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

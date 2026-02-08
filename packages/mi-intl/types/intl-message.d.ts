/**
 * Connects IntlConsumer to MiIntlProvider context
 * @example
 * ```js
 * import { define } from 'mi-element'
 * import { MiIntlMessage } from 'mi-intl'
 *
 * define('mi-message', MiIntlMessage)
 * // then use <mi-message label="my.label" value='{ "count": 5 }'></mi-message> in your template
 * ```
 */
export class MiIntlMessage extends MiElement {
    static get properties(): {
        label: {};
        value: {};
        unsafeHtml: {
            type: BooleanConstructor;
            initial: boolean;
        };
    };
    /**
     * @param {string} label
     * @param {object} [value]
     * @returns
     */
    t(label: string, value?: object): any;
    update(): void;
    value: any;
    #private;
}
import { MiElement } from 'mi-element';

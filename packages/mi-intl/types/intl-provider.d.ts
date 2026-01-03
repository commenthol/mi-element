/** @typedef {import('./types.js').I18nOptions} I18nOptions */
/** @typedef {import('./types.js').IntlContext} IntlContext */
export const INTL_CONTEXT: "mi-intl";
export class MiIntlProvider extends MiElement {
    static get properties(): {
        /** translation version */
        version: {
            initial: string;
        };
        /** pre-selected language */
        lng: {
            initial: string;
        };
        /** default namespace */
        defaultNs: {
            initial: string;
        };
        /** used namespaces, comma separated */
        ns: {
            type: ArrayConstructor;
            initial: string;
        };
        /** supported languages, comma separated */
        supportedLngs: {
            type: ArrayConstructor;
            initial: string;
        };
        /** path for loading resources */
        localesPath: {
            initial: string;
        };
        /** use translation label */
        useLabel: {
            type: BooleanConstructor;
            initial: boolean;
        };
        /** debugging support */
        debug: {
            type: BooleanConstructor;
            initial: boolean;
        };
        /** loading state */
        loading: {
            type: BooleanConstructor;
            attribute: boolean;
        };
    };
    static template: string;
    /**
     * @param {I18nOptions} options
     */
    set options(options: I18nOptions);
    i18n: I18n | undefined;
    /**
     * @protected
     * @returns {IntlContext}
     */
    protected _contextValue(): IntlContext;
    /**
     * @param {string} [lng]
     * @returns {Promise<void>}
     */
    changeLanguage(lng?: string): Promise<void>;
    loading: boolean | undefined;
    provider: ContextProvider<import("./types.js").IntlContext> | undefined;
    update(): void;
}
export type I18nOptions = import("./types.js").I18nOptions;
export type IntlContext = import("./types.js").IntlContext;
import { MiElement } from 'mi-element';
import { I18n } from './i18n.js';
import { ContextProvider } from 'mi-element';

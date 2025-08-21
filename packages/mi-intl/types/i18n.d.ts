export function reduceSupportedLangs(lng: string, supportedLngs: string[], browserLngs?: string[]): string[];
export class I18n {
    /**
     * @param {I18nOptions} options
     */
    constructor(options: I18nOptions);
    options: {
        version: string;
        ns: string[];
        localesPath: string;
        useLabel: boolean;
        log?: {
            debug?: Function;
            error?: Function;
        };
        cookie: {
            name?: string;
            path?: string;
            sameSite?: string;
            maxAge?: number;
            domain?: string;
            expires?: string | Date;
            secure?: boolean;
        } | {
            name: string;
            path: string;
        };
    };
    /** default namespace */
    defaultNs: string;
    /** fallback language */
    fallbackLng: string;
    /** selected language for translation, must be part of supportedLngs */
    lng: string;
    /** supported languages with translations */
    supportedLngs: string[];
    /** user assigned language with variant */
    userLng: string | undefined;
    /** available resources (if any) */
    resources: {
        [lng: string]: {
            [ns: string]: {
                [label: string]: string;
            };
        };
    };
    /**
     * translation function
     * @param {string} label
     * @param {object} values
     * @returns {string}
     */
    t(label: string, values?: object): string;
    /**
     * get all supported languages
     * @returns {string[]}
     */
    getLanguages(): string[];
    /**
     * get the user selected (cookie) or browser language
     * @returns {string}
     */
    getUserLanguage(): string;
    /**
     * reset user selected language by deleting language cookie
     */
    resetUserLanguage(): void;
    /**
     * @protected
     * @returns {[cookieLng:string, browserLng:string]}
     */
    protected _getSettings(): [cookieLng: string, browserLng: string];
    /**
     * @protected
     * set language cookie using cookie options
     */
    protected _setCookie(): void;
    /**
     * @protected
     * @param {string} [lng]
     * @returns {string[]}
     */
    protected _setLanguage(lng?: string): string[];
    /**
     * changes the language
     * @param {string} [lng]
     * @return {Promise<void>}
     */
    changeLanguage(lng?: string): Promise<void>;
    /**
     * @param {string} ns
     * @return {Promise<void>}
     */
    changeNamespace(ns: string): Promise<void>;
    /**
     * @param {string[]} lngs
     * @param {string[]} [ns]
     * @return {Promise<(LoadResponse|undefined|void)[]>}
     */
    loadLanguages(lngs?: string[], ns?: string[]): Promise<(LoadResponse | undefined | void)[]>;
    /**
     * @protected
     * @param {{
     *  lng: string
     *  ns: string
     * }} param0
     * @return {Promise<undefined|LoadResponse>}
     */
    protected _load({ lng, ns }: {
        lng: string;
        ns: string;
    }): Promise<undefined | LoadResponse>;
}
export type I18nOptions = import("./types.js").I18nOptions;
export type LoadResponse = {
    ok: boolean;
    status: number;
    lng: string;
    ns: string;
};

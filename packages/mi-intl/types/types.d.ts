export interface I18nOptions {
    /**
     * list of supported languages with translations
     */
    supportedLngs: string[];
    /**
     * version info
     */
    version?: string;
    /**
     * selected language
     */
    lng?: string;
    /**
     * fallback language; Must be part of supportedLngs;
     * Default is first supported language from `supportedLngs`
     */
    fallbackLng?: string;
    /**
     * supported namespaces; all required namespaces for required translations
     * must be named to load all namespaces when changing languages
     * @default ['translations']
     */
    ns?: string[];
    /**
     * default namespace
     * @default 'translations'
     */
    defaultNs?: string;
    /**
     * path for resources e.g. '/locales/{lng}/{ns}.json'
     * @default '/locales/{lng}/{ns}.json?v={version}'
     */
    localesPath?: string;
    /**
     * use t(label) for translation
     * @default false
     */
    useLabel?: boolean;
    /**
     * debugging support
     * @default false
     */
    debug?: boolean;
    /**
     * logger e.g. `{ debug: console.debug, error: console.error }`
     */
    log?: {
        debug?: Function;
        error?: Function;
    };
    /**
     * resources object
     */
    resources?: {
        [lng: string]: {
            [ns: string]: {
                [label: string]: string;
            };
        };
    };
    /**
     * language cookie
     */
    cookie?: {
        /** @default "lc" */
        name?: string;
        /** @default "/" */
        path?: string;
        /** @default "Strict" */
        sameSite?: string;
        /** */
        maxAge?: number;
        domain?: string;
        expires?: string | Date;
        secure?: boolean;
    };
}
export interface IntlContext {
    /** translation function */
    t: (label: string, values?: any) => string;
    /** current selected language */
    lng: string;
    /** list all available translation languages */
    getLanguages: () => string[];
    /** change the current language */
    changeLanguage: (lng: string) => Promise<void>;
    /** language is loading */
    loading: boolean;
}

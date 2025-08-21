/**
 * parses a cookie string
 * @param {string} cookieStr
 * @returns {{[cookieName: string]: string}|{}}
 */
export function cookieParse(cookieStr?: string): {
    [cookieName: string]: string;
} | {};
/**
 * serializes a cookie
 * @param {string} name
 * @param {any} value
 * @param {object} options
 * @param {number} [options.maxAge]
 * @param {string} [options.domain]
 * @param {string} [options.path]
 * @param {number|string|Date} [options.expires]
 * @param {boolean} [options.httpOnly=true]
 * @param {boolean} [options.secure=false]
 * @param {string|'Strict'|'Lax'|'None'|''|false} [options.sameSite='Strict']
 * @returns {string}
 */
export function cookieSerialize(name: string, value: any, options: {
    maxAge?: number | undefined;
    domain?: string | undefined;
    path?: string | undefined;
    expires?: string | number | Date | undefined;
    httpOnly?: boolean | undefined;
    secure?: boolean | undefined;
    sameSite?: string | false | undefined;
}): string;

/**
 * render HTML template into given node with support for special attributes
 *
 * @param {Element} node to render content
 * @param {string|UnsafeHtml} template HTML template string
 * @param {Record<string, Function>|HTMLElement} [handlers={}] event handlers or HTMLElement for method lookup
 * @returns {Record<string, Element>} references collected
 */
export function render(node: Element, template: string | UnsafeHtml, handlers?: Record<string, Function> | HTMLElement): Record<string, Element>;
/**
 * Post-processing of rendered nodes to handle special attributes:
 *
 * - `?attr=${boolean}`  -> boolean attribute
 * - `.prop=${objectOrAnyValue}` -> property binding for objects or any value
 * - `...=${object}` -> spread properties from object
 * - `@event=${(e) => {}}` -> event listener with templated inline function
 * - `@event="handlerName"` -> event listener using handler name from handlers object
 * - `ref="refName"` -> element reference collected and returned
 *
 * NOTE: For all attributes and event names always use kebab-case. For properties it will be converted to camelCase.
 * Attributes starting with `?`, `@`, or `.` are removed from DOM after processing
 *
 * @param {Element} node to append rendered content
 * @param {Record<string, Function>|HTMLElement} [handlers={}] event handlers or HTMLElement for method lookup
 * @param {Record<string, Element>} [refs={}] collected references
 * @returns {Record<string, Element>} references collected
 */
export function renderAttrs(node: Element, handlers?: Record<string, Function> | HTMLElement, refs?: Record<string, Element>): Record<string, Element>;
export const globalRenderCache: RenderCache;
export function unsafeHtml(str: string): string;
export function escHtml(string: string): string;
export function html(strings: TemplateStringsArray, ...values: any[]): string;
/**
 * A helper class to avoid double escaping of HTML strings
 */
declare class UnsafeHtml extends String {
}
/**
 * A cache for rendering values to avoid keeping them in memory too long
 */
declare class RenderCache {
    cnt: number;
    cache: Map<any, any>;
    last: number;
    get size(): number;
    _inc(): number;
    clear(): void;
    set(value: any): string;
    get(key: any): any;
}
export {};

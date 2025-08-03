/**
 * apply global style sheets to shadowRoot
 * @param {ShadowRoot} renderRoot
 * @example
 * class MyComponent extends MiElement {
 *  render() {
 *    addGlobalStyles(this.renderRoot)
 *  }
 * }
 */
export function addGlobalStyles(renderRoot: ShadowRoot): void;
export function classMap(map: {
    [name: string]: string | boolean | number;
}): string;
export function styleMap(map: {
    [name: string]: string | number | undefined | null;
}, options?: {
    unit?: string | undefined;
}): string;
export function css(strings: any, ...values: any[]): string;

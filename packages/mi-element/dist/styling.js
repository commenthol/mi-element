import { camelToKebabCase } from './case.js';

const classNames = (...args) => {
  const classList = [];
  return args.forEach(arg => {
    arg && ('string' == typeof arg ? classList.push(arg) : Array.isArray(arg) ? classList.push(classNames(...arg)) : 'object' == typeof arg && Object.entries(arg).forEach(([key, value]) => {
      value && classList.push(key);
    }));
  }), classList.join(' ');
}, styleMap = (map, options) => {
  const {unit: unit = "px"} = options || {}, acc = [];
  for (const [name, value] of Object.entries(map ?? {})) {
    if (null == value) continue;
    const _unit = Number.isFinite(value) ? unit : '';
    acc.push(`${camelToKebabCase(name)}:${value}${_unit}`);
  }
  return acc.join(';');
};

let globalSheets = null;

function addGlobalStyles(renderRoot) {
  renderRoot.adoptedStyleSheets.push(...(null === globalSheets && (globalSheets = Array.from(document.styleSheets).map(({cssRules: cssRules}) => {
    const sheet = new CSSStyleSheet, css = Array.from(cssRules).map(rule => rule.cssText).join(' ');
    return sheet.replaceSync(css), sheet;
  })), globalSheets));
}

const css = (strings, ...values) => String.raw({
  raw: strings
}, ...values);

export { addGlobalStyles, classNames, css, styleMap };

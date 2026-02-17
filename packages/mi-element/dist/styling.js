import { camelToKebabCase } from './case.js';

const classNames = (...args) => {
  const classList = [];
  return args.forEach(arg => {
    arg && ('string' == typeof arg ? classList.push(arg) : 'object' == typeof arg && Object.entries(arg).forEach(([key, value]) => {
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

class UnsafeCss extends String {}

const unsafeCss = str => new UnsafeCss(str), escMap = {
  '&': '\\26 ',
  '<': '\\3c ',
  '>': '\\3e '
}, escCss = string => string instanceof UnsafeCss ? string : unsafeCss((string => string.replace(/[&<>]/g, tag => escMap[tag]))('' + string)), css = (strings, ...values) => String.raw({
  raw: strings
}, ...values.map(escCss));

export { addGlobalStyles, classNames, css, escCss, styleMap, unsafeCss };

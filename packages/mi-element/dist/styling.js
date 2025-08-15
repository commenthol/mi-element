import { camelToKebabCase } from './case.js';

const classMap = map => {
  const acc = [];
  for (const [name, value] of Object.entries(map ?? {})) value && acc.push(name);
  return acc.join(' ');
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
  renderRoot.adoptedStyleSheets.push(...(null === globalSheets && (globalSheets = Array.from(document.styleSheets).map((({cssRules: cssRules}) => {
    const sheet = new CSSStyleSheet, css = Array.from(cssRules).map((rule => rule.cssText)).join(' ');
    return sheet.replaceSync(css), sheet;
  }))), globalSheets));
}

export { addGlobalStyles, classMap, styleMap };

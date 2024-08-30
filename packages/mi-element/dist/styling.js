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

export { classMap, styleMap };

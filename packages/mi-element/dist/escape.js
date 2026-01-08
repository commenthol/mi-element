import { toJson } from './utils.js';

const globalRenderCache = new class {
  cnt=0;
  map=new Map;
  cache=new WeakMap;
  _inc() {
    return this.cnt = 268435455 & ++this.cnt, this.cnt;
  }
  clear() {
    this.cnt = 0, this.map.clear();
  }
  set(value) {
    const key = '__rc:' + this._inc().toString(36), ref = {};
    return this.map.set(key, ref), this.cache.set(ref, value), key;
  }
  get(key) {
    const ref = this.map.get(key);
    return this.map.delete(key), this.cache.get(ref);
  }
};

class UnsafeHtml extends String {}

const unsafeHtml = str => new UnsafeHtml(str), escMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}, esc = string => string.replace(/[&<>"']/g, tag => escMap[tag]), escHtml = string => string instanceof UnsafeHtml ? string : unsafeHtml(esc('' + string)), escValue = any => {
  if (any instanceof UnsafeHtml) return any;
  if ([ 'object', 'function' ].includes(typeof any)) {
    const key = globalRenderCache.set(any);
    return unsafeHtml(key);
  }
  return unsafeHtml(esc('' + any));
}, html = (strings, ...values) => unsafeHtml(String.raw({
  raw: strings
}, ...values.map(val => Array.isArray(val) ? val.map(escValue).join('') : escValue(val))));

function renderAttrs(node, handlers = {}) {
  const refs = {};
  if (node.nodeType === Node.ELEMENT_NODE) for (let attr of node.attributes) {
    const startsWith = attr.name[0], name = attr.name.slice(1);
    let rm = 0;
    if ('?' === startsWith) toJson(attr.value) ? node.setAttribute(name, '') : node.removeAttribute(name), 
    rm = 1; else if ('...' === attr.name) {
      const obj = globalRenderCache.get(attr.value);
      if (obj && 'object' == typeof obj) for (const [k, v] of Object.entries(obj)) node[k] = v;
      rm = 1;
    } else if ('.' === startsWith) node[name] = globalRenderCache.get(attr.value) ?? attr.value, 
    rm = 1; else if ('@' === startsWith) {
      const handlerName = attr.value, fn = globalRenderCache.get(handlerName);
      fn ? node.addEventListener(name, e => fn(e)) : 'function' == typeof handlers[handlerName] && node.addEventListener(name, e => handlers[handlerName](e)), 
      rm = 1;
    } else 'ref' === attr.name && (refs[attr.value] = node, rm = 1);
    rm && requestAnimationFrame(() => {
      node.removeAttribute(attr.name);
    });
  }
  if (0 === node.children.length || customElements.get(node.localName)) return refs;
  for (let child of node.children) Object.assign(refs, renderAttrs(child, handlers));
  return refs;
}

export { escHtml, globalRenderCache, html, renderAttrs, unsafeHtml };

import { toJson } from './utils.js';

const globalRenderCache = new class {
  cnt=0;
  cache=new Map;
  last=0;
  get size() {
    return this.cache.size;
  }
  _inc() {
    return this.cnt = 268435455 & ++this.cnt, this.cnt;
  }
  clear() {
    this.cnt = 0, this.cache.clear();
  }
  set(value) {
    const now = Date.now();
    this.last < now && this.cache.clear(), this.last = now + 5e3;
    const key = '__rc:' + this._inc().toString(36);
    return this.cache.set(key, value), key;
  }
  get(key) {
    const value = this.cache.get(key);
    return this.cache.delete(key), value;
  }
};

class UnsafeHtml extends String {}

const unsafeHtml = str => new UnsafeHtml(str), escMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}, escRe = /[&<>"']/g, esc = string => string.replace(escRe, tag => escMap[tag]), escHtml = string => string instanceof UnsafeHtml ? string : unsafeHtml(esc('' + string)), escValue = any => {
  if (any instanceof UnsafeHtml) return any;
  const t = typeof any;
  if ("object" === t || "function" === t) {
    const key = globalRenderCache.set(any);
    return unsafeHtml(key);
  }
  return unsafeHtml(esc('' + (any ?? '')));
}, html = (strings, ...values) => unsafeHtml(String.raw({
  raw: strings
}, ...values.map(val => Array.isArray(val) ? val.map(escValue).join('') : escValue(val))));

function render(node, template, handlers = {}) {
  const refs = {};
  node.innerHTML = template.toString();
  for (let i = 0, l = node.children.length; i < l; i++) renderAttrs(node.children[i], handlers, refs);
  return refs;
}

const REF = 'ref', REF_Q = '[ref]';

function renderAttrs(node, handlers = {}, refs = {}) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const rmAttrs = [], attrs = node.attributes;
    for (let i = 0, l = attrs.length; i < l; i++) {
      const attr = attrs[i], attrName = attr.name, code = attrName.charCodeAt(0), name = attrName.slice(1);
      let rm = 0;
      if (63 === code) toJson(attr.value) ? node.setAttribute(name, '') : node.removeAttribute(name), 
      rm = 1; else if ('...' === attr.name) {
        const obj = globalRenderCache.get(attr.value);
        if (obj && "object" == typeof obj) for (const [k, v] of Object.entries(obj)) node[k] = v;
        rm = 1;
      } else if (46 === code) node[name] = globalRenderCache.get(attr.value) ?? attr.value, 
      rm = 1; else if (64 === code) {
        const handlerName = attr.value, fn = globalRenderCache.get(handlerName);
        fn ? node.addEventListener(name, fn) : "function" == typeof handlers[handlerName] && node.addEventListener(name, handlers[handlerName]), 
        rm = 1;
      } else attr.name === REF && (refs[attr.value] = node, rm = 1);
      rm && rmAttrs.push(attr.name);
    }
    for (let i = 0, l = rmAttrs.length; i < l; i++) node.removeAttribute(rmAttrs[i]);
  }
  if (customElements.get(node.localName)) {
    const q = node.querySelectorAll(REF_Q);
    for (let el of q) {
      const refName = el.getAttribute(REF);
      refName && !refs[refName] && (refs[refName] = el);
    }
    return refs;
  }
  if (!node.children?.length) return refs;
  for (let child of Array.from(node.children)) renderAttrs(child, handlers, refs);
  return refs;
}

export { escHtml, globalRenderCache, html, render, renderAttrs, unsafeHtml };

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
}, esc = string => string.replace(/[&<>"']/g, tag => escMap[tag]), escHtml = string => string instanceof UnsafeHtml ? string : unsafeHtml(esc('' + string)), OBJECT = 'object', FUNCTION = 'function', escValue = any => {
  if (any instanceof UnsafeHtml) return any;
  if ([ OBJECT, FUNCTION ].includes(typeof any)) {
    const key = globalRenderCache.set(any);
    return unsafeHtml(key);
  }
  return unsafeHtml(esc('' + any));
}, html = (strings, ...values) => unsafeHtml(String.raw({
  raw: strings
}, ...values.map(val => Array.isArray(val) ? val.map(escValue).join('') : escValue(val))));

function render(node, template, handlers = {}) {
  const refs = {}, div = document.createElement('div');
  div.innerHTML = template.toString();
  for (let child of Array.from(div.children)) renderAttrs(child, handlers, refs), 
  node.appendChild(child);
  return refs;
}

const REF = 'ref', REF_Q = '[ref]';

function renderAttrs(node, handlers = {}, refs = {}) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const rmFns = [];
    for (let attr of node.attributes) {
      const startsWith = attr.name[0], name = attr.name.slice(1);
      let rm = 0;
      if ('?' === startsWith) toJson(attr.value) ? node.setAttribute(name, '') : node.removeAttribute(name), 
      rm = 1; else if ('...' === attr.name) {
        const obj = globalRenderCache.get(attr.value);
        if (obj && typeof obj === OBJECT) for (const [k, v] of Object.entries(obj)) node[k] = v;
        rm = 1;
      } else if ('.' === startsWith) node[name] = globalRenderCache.get(attr.value) ?? attr.value, 
      rm = 1; else if ('@' === startsWith) {
        const handlerName = attr.value, fn = globalRenderCache.get(handlerName);
        fn ? node.addEventListener(name, e => fn(e)) : typeof handlers[handlerName] === FUNCTION && node.addEventListener(name, e => handlers[handlerName](e)), 
        rm = 1;
      } else attr.name === REF && (refs[attr.value] = node, rm = 1);
      rm && rmFns.push([ node, attr.name ]);
    }
    rmFns.forEach(([node, name]) => node.removeAttribute(name));
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

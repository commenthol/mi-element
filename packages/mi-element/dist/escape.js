class UnsafeHtml extends String {}

const unsafeHtml = str => new UnsafeHtml(str), escMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
}, escHtml = string => string instanceof UnsafeHtml ? string : unsafeHtml(('' + string).replace(/&amp;/g, '&').replace(/[&<>'"]/g, tag => escMap[tag])), esc = (strings, ...values) => unsafeHtml(String.raw({
  raw: strings
}, ...values.map(val => Array.isArray(val) ? val.map(escHtml).join('') : escHtml(val))));

export { esc, escHtml, unsafeHtml };

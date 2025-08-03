class UnsafeHtml extends String {}

const unsafeHtml = str => new UnsafeHtml(str), escMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
}, escHtml = string => string instanceof UnsafeHtml ? string : ('' + string).replace(/&amp;/g, '&').replace(/[&<>'"]/g, (tag => escMap[tag])), esc = (strings, ...vars) => String.raw({
  raw: strings
}, ...vars.map(escHtml));

export { esc, escHtml, unsafeHtml };

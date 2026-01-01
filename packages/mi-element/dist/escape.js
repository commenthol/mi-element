class UnsafeHtml extends String {}

const unsafeHtml = str => new UnsafeHtml(str), escMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};

let esc = string => string.replace(/&amp;/g, '&').replace(/[&<>]/g, tag => escMap[tag]);

'undefined' != typeof document && (esc = string => {
  const div = document.createElement('div');
  return div.textContent = string, div.innerHTML;
});

const escHtml = string => string instanceof UnsafeHtml ? string : unsafeHtml(esc('' + string)), html = (strings, ...values) => unsafeHtml(String.raw({
  raw: strings
}, ...values.map(val => Array.isArray(val) ? val.map(escHtml).join('') : escHtml(val))));

export { escHtml, html, unsafeHtml };

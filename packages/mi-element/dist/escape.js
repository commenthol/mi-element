const escMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
}, escHtml = string => ('' + string).replace(/&amp;/g, '&').replace(/[&<>'"]/g, (tag => escMap[tag])), escAttr = string => ('' + string).replace(/['"]/g, (tag => escMap[tag])), esc = (strings, ...vars) => strings.map(((string, i) => string + escHtml(vars[i] ?? ''))).join('');

export { esc, escAttr, escHtml };

function cookieParse(cookieStr = "") {
  const parts = cookieStr.split(/\s*;\s*/), cookies = Object.create(null);
  for (const part of parts) {
    const [key, val] = part.split('=');
    if (key && !Object.prototype.hasOwnProperty.call(Object.prototype, key)) {
      const value = decodeURIComponent(val);
      cookies[key] = value;
    }
  }
  return {
    ...cookies
  };
}

const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

function cookieSerialize(name, value, options) {
  const {maxAge: maxAge, domain: domain, path: path, expires: expires, httpOnly: httpOnly = !1, secure: secure = !1, sameSite: sameSite = "Strict"} = options || {};
  if (!name || !fieldContentRegExp.test(name)) throw TypeError('invalid name');
  const parts = [ `${name}=${encodeURIComponent(value)}` ];
  return !isNaN(maxAge - 0) && isFinite(maxAge) && parts.push(`Max-Age=${maxAge}`), 
  domain && fieldContentRegExp.test(domain) && parts.push(`Domain=${domain}`), path && fieldContentRegExp.test(path) && parts.push(`Path=${path}`), 
  isNaN(new Date(expires).getTime()) || parts.push(`Expires=${new Date(expires).toUTCString()}`), 
  httpOnly && parts.push('HttpOnly'), secure && parts.push('Secure'), sameSite && parts.push(`SameSite=${sameSite}`), 
  parts.join('; ');
}

export { cookieParse, cookieSerialize };

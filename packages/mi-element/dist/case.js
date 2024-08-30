const camelToKebabCase = (str = "") => str.replace(/([A-Z])/g, ((_, m) => `-${m.toLowerCase()}`)), kebabToCamelCase = (str = "") => str.toLowerCase().replace(/[-_]\w/g, (m => m[1].toUpperCase()));

export { camelToKebabCase, kebabToCamelCase };

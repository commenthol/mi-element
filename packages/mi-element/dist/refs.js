import { kebabToCamelCase } from './case.js';

function refsById(container) {
  const nodes = container.querySelectorAll?.('[id]') || [], found = {};
  for (const node of nodes) found[kebabToCamelCase(node.getAttribute('id') || node.nodeName.toLowerCase())] = node;
  return found;
}

function refsBySelector(container, selectors) {
  const found = {};
  for (const [name, selector] of Object.entries(selectors)) found[name] = container.querySelector?.(selector);
  return found;
}

export { refsById, refsBySelector };

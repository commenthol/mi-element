function refsBySelector(container, selectors) {
  const found = {};
  for (const [name, selector] of Object.entries(selectors)) found[name] = container.querySelector?.(selector);
  return found;
}

export { refsBySelector };

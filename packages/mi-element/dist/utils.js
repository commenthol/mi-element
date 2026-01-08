const toNumber = any => {
  const n = Number(any);
  return isNaN(n) ? 0 : n;
}, toJson = any => {
  try {
    return JSON.parse(any);
  } catch {
    return;
  }
};

export { toJson, toNumber };

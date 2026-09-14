const normalizeAddress = (address) => {
  if (!address) return '';

  let value = address
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const suffixes = [
    [/\bstreet\b/g, 'st'],
    [/\bavenue\b/g, 'ave'],
    [/\broad\b/g, 'rd'],
    [/\bdrive\b/g, 'dr'],
    [/\blane\b/g, 'ln'],
    [/\bcourt\b/g, 'ct'],
    [/\bboulevard\b/g, 'blvd'],
    [/\bplace\b/g, 'pl'],
  ];

  suffixes.forEach(([pattern, replacement]) => {
    value = value.replace(pattern, replacement);
  });

  return value.replace(/\s+/g, ' ').trim();
};

module.exports = normalizeAddress;

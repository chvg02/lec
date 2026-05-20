export function normalizeSearchText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getSearchTokens(query: string) {
  return normalizeSearchText(query)
    .split(/\s+/)
    .filter(Boolean);
}

export function matchesSearchQuery(
  fields: Array<string | null | undefined>,
  query: string
) {
  const tokens = getSearchTokens(query);

  if (tokens.length === 0) {
    return true;
  }

  const haystack = normalizeSearchText(fields.join(" "));

  return tokens.every((token) => haystack.includes(token));
}

export function getSearchScore(
  fields: Array<string | null | undefined>,
  query: string,
  priorityField?: string | null | undefined
) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return 0;
  }

  const haystack = normalizeSearchText(fields.join(" "));
  const priority = normalizeSearchText(priorityField);
  const tokens = getSearchTokens(query);

  let score = 0;

  if (priority === normalizedQuery) score += 120;
  if (priority.startsWith(normalizedQuery)) score += 80;
  if (haystack.includes(normalizedQuery)) score += 40;

  score += tokens.reduce((total, token) => {
    if (priority.startsWith(token)) return total + 15;
    if (priority.includes(token)) return total + 10;
    if (haystack.includes(token)) return total + 4;
    return total;
  }, 0);

  return score;
}

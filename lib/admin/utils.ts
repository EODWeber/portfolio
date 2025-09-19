export function parseCsv(input: string | null | undefined): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseKeyValueLines(input: string | null | undefined) {
  if (!input) return [] as Array<{ key: string; value: string }>;
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [key, ...rest] = line.split("|");
      return {
        key: key.trim(),
        value: rest.join("|").trim(),
      };
    })
    .filter((item) => item.key.length > 0 && item.value.length > 0);
}

export function serializeKeyValueLines(
  records: Array<{ key: string; value: string }> | null | undefined,
) {
  if (!records || records.length === 0) return "";
  return records.map((record) => `${record.key}|${record.value}`).join("\n");
}

export function serializeHighlights(
  highlights: Array<{ label: string; value: string }> | null | undefined,
) {
  if (!highlights || highlights.length === 0) return "";
  return highlights.map((item) => `${item.label}|${item.value}`).join("\n");
}

export function parseHighlights(input: string | null | undefined) {
  return parseKeyValueLines(input).map(({ key, value }) => ({ label: key, value }));
}

export function serializeOutcomes(
  outcomes: Array<{ metric: string; value: string }> | null | undefined,
) {
  if (!outcomes || outcomes.length === 0) return "";
  return outcomes.map((item) => `${item.metric}|${item.value}`).join("\n");
}

import { formatMetricKey } from "@/lib/utils";
import type { CaseStudyMetrics } from "@/lib/supabase/types";

export type CaseStudyMetricDetail = {
  title: string;
  description: string;
};

export type CaseStudyMetricRecord = Record<string, CaseStudyMetricDetail>;

export type CaseStudyMetricEntry = CaseStudyMetricDetail & { key: string };

type SanitizeOptions = {
  strict?: boolean;
};

const TITLE_KEYS = ["title", "Title"] as const;
const DESCRIPTION_KEYS = ["description", "Description"] as const;

function defaultMetricTitle(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) return "";
  if (/^[A-Z0-9]+$/.test(trimmed)) return trimmed;
  if (/^[a-z0-9]+$/.test(trimmed) && trimmed.length <= 4) {
    return trimmed.toUpperCase();
  }
  if (/[\s_-]/.test(trimmed)) return formatMetricKey(trimmed);
  return formatMetricKey(trimmed);
}

function getStringValue(
  source: Record<string, unknown>,
  keys: readonly string[],
): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

function sanitizeCaseStudyMetricsRecord(
  record: Record<string, unknown>,
  options: SanitizeOptions = {},
): CaseStudyMetricRecord {
  const entries = Object.entries(record);
  const result: CaseStudyMetricRecord = {};

  for (const [rawKey, rawValue] of entries) {
    const key = rawKey?.toString().trim();
    if (!key) {
      if (options.strict) {
        throw new Error("Metric keys must be non-empty strings.");
      }
      continue;
    }

    if (rawValue == null) {
      if (options.strict) {
        throw new Error(`Metric "${key}" must include details.`);
      }
      continue;
    }

    if (typeof rawValue === "string") {
      if (options.strict) {
        throw new Error(`Metric "${key}" must be an object with title and description fields.`);
      }
      const description = rawValue.trim();
      if (!description) continue;
      result[key] = {
        title: defaultMetricTitle(key),
        description,
      };
      continue;
    }

    if (typeof rawValue !== "object" || Array.isArray(rawValue)) {
      if (options.strict) {
        throw new Error(`Metric "${key}" must be an object with title and description fields.`);
      }
      continue;
    }

    const valueRecord = rawValue as Record<string, unknown>;
    const title = getStringValue(valueRecord, TITLE_KEYS);
    const description = getStringValue(valueRecord, DESCRIPTION_KEYS);

    if (!title || !description) {
      if (options.strict) {
        throw new Error(`Metric "${key}" must include title and description.`);
      }
      if (!description) continue;
      result[key] = {
        title: title ?? defaultMetricTitle(key),
        description,
      };
      continue;
    }

    result[key] = {
      title,
      description,
    };
  }

  return result;
}

export function normalizeCaseStudyMetrics(
  metrics: CaseStudyMetrics | null | undefined,
): CaseStudyMetricRecord {
  if (!metrics) return {};
  if (typeof metrics !== "object" || Array.isArray(metrics)) return {};
  return sanitizeCaseStudyMetricsRecord(metrics as Record<string, unknown>);
}

export function caseStudyMetricsEntries(
  metrics: CaseStudyMetrics | null | undefined,
): CaseStudyMetricEntry[] {
  const normalized = normalizeCaseStudyMetrics(metrics);
  return Object.entries(normalized).map(([key, value]) => ({
    key,
    title: value.title,
    description: value.description,
  }));
}

export function parseCaseStudyMetricsInput(
  input: string | Record<string, unknown> | null | undefined,
): CaseStudyMetricRecord {
  if (!input) return {};
  if (typeof input === "object") {
    return sanitizeCaseStudyMetricsRecord(input, { strict: true });
  }
  const trimmed = input.trim();
  if (!trimmed) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error("Metrics must be valid JSON.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Metrics JSON must be an object of metric entries.");
  }

  return sanitizeCaseStudyMetricsRecord(parsed as Record<string, unknown>, {
    strict: true,
  });
}

export function coerceCaseStudyMetrics(
  input: unknown,
  options: SanitizeOptions = {},
): CaseStudyMetricRecord {
  if (!input) return {};
  if (typeof input === "string") {
    return parseCaseStudyMetricsInput(input);
  }
  if (typeof input === "object" && !Array.isArray(input)) {
    return sanitizeCaseStudyMetricsRecord(input as Record<string, unknown>, options);
  }
  if (options.strict) {
    throw new Error("Metrics must be provided as a JSON object.");
  }
  return {};
}

export function metricsToTextareaValue(metrics: CaseStudyMetrics | null | undefined): string {
  const normalized = normalizeCaseStudyMetrics(metrics);
  const keys = Object.keys(normalized);
  if (keys.length === 0) return "";
  return JSON.stringify(normalized, null, 2);
}

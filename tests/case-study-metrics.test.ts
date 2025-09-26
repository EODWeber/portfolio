import { describe, expect, it } from "vitest";

import {
  caseStudyMetricsEntries,
  coerceCaseStudyMetrics,
  metricsToTextareaValue,
  normalizeCaseStudyMetrics,
  parseCaseStudyMetricsInput,
} from "@/lib/case-studies/metrics";

describe("parseCaseStudyMetricsInput", () => {
  it("parses a valid JSON string and preserves title case", () => {
    const input = `{
      "1": { "title": "ROI", "description": "200% return" },
      "2": { "title": "Time to Value", "description": "Launched in 4 weeks" }
    }`;

    const result = parseCaseStudyMetricsInput(input);

    expect(result).toEqual({
      "1": { title: "ROI", description: "200% return" },
      "2": { title: "Time to Value", description: "Launched in 4 weeks" },
    });
  });

  it("throws when a metric is missing required fields", () => {
    const input = `{"1": { "title": "ROI" }}`;

    expect(() => parseCaseStudyMetricsInput(input)).toThrow(/must include title and description/i);
  });
});

describe("coerceCaseStudyMetrics", () => {
  it("coerces legacy string values", () => {
    const input = {
      roi: "200% return",
      deployment_frequency: "Shipped weekly",
    };

    const result = coerceCaseStudyMetrics(input);

    expect(result).toEqual({
      roi: { title: "ROI", description: "200% return" },
      deployment_frequency: {
        title: "Deployment Frequency",
        description: "Shipped weekly",
      },
    });
  });
});

describe("normalizeCaseStudyMetrics", () => {
  it("normalizes various input shapes for display", () => {
    const input = {
      "1": { Title: "ROI", Description: "200%" },
      "2": { title: "MTTR", description: "Under 30 minutes" },
    };

    const normalized = normalizeCaseStudyMetrics(input);
    const entries = caseStudyMetricsEntries(input);

    expect(normalized).toEqual({
      "1": { title: "ROI", description: "200%" },
      "2": { title: "MTTR", description: "Under 30 minutes" },
    });
    expect(entries).toEqual([
      { key: "1", title: "ROI", description: "200%" },
      { key: "2", title: "MTTR", description: "Under 30 minutes" },
    ]);
  });
});

describe("metricsToTextareaValue", () => {
  it("serializes metrics to formatted JSON", () => {
    const input = {
      "1": { title: "ROI", description: "200%" },
    };

    expect(metricsToTextareaValue(input)).toBe(
      '{\n  "1": {\n    "title": "ROI",\n    "description": "200%"\n  }\n}',
    );
  });
});

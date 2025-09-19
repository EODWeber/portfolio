import type { Vertical } from "@/lib/supabase/types";

export type VerticalMeta = {
  slug: Vertical;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
};

export const VERTICALS: Record<Vertical, VerticalMeta> = {
  "ai-security": {
    slug: "ai-security",
    title: "AI Security",
    subtitle: "Guardrails for generative and predictive systems",
    description:
      "Detection engineering, adversarial testing, and governance patterns that keep ML systems resilient against real-world abuse.",
    cta: "Explore AI security work",
  },
  "secure-devops": {
    slug: "secure-devops",
    title: "Secure DevOps",
    subtitle: "Delivery speed with verifiable trust",
    description:
      "Platform and pipeline engineering that bakes in supply chain integrity, policy-as-code, and runtime assurances from commit to prod.",
    cta: "See secure DevOps engagements",
  },
  soc: {
    slug: "soc",
    title: "SOC",
    subtitle: "Human-centered automation for modern SOC teams",
    description:
      "Playbooks, enrichment, and decision support that amplify analysts while shrinking dwell time across hybrid cloud estates.",
    cta: "View SOC transformations",
  },
};

export const verticalList = Object.values(VERTICALS);

export function getVerticalMeta(slug: string | null | undefined): VerticalMeta | undefined {
  if (!slug) return undefined;
  return VERTICALS[slug as Vertical];
}

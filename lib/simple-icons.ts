import type { SimpleIcon } from "simple-icons";
import {
  siGithub,
  siInstagram,
  siRss,
  siSlack,
  siThreads,
  siX,
  siYoutube,
  siHomeassistant,
  siStrava,
  siGoogletranslate,
  siOpenai,
  siGithubactions,
  siSplunk,
  siOkta,
} from "simple-icons";

const siLinkedin: SimpleIcon = {
  title: "LinkedIn",
  slug: "linkedin",
  hex: "0A66C2",
  source: "https://brand.linkedin.com/",
  svg: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>LinkedIn</title><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
};

const iconMap: Record<string, SimpleIcon> = {
  github: siGithub,
  instagram: siInstagram,
  linkedin: siLinkedin,
  rss: siRss,
  slack: siSlack,
  threads: siThreads,
  twitter: siX,
  x: siX,
  youtube: siYoutube,
  homeassistant: siHomeassistant,
  strava: siStrava,
  googletranslate: siGoogletranslate,
  openai: siOpenai,
  githubactions: siGithubactions,
  splunk: siSplunk,
  okta: siOkta,
};

export function getSimpleIconBySlug(slug: string | null | undefined): SimpleIcon | null {
  if (!slug) return null;
  const key = slug.trim().toLowerCase();
  return iconMap[key] ?? null;
}

export const simpleIconSlugs = Object.freeze(Object.keys(iconMap));

const slugAliases: Record<string, string> = {
  github: "github",
  git: "github",
  linkedin: "linkedin",
  "linked-in": "linkedin",
  youtube: "youtube",
  yt: "youtube",
  twitter: "x",
  "x.com": "x",
  x: "x",
  slack: "slack",
  instagram: "instagram",
  ig: "instagram",
  threads: "threads",
  rss: "rss",
  blog: "rss",
  newsletter: "rss",
  substack: "rss",
  homeassistant: "homeassistant",
  strava: "strava",
  googletranslate: "googletranslate",
  openai: "openai",
  githubactions: "githubactions",
  splunk: "splunk",
  okta: "okta",
};

const textMatchers: Array<{ pattern: RegExp; slug: string }> = [
  { pattern: /github/i, slug: "github" },
  { pattern: /linkedin/i, slug: "linkedin" },
  { pattern: /youtube|yt\b/i, slug: "youtube" },
  { pattern: /twitter|\bx\b/i, slug: "x" },
  { pattern: /slack/i, slug: "slack" },
  { pattern: /instagram|\big\b/i, slug: "instagram" },
  { pattern: /threads/i, slug: "threads" },
  { pattern: /rss|blog|newsletter|substack/i, slug: "rss" },
  { pattern: /home[\s-]?assistant/i, slug: "homeassistant" },
  { pattern: /strava/i, slug: "strava" },
  { pattern: /google[\s-]?translate/i, slug: "googletranslate" },
  { pattern: /openai/i, slug: "openai" },
  { pattern: /github[\s-]?actions/i, slug: "githubactions" },
  { pattern: /splunk/i, slug: "splunk" },
  { pattern: /okta/i, slug: "okta" },
];

const hostMatchers: Array<{ pattern: RegExp; slug: string }> = [
  { pattern: /github\.com$/i, slug: "github" },
  { pattern: /linkedin\.com$/i, slug: "linkedin" },
  { pattern: /youtube\.com$/i, slug: "youtube" },
  { pattern: /youtu\.be$/i, slug: "youtube" },
  { pattern: /twitter\.com$/i, slug: "x" },
  { pattern: /x\.com$/i, slug: "x" },
  { pattern: /slack\.com$/i, slug: "slack" },
  { pattern: /instagram\.com$/i, slug: "instagram" },
  { pattern: /threads\.net$/i, slug: "threads" },
  { pattern: /substack\.com$/i, slug: "rss" },
  { pattern: /medium\.com$/i, slug: "rss" },
  { pattern: /dev\.to$/i, slug: "rss" },
  { pattern: /hashnode\.com$/i, slug: "rss" },
  { pattern: /rss\./i, slug: "rss" },
  { pattern: /homeassistant\.io$/i, slug: "homeassistant" },
  { pattern: /strava\.com$/i, slug: "strava" },
  { pattern: /translate\.google\.com$/i, slug: "googletranslate" },
  { pattern: /openai\.com$/i, slug: "openai" },
  { pattern: /github\.com\/features\/actions$/i, slug: "githubactions" },
  { pattern: /splunk\.com$/i, slug: "splunk" },
  { pattern: /okta\.com$/i, slug: "okta" },
];

function applyAlias(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;
  return slugAliases[normalized] ?? normalized;
}

export function normalizeSimpleIconSlug(value: string | null | undefined): string | null {
  const alias = applyAlias(value);
  if (!alias) return null;
  const normalized = alias.replace(/[^a-z0-9-]/g, "");
  if (!normalized) return null;
  return iconMap[normalized] ? normalized : null;
}

function findSlugFromText(text: string | null | undefined): string | null {
  if (!text) return null;
  for (const { pattern, slug } of textMatchers) {
    if (pattern.test(text)) {
      const normalized = normalizeSimpleIconSlug(slug);
      if (normalized) return normalized;
    }
  }
  return null;
}

function extractHost(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const hasProtocol = /^(https?:|mailto:|tel:)/i.test(trimmed);
  if (trimmed.startsWith("mailto:")) return null;
  const target = hasProtocol ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(target);
    const host = parsed.hostname.replace(/^www\./i, "");
    return host || null;
  } catch {
    return null;
  }
}

export function getHostFromUrl(url: string | null | undefined): string | null {
  return extractHost(url);
}

export function guessSimpleIconSlug(params: {
  slug?: string | null;
  platform?: string | null;
  label?: string | null;
  category?: string | null;
  url?: string | null;
}): string | null {
  const direct = normalizeSimpleIconSlug(params.slug ?? null);
  if (direct) return direct;

  const textCandidates = [params.platform, params.label, params.category];
  for (const text of textCandidates) {
    const match = findSlugFromText(text ?? null);
    if (match) return match;
    if (text) {
      const alias = normalizeSimpleIconSlug(text);
      if (alias) return alias;
    }
  }

  const host = extractHost(params.url ?? null);
  if (host) {
    for (const { pattern, slug } of hostMatchers) {
      if (pattern.test(host)) {
        const normalized = normalizeSimpleIconSlug(slug);
        if (normalized) return normalized;
      }
    }
  }

  return null;
}

export { siGithub, siInstagram, siLinkedin, siRss, siSlack, siThreads, siX, siYoutube };

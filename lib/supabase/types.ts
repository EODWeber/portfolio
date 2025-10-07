export type Vertical = "ai-security" | "secure-devops" | "soc";

export type ProjectOutcome = {
  metric: string;
  value: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  vertical: Vertical;
  tags: string[];
  tech_stack: string[];
  repo_url: string | null;
  hero_url: string | null;
  outcomes: ProjectOutcome[] | null;
  featured: boolean;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
};

export type CaseStudyMetricValue =
  | string
  | {
      title?: string;
      Title?: string;
      description?: string;
      Description?: string;
      [key: string]: unknown;
    };

export type CaseStudyMetrics = Record<string, CaseStudyMetricValue> | null;

export type CaseStudy = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  vertical: Vertical;
  tags: string[];
  body_path: string;
  hero_url: string | null;
  metrics: CaseStudyMetrics;
  // When featured, identify which metric to surface in the home hero
  featured_metric?: string | null;
  featured: boolean;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body_path: string;
  hero_url: string | null;
  tags: string[];
  featured: boolean;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
};

export type Resume = {
  id: string;
  vertical: Vertical;
  file_path: string;
  label: string;
  archived: boolean;
  featured: boolean;
  created_at?: string;
  published_at?: string | null;
  updated_at: string;
};

export type ContactRequestStatus = "new" | "in-review" | "replied" | "archived";

export type ContactRequest = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  origin: string | null;
  status: ContactRequestStatus;
  created_at: string;
};

export type Highlight = {
  label: string;
  value: string;
};

export type ProfilePillar = {
  id: string;
  title: string;
  description: string;
  icon_slug: string | null;
  link_label: string | null;
  link_url: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type ProfileCareerHighlight = {
  id: string;
  title: string;
  description: string;
  link_label: string | null;
  link_url: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type ProfileSpeakingEngagement = {
  id: string;
  event: string;
  title: string | null;
  year: string | null;
  link_url: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type ProfileRecognition = {
  id: string;
  title: string;
  issuer: string | null;
  year: string | null;
  link_url: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type ProfileTestimonial = {
  id: string;
  quote: string;
  attribution: string;
  role: string | null;
  link_url: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type ProfilePersonalEntry = {
  id: string;
  title: string;
  description: string;
  icon_slug: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type ProfileTechnicalSkill = {
  id: string;
  category: string;
  skills: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type SiteProfile = {
  id: string;
  full_name: string;
  headline: string;
  subheadline: string | null;
  summary: string | null;
  philosophy: string | null;
  avatar_url: string | null;
  location: string | null;
  hiring_status: string | null;
  resume_preference: Vertical;
  highlights: Highlight[] | null;
  hobbies?: string[] | null;
  interests?: string[] | null;
  speaking?: string[] | null;
  certifications?: string[] | null;
  awards?: string[] | null;
  pronouns?: string | null;
  phonetic_name?: string | null;
  languages?: string[] | null;
  access_notes?: string | null;
  cta_primary_label?: string | null;
  cta_primary_url?: string | null;
  cta_secondary_label?: string | null;
  cta_secondary_url?: string | null;
  career_cta_label?: string | null;
  career_cta_url?: string | null;
  tech_skills_title?: string | null;
  tech_skills_subtitle?: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteSettings = {
  id: string;
  site_title: string;
  site_tagline: string | null;
  meta_description: string | null;
  hero_heading?: string | null;
  hero_subheading?: string | null;
  hiring_status?: string | null;
  location?: string | null;
  resume_preference?: Vertical | null;
  primary_cta_label: string | null;
  primary_cta_url: string | null;
  secondary_cta_label: string | null;
  secondary_cta_url: string | null;
  home_heading?: string | null;
  home_subheading?: string | null;
  home_projects_heading?: string | null;
  home_projects_subheading?: string | null;
  home_studies_heading?: string | null;
  home_studies_subheading?: string | null;
  home_articles_heading?: string | null;
  home_articles_subheading?: string | null;
  portfolio_heading?: string | null;
  portfolio_subheading?: string | null;
  studies_heading?: string | null;
  studies_subheading?: string | null;
  articles_heading?: string | null;
  articles_subheading?: string | null;
  contact_heading?: string | null;
  contact_subheading?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactLink = {
  id: string;
  label: string;
  url: string;
  category: string | null;
  icon: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type MdxDocument = {
  id: string;
  key: string; // e.g., articles/slug.mdx
  storage_path: string;
  deleted: boolean;
  created_at: string;
  updated_at: string;
  content?: string | null;
  download_error?: string | null;
  public_url?: string | null;
};

export type NotificationSettings = {
  id: string;
  email_enabled: boolean;
  email_to: string | null;
  email_from: string | null;
  email_subject_template?: string | null;
  email_header_html?: string | null;
  email_footer_html?: string | null;
  telegram_enabled: boolean;
  telegram_bot_token: string | null;
  telegram_chat_id: string | null;
  slack_enabled: boolean;
  slack_webhook_url: string | null;
  discord_enabled: boolean;
  discord_webhook_url: string | null;
  updated_at: string;
};

export type NotificationLog = {
  id: string;
  channel: "email" | "telegram" | "slack" | "discord";
  status: "sent" | "error";
  detail: string | null;
  payload: unknown;
  created_at: string;
};

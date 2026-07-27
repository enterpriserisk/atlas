/** Shared content types for ATLAS's file-based and database-backed "living resource" content. */

/** Slugify text into a valid HTML id / URL fragment (no spaces). Used for anchors and for
 *  auto-generating playbook submission slugs from a title. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Human-review requirement used on playbook entries and tool/task assessments. */
export type ReviewRequirement = "Yes" | "No" | "Conditional";

/** Playbook entry categories. Keep in sync with the filter UI and TEMPLATE.mdx guidance. */
export const PLAYBOOK_CATEGORIES = [
  "Drafting & Writing",
  "Data Analysis",
  "Research & Summarization",
  "Communications",
  "Risk Assessment",
] as const;

export type PlaybookCategory = (typeof PLAYBOOK_CATEGORIES)[number];

/** Frontmatter parsed from a playbook MDX file. */
export interface PlaybookFrontmatter {
  title: string;
  category: string;
  tags: string[];
  aiToolsReferenced: string[];
  humanReviewRequired: ReviewRequirement;
  lastUpdated: string;
  author: string;
  summary: string;
  draft?: boolean;
}

/** A fully loaded playbook entry: frontmatter + slug + raw markdown body. Sourced either
 *  from a static .mdx file or a dynamic database submission — the rest of the app doesn't
 *  need to know which. */
export interface PlaybookEntry extends PlaybookFrontmatter {
  slug: string;
  body: string;
}

export interface Tool {
  id: string;
  name: string;
  universityProvided: boolean;
  label: string;
  shortDescription: string;
  approvedFor: string[];
  dataSensitivityNote: string;
  strengths: string[];
  limitations: string[];
  bestFor: string;
  accessPath: string;
  relatedPlaybookTags: string[];
  draft?: boolean;
}

/** A staff-submitted resource in the Resource Directory — not officially vetted, just
 *  shared internally by ERM staff/interns via the access-key-gated /contribute flow. */
export interface DirectoryResource {
  id: number;
  name: string;
  url: string | null;
  description: string;
  tags: string[];
  contributorLabel: string;
  submittedAt: string;
}

export interface DosDontsSection {
  id: string;
  title: string;
  draft?: boolean;
  dos: string[];
  donts: string[];
  example: string;
}

export interface DosDontsContent {
  lastReviewedByERM: string | null;
  sections: DosDontsSection[];
}

/** A unified search record spanning all content types (built at build time). */
export interface SearchRecord {
  type: "playbook" | "tool";
  /** Route to navigate to on selection. */
  href: string;
  title: string;
  /** Concatenated searchable text (title + summary + tags). */
  text: string;
  category?: string;
  tags?: string[];
  humanReviewRequired?: ReviewRequirement;
}

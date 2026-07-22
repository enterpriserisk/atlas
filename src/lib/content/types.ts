/** Shared content types for ATLAS's file-based "living resource" content. */

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

/** A fully loaded playbook entry: frontmatter + slug + raw markdown body. */
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

export interface GlossaryTerm {
  term: string;
  aliases?: string[];
  definition: string;
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
  lastReviewedByERO: string | null;
  sections: DosDontsSection[];
}

/** A unified search record spanning all content types (built at build time). */
export interface SearchRecord {
  type: "playbook" | "tool" | "glossary";
  /** Route to navigate to on selection. */
  href: string;
  title: string;
  /** Concatenated searchable text (title + summary/definition + tags). */
  text: string;
  category?: string;
  tags?: string[];
  humanReviewRequired?: ReviewRequirement;
}

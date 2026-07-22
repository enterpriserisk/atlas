# Contributing content to ATLAS

ATLAS is a **living resource**. Most content lives in the `/content` folder as simple
Markdown and JSON files — you can add or update it **without touching any application code**.
When content changes are published, the site (including search) updates automatically.

You do **not** need to be a developer to contribute. Here's how each kind of content works.

---

## 1. Add a new Playbook entry (most common)

Playbook entries are Markdown files in `content/playbook/`.

1. Copy `content/TEMPLATE.mdx` into `content/playbook/`.
2. Rename it to describe your entry, using dashes, e.g. `writing-meeting-recaps.mdx`.
   (The file name becomes the page's web address.)
3. Fill in the section at the top between the `---` lines (the "frontmatter"):

   | Field | What to put |
   |-------|-------------|
   | `title` | The entry's title (shown everywhere) |
   | `category` | One of: Drafting & Writing, Data Analysis, Research & Summarization, Communications, Risk Assessment |
   | `tags` | A few keywords in brackets, e.g. `["email", "drafting"]` |
   | `aiToolsReferenced` | Tool IDs this entry mentions, e.g. `["um-gpt"]` (see `content/tools.json`) |
   | `humanReviewRequired` | `"Yes"`, `"No"`, or `"Conditional"` |
   | `lastUpdated` | Today's date as `"YYYY-MM-DD"` |
   | `author` | Your name |
   | `summary` | One or two sentences (shown in lists and search) |
   | `draft` | `true` while it's a draft; set to `false` once reviewed |

4. Write the body below the frontmatter using normal Markdown (headings with `##`, bullet
   lists with `-`, etc.). See existing entries in `content/playbook/` for examples.

That's it — the entry appears in the Playbook and in search automatically.

---

## 2. Update the Tool Directory

Edit `content/tools.json`. Each tool is one entry in the `tools` list.

- Keep `universityProvided` accurate — any tool set to `false` automatically shows the
  "Not a University tool — verify before use" warning everywhere it appears.
- `approvalStatusNote` / data-sensitivity notes are intentionally worded softly because
  approval status can change. **Keep them current.**

## 3. Update the Glossary

Edit `content/glossary.json`. Add a `term`, an optional list of `aliases` (alternate
spellings that should also trigger the tooltip), and a plain-language `definition`.

## 4. Update the Do's & Don'ts

Edit `content/dos-donts.json`. There are eight sections; each has `dos`, `donts`, and one
`example`. Set a section's `draft` to `false` once ERO has reviewed it, and set
`lastReviewedByERO` to the review date (`"YYYY-MM-DD"`) to update the footer note.

---

## Tips

- **Keep JSON valid.** Every item needs quotes and commas between entries (but not after
  the last one). If a page won't build, a missing comma or quote is the usual cause.
- **Dates** use the `YYYY-MM-DD` format, e.g. `2026-01-15`.
- **Preview locally** (if you have the dev environment): run `npm run dev` and visit the page.
- When in doubt, copy an existing file and edit it rather than starting from scratch.

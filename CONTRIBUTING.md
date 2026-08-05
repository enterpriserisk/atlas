# Contributing content to ATLAS

ATLAS is a **living resource** with two ways to contribute, depending on who you are.

---

## For staff and interns (no developer access needed)

Once ATLAS is hosted online, most people won't have file or git access — and that's fine.
Contributing happens **on the website itself**:

1. Get an access key from whoever manages ATLAS for your team (they generate one per
   person from `/admin`).
2. Go to `/contribute` and enter your key. It unlocks two forms:
   - **Add a Playbook entry** — guidance, a use-case example, or a standard for others.
   - **Add a Directory resource** — a tool or resource you've found useful, shared with the
     rest of ESRM (this is the Resource Directory at `/directory`, distinct from the
     official Tool Directory).
3. Fill out the form and submit. **It publishes immediately** — no review queue, no pull
   request, no waiting.

Your key is personal — don't share it. If you shouldn't have access anymore, whoever
manages ATLAS can revoke your specific key from `/admin` without affecting anyone else's.

---

## For developers (repo access)

If you have git access, the Playbook, Tool Directory, and Best Practices can still be
edited directly as files in `/content` — useful for bulk edits or anything that should ship
with a proper code review.

### Add a Playbook entry via file

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

File-based entries and web-submitted entries appear together in the Playbook automatically
— the site merges both sources.

### Update the Tool Directory

Edit `content/tools.json`. Each tool is one entry in the `tools` list.

- Keep `universityProvided` accurate — any tool set to `false` automatically shows the
  "Not a University tool — verify before use" warning everywhere it appears.
- Data-sensitivity notes are intentionally worded softly because approval status can
  change. **Keep them current.**

### Update Best Practices

Edit `content/dos-donts.json`. There are eight sections; each has `dos`, `donts`, and one
`example`. Set a section's `draft` to `false` once ESRM has reviewed it, and set
`lastReviewedByESRM` to the review date (`"YYYY-MM-DD"`) to update the footer note.

### The Resource Directory has no file-based path

Unlike the Playbook, every Resource Directory entry (`/directory`) comes from the database
— it's exclusively staff-submitted via `/contribute`, so there's no equivalent file to edit.

---

## Tips

- **Keep JSON valid.** Every item needs quotes and commas between entries (but not after
  the last one). If a page won't build, a missing comma or quote is the usual cause.
- **Dates** use the `YYYY-MM-DD` format, e.g. `2026-01-15`.
- **Preview locally** (if you have the dev environment): run `npm run dev` and visit the page.
- When in doubt, copy an existing file and edit it rather than starting from scratch.

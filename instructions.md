# ATLAS — Instructions

<!-- Paste your instruction prompt below this line. -->

# ATLAS — Claude Code Build Prompt

Copy everything below the line into Claude Code as your project prompt.

---

## PROJECT BRIEF

Build **ATLAS** (Actionable Tooling, Libraries, Automation & Standards) — a web application for the University of Michigan's Enterprise Risk Office (ERO). ATLAS is a practical, searchable playbook that helps ERO staff and interns use AI effectively, consistently, and responsibly. It must be built as a **living resource**: content should be easy for non-engineers (future interns/staff) to add to over time without touching application code.

ATLAS has three pillars:
1. **Playbook/Library** — a searchable knowledge base of guidance, tools, and standards.
2. **AI Task Advisor** — an interactive, agent-like assistant (toned/prompted, not fine-tuned) that helps a staff member decide *whether* AI is appropriate for a task, *what the risks are*, and *which tool* to use — then generates a ready-to-use, refined prompt for that tool.
3. **Do's and Don'ts Reference** — a single clear page of responsible-AI-use standards.

---

## TECH STACK

- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS with a custom design-token theme (see Brand section below) + shadcn/ui components for accessible primitives (dialog, tabs, accordion, progress, command palette)
- **Charts:** Recharts (for the radar chart and any progress/comparison visuals)
- **Content:** MDX or JSON-driven content collections stored in a `/content` directory (this is what makes it a "living resource" — see Content Architecture below), parsed via `contentlayer` or a simple frontmatter loader (`gray-matter`)
- **Search:** Client-side fuzzy search (`fuzzysort` or `flexsearch`) indexing all playbook entries, tool cards, and glossary terms — instant-as-you-type, no backend required
- **AI Advisor logic:** Implement as a structured, deterministic decision engine (see below) — NOT a call to a live LLM API by default. Build it so an LLM API call *could* be swapped in later, but ship v1 with a transparent, rule-based/scored engine so behavior is auditable and doesn't require API keys or ongoing cost.
- **State:** React state/URL params for the advisor wizard flow (so a session can be shared/bookmarked via URL)
- **Deployment target:** static export or Vercel-style hosting; no database required for v1 (all content is file-based)

---

## BRAND & VISUAL IDENTITY (University of Michigan)

Source: *U-M Brand Identity Style Guide, February 2025* (brand.umich.edu). Apply these exactly — this is an internal tool, not an official marketing site, so **do not attempt to reproduce or fake the official U-M logo, Block M, or Seal** (those are trademark-controlled and require the official logo generator). Instead, build the identity through color, type, and layout, which is fully appropriate for an internal departmental tool.

### Color tokens
Primary palette (signature colors):
- `--um-blue: #00274C` (PMS 282) — primary brand color, dominant for headers/nav/footer
- `--um-maize: #FFCB05` (PMS 7406) — accent color, CTAs, highlights, active states

Secondary/supporting palette (use as accents only, never as the dominant color):
- `--um-tappan-red: #9A3324`
- `--um-ross-orange: #D86018`
- `--um-wavefield-green: #A5A508`
- `--um-taubman-teal: #00B2A9`
- `--um-rackham-green: #75988D`
- `--um-arboretum-blue: #2F65A7`
- `--um-amethyst: #702082`
- `--um-matthaei-violet: #575294`

Neutrals:
- `--um-tan: #CFC096`, `--um-beige: #9B9A6D`, `--um-ash: #989C97`, `--um-stone: #80764B`, `--um-black-metallic: #131516`
- Standard `#FFFFFF` and `#000000`

**Accessibility requirement (non-negotiable, per brand guide + WCAG 2.1 AA):** minimum 4.5:1 contrast for normal text, 3:1 for large text (24px+/19px bold+). Use only brand color combinations verified in the guide (e.g., maize text/background needs blue or black text on it, never white on maize, never light-on-light). Build a `lib/colors.ts` with only pre-approved foreground/background pairings so no page can accidentally violate contrast.

### Typography
- Body/UI font: **IBM Plex Sans** or **Nunito Sans** (Google Fonts, free, per brand guide)
- Headings/display: **Montserrat** (or **Playfair Display** for a more editorial feel on the homepage hero only — pick one and stay consistent)
- Accessibility option: support **Atkinson Hyperlegible** as a user-toggleable "high legibility" font mode (this is literally the Braille Institute's typeface, recommended by the brand guide's accessibility section) — add a small accessibility menu in the header with a font-size and font-toggle control.
- Max 2–3 fonts total per the guide.
- Body copy minimum 12pt equivalent (16px web), line-height at least 1.4–1.5.
- Left-align/ragged-right, never justify body text. Avoid italics/all-caps for long text blocks.

### Layout principles
- Generous white space, clear heading hierarchy, flush-left text, short line lengths (~60–75 characters) for readability
- Michigan Blue as header/footer/nav background with white text; Maize used sparingly as accent (buttons, active tab underline, badges) — never as large background blocks with white text on top (fails contrast)
- Data visualizations (radar chart, progress bars) should pull from the brand's accessible qualitative/sequential/diverging palettes listed above, with pattern/texture or direct labeling as a backup to color alone (per the brand guide's accessible data-viz guidance) — never rely on color alone to convey meaning
- Fully responsive, mobile-first
- WCAG 2.1 AA compliant across the whole site: semantic HTML, proper heading order, alt text on all icons/images, full keyboard navigation, visible focus states, ARIA labels on interactive widgets (especially the advisor wizard and charts)

---

## SITE MAP

1. **Home** — hero explaining ATLAS's purpose, three clear entry points (Browse the Playbook / Ask the AI Task Advisor / View Do's & Don'ts), a "recently added" or "featured" content strip to reinforce that this is a living, growing resource
2. **Playbook / Library** — searchable, filterable index of all guidance entries, tool write-ups, use-case examples, and standards documents. Filter by category (e.g., Drafting & Writing, Data Analysis, Research & Summarization, Communications, Risk Assessment), by AI tool, and by review-required status.
3. **AI Task Advisor** (the agent) — see full spec below
4. **Do's and Don'ts** — see full spec below
5. **Tool Directory** — reference cards for U-M GPT, U-M Maizey, Gemini, and any other tools referenced by the Advisor over time, each with: what it's approved for, data-sensitivity notes, strengths/limitations, and a link back to relevant playbook entries
6. **Glossary** — plain-language definitions of AI terms (hallucination, prompt engineering, context window, RAG, etc.) surfaced site-wide via tooltip/hover where terms appear
7. **Contribute** (for future staff/interns) — a clear, simple explanation of how to add a new playbook entry (points to the `/content` folder structure and a markdown template), so the "living resource" promise is actually actionable
8. **About ATLAS** — what the acronym stands for, purpose, ownership, last-updated log

---

## FEATURE SPEC: AI TASK ADVISOR (the agent)

This is the centerpiece feature. It must feel like a **guided conversation with a thoughtful colleague**, not a form. Build it as a multi-step wizard with smooth transitions (use Framer Motion for step transitions and progress indication), not a single long form.

### Step 1 — Task Intake
A clean, single-focus screen: a large text area — "Describe the task you're working on" — plus a few optional structured fields that help the scoring engine (task type dropdown, whether it involves personal/confidential data, deadline pressure, audience of the output — e.g., internal only vs. external/leadership-facing). Keep this fast: one primary input, everything else optional and collapsed by default.

### Step 2 — Assessment (the "should AI help here" decision)
Run the input through a transparent scoring engine across these dimensions (this is the radar chart):
- **Time savings potential**
- **Task complexity / nuance required**
- **Risk if output is wrong** (impact of error)
- **Data sensitivity** (does it touch confidential/regulated info)
- **Need for human judgment/context**

Render this as a **radar/spider chart** (Recharts `RadarChart`) with each axis scored 1–5, using accessible brand colors (e.g., Arboretum Blue fill with pattern overlay, Maize outline) and direct data labels on each axis (not color-only). Below the chart, show:
- A clear verdict: **"AI Recommended" / "AI Possible with Caution" / "AI Not Recommended for This Task"**
- 2–4 plain-language bullet points explaining *why* (referencing the specific axes that drove the verdict)
- A distinct, visually flagged **"Human Review Required: Yes/No/Conditional"** badge with the specific reason (e.g., "external-facing output," "touches personal data," "high judgment call")

### Step 3 — Tool Options (only shown if AI is recommended/possible)
Present a comparison of options as cards, each with a clear pros/cons list and a "best for" line:
- **U-M GPT** (label: *University-provided*)
- **U-M Maizey** (label: *University-provided*)
- **Gemini** (label: *University-provided*, per U-M's Google Workspace agreement — verify current approval status is stated as "confirm current approval in the Tool Directory" rather than hardcoded, since university-approved tool status can change)
- **Other / specialized tool**, if genuinely relevant to the described task (e.g., a coding-specific assistant, a specialized transcription tool). When suggesting anything outside the three above, the card MUST include a visible label: **"Not provided or endorsed by the University of Michigan — verify data-handling and approval status before use."** This label styling should be a distinct, consistent badge component used everywhere non-university tools are mentioned, never buried in body text.

Each option card shows: strengths, limitations, and a "why this fits your task" one-liner tied back to the Step 1 input. User selects one (or none) to continue.

### Step 4 — Continue Prompt
A clear, low-friction checkpoint: "Want ATLAS to help you build a ready-to-use prompt for [chosen tool]?" with Continue / Not Now. Not Now should still let them see a summary/export of the assessment (so the tool is useful even if they stop here).

### Step 5 — Refinement Intake
If they continue, ask a short set of targeted follow-up questions *specific to the task type and tool chosen* (e.g., desired output format, tone, length, source materials to reference, constraints, audience). Show a progress bar across this step so it feels finite and quick (aim for 3–5 questions max).

### Step 6 — Generated Prompt + Instructions
Output:
- A clean, copy-button-enabled **refined prompt** formatted for the chosen tool, incorporating everything gathered
- **Step-by-step instructions** for actually using it (numbered steps, e.g., "1. Open U-M Maizey at [describe access path]. 2. Paste the prompt below. 3. Review output against the checklist..." — instructions should reference the correct access pattern per tool)
- A **human-review checklist** relevant to the task (auto-generated from Step 2's flagged risk areas — e.g., if data sensitivity was flagged, include a "confirm no confidential data was pasted in" checklist item)
- A **downloadable/exportable summary** (PDF or copy-to-clipboard) of the whole session: task, assessment, radar chart, chosen tool, final prompt — so it can be attached to project documentation
- Visual polish here matters: use a completed progress bar/checkmark stepper across the whole 6-step flow so the user always sees where they are and feels the "seamless and intuitive" progression the whole way through

### Engine implementation notes
- Implement the scoring as a well-documented, pure TypeScript function (`lib/advisor/scoreTask.ts`) taking structured input and returning axis scores + verdict + reasoning strings. Use keyword/heuristic matching against the free-text description plus the structured fields — document the logic clearly in comments so future staff can tune it.
- Tool recommendation logic lives in a separate, editable config file (`content/tools.json` or similar) so U-M GPT/Maizey/Gemini descriptions and any additions can be updated without code changes.
- Do NOT wire this to a live LLM API by default — keep it deterministic and auditable for v1. Structure the code so a `generatePrompt()` function could later call an LLM API to draft the Step 6 prompt from the same inputs, with a clear TODO/comment marking that extension point.

---

## FEATURE SPEC: DO'S AND DON'TS PAGE

One clean, scannable page (not a long scroll of paragraphs). Use a two-column or card-grid layout with a consistent visual pattern for every section: green-accent "Do" list next to a red/tappan-red-accent "Don't" list (use pattern/icon differentiation too, not just color, for accessibility). Sections, each collapsible/expandable via accordion so the page doesn't feel overwhelming:

1. **Appropriate Uses of AI**
2. **When Human Review Is Required**
3. **Protecting Confidential Information**
4. **Citation Practices**
5. **Fact-Checking Procedures**
6. **Avoiding AI Hallucinations**
7. **Writing Quality Standards**
8. **Ethical Considerations**

Each section: 3–5 concise Do bullets, 3–5 concise Don't bullets, and one short real-world example scenario. Populate with genuinely useful placeholder content reflecting general enterprise-risk/higher-ed best practices (confidentiality, verification, disclosure of AI use, avoiding overreliance, bias awareness) — flag it clearly as placeholder text for ERO subject-matter experts to review and finalize, e.g. an HTML comment or a visible "Draft — pending ERO review" tag per section that can be toggled off once approved.

Add a persistent "last reviewed by ERO on [date]" footer note on this page, since it's a compliance-adjacent reference and staleness should be visible.

---

## CONTENT ARCHITECTURE ("living resource" requirement)

This is critical — the whole point is that future interns/staff extend ATLAS without needing to be developers:

- `/content/playbook/*.mdx` — one file per playbook entry, frontmatter fields: `title, category, tags, aiToolsReferenced, humanReviewRequired, lastUpdated, author`
- `/content/tools.json` — tool directory entries (U-M GPT, U-M Maizey, Gemini, + any added later), structured for reuse in both the Tool Directory page and the Advisor's Step 3
- `/content/glossary.json` — term/definition pairs
- `/content/dos-donts.json` — the eight sections above, structured so the page is fully data-driven
- Include a `/content/TEMPLATE.mdx` and a short `CONTRIBUTING.md` explaining, in plain language, how to duplicate the template and add a new entry, referenced from the site's "Contribute" page
- Search index should rebuild automatically off this content directory (build-time index generation, no manual re-indexing step)

---

## NON-FUNCTIONAL REQUIREMENTS

- **Accessibility:** WCAG 2.1 AA throughout — semantic landmarks, skip-to-content link, full keyboard operability of the Advisor wizard and all charts (provide a data-table fallback/toggle for the radar chart for screen reader users), color contrast per the approved pairing list, respects `prefers-reduced-motion` for all transitions
- **Performance:** fast client-side search, code-split the Advisor flow, optimize font loading (font-display: swap)
- **Responsiveness:** fully usable on mobile — the Advisor wizard especially should collapse gracefully to single-column, touch-friendly controls
- **Polish:** consistent spacing scale, consistent card/button component library (build a small design-system layer in `/components/ui`), subtle motion on step transitions and chart render (staggered/animated radar chart draw-in), loading skeletons rather than spinners where content loads
- **No official U-M logo/seal reproduction** — use text wordmark styling ("ATLAS" in Montserrat with a small "University of Michigan · Enterprise Risk Office" byline in the header) instead of any recreated Block M or Seal graphic, per brand trademark rules
- **Transparency:** every AI-generated recommendation (verdict, tool suggestion, generated prompt) should be visually marked as AI-assisted guidance requiring human judgment, consistent with the Do's/Don'ts content itself — practice what the tool preaches

---

## BUILD ORDER (suggested phases for Claude Code)

1. Scaffold Next.js + Tailwind + design tokens/theme + base layout (header/nav/footer) + font setup
2. Build the small design-system components (buttons, cards, badges, accordion, progress bar/stepper)
3. Build content architecture + sample content (a few real playbook entries, the tools.json with U-M GPT/Maizey/Gemini, glossary, dos-donts.json)
4. Build Playbook/Library page with search and filters
5. Build Do's and Don'ts page
6. Build Tool Directory and Glossary pages
7. Build the AI Task Advisor wizard end-to-end (Steps 1–6), including the scoring engine and radar chart
8. Build Home, Contribute, and About pages
9. Accessibility pass (keyboard nav, contrast audit, screen reader labels, reduced-motion)
10. Responsive/polish pass

Work phase by phase, and after each phase briefly summarize what was built and flag any open decisions (e.g., placeholder content needing ERO review) before moving to the next phase.
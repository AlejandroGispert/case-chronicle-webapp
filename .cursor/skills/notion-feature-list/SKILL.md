---
name: notion-feature-list
description: Integrates with Notion using an internal integration token to manage feature, roadmap, tech-debt, and bug lists stored as Notion pages (not databases). Supports reading and filtering items, creating new entries from natural-language descriptions in chat, updating status and other fields, and archiving or deleting items. Use when the user mentions syncing features with Notion, feature lists, roadmap, tech debt, bug backlog, or uses trigger phrases like "Sync this feature into Notion", "Show me planned features", or "Update the status of X in the Notion feature list".
---

# Notion Feature List Skill

This skill teaches the agent how to use the Notion API (with an internal integration token) to manage **list-style pages** (not databases) representing:

- Feature list
- Roadmap
- Tech debt list
- Bug backlog

The lists are modeled as **Notion pages whose content is bullet lists / child blocks**, not database rows.

The agent should use this skill whenever the user asks to sync features with Notion, inspect or update planned work, or generally refer to Notion-based lists for this app.

## Environment & Configuration

All configuration is provided via environment variables in the project’s `.env` file.

The agent must **never print or log token values**.

Required environment variables:

- `NOTION_TOKEN` – Notion internal integration token (already configured by the user).
- `NOTION_FEATURES_PAGE_ID` – Notion page ID for the main feature list.
- `NOTION_ROADMAP_PAGE_ID` – Notion page ID for the roadmap list.
- `NOTION_TECH_DEBT_PAGE_ID` – Notion page ID for the tech-debt list.
- `NOTION_BUG_BACKLOG_PAGE_ID` – Notion page ID for the bug backlog list.

Assumptions:

- Each of these IDs points to a Notion page that:
  - Is shared with the internal integration.
  - Contains a bullet list (or nested bullets) where each bullet represents a single item.
  - May use rich-text formatting, emojis, or nested children; the agent should preserve existing formatting where possible.

If any of the `*_PAGE_ID` variables are missing, the agent should:

1. Clearly state that the corresponding list is not configured.
2. Suggest adding the required ID to `.env` (without displaying any secret values).

## Data Model for List Items

Because these are **pages, not databases**, the agent should represent items using a **simple table block** per list, where each row is one item.

### Canonical Item Format

Each list page (features, roadmap, tech debt, bugs) should contain a table with:

- **Header row** (in this order):
  - `Title` | `Description` | `Status` | `Area`
- **One row per item**, for example:

```text
Title                          | Description                                                       | Status      | Area
Unified inbox search           | Faster multi-field search across emails, events, and documents.  | Planned     | Inbox
Login fails on Safari          | Users cannot complete login flow on Safari 17.                   | In Progress | Auth
```

Where:

- `Type` – `Feature`, `Roadmap`, `TechDebt`, or `Bug`.
- `Title` – short human-readable title.
- `Status` – e.g. `Planned`, `In Progress`, `Done`, `Archived`, `Blocked`.
- `Priority` – e.g. `Low`, `Medium`, `High`, `Critical`.
- `Area` – high-level functional area or module (e.g. `Inbox`, `Calendar`, `Auth`, `Notifications`).
- `ID` – a short identifier, e.g. `F-123`, `R-42`, `TD-17`, `B-301`. This should be stable once created and used for updates.

Additional details (acceptance criteria, links, notes) may be added as **separate blocks under the table** (e.g. headings + bullet lists) rather than inside the table cells, to keep the table compact and scannable.

### Parsing Items

When reading items from a list page:

1. Fetch the page’s child blocks via the Notion API.
2. Consider each **top-level bullet block** (and its immediate rich-text content) as a candidate item.
3. Attempt to parse:
   - `Type` from the `[Type]` prefix.
   - `Title` from the text after `[Type]` up to `—` (em-dash).
   - `Status`, `Priority`, `Area`, `ID` from the `Status:`, `Priority:`, `Area:`, `ID:` segments.
4. If parsing fails for some items:
   - Still include them in output, but mark missing fields as `Unknown`.
   - Avoid rewriting or “normalizing” legacy items unless the user explicitly asks for it.

## Operations Supported

The agent should support the following operations for each list type (features, roadmap, tech debt, bugs):

- **Read / List** items with optional filters.
- **Create** new items from natural language descriptions.
- **Update** existing items (status, priority, area, title, description).
- **Archive / Delete** items (based on user intent).
- **Reorganize / Normalize** existing content into the canonical table format (when explicitly requested).

### 1. Read / List Items

When the user requests something like:

- “Show me planned features”
- “List all high-priority tech debt”
- “What’s in the bug backlog for Inbox?”

The agent should:

1. Identify the correct page ID based on wording:
   - “feature list”, “features” → `NOTION_FEATURES_PAGE_ID`
   - “roadmap” → `NOTION_ROADMAP_PAGE_ID`
   - “tech debt”, “technical debt” → `NOTION_TECH_DEBT_PAGE_ID`
   - “bugs”, “bug backlog”, “issues” → `NOTION_BUG_BACKLOG_PAGE_ID`
2. Call the Notion API to fetch page children (bulleted list blocks).
3. Parse each bullet into the canonical fields when possible.
4. Apply filters in-memory:
   - `status` (e.g. `Planned`, `In Progress`, `Done`, etc.).
   - `priority` (e.g. `High`, `Critical`).
   - `area` (e.g. `Inbox`, `Calendar`, `Auth`, etc.).
5. Return results in a compact format:
   - If only a few items: bullet list.
   - If many items: markdown table.

#### Recommended Output Formats

- **Bullet summary (few items)**:

```markdown
- **Feature**: Unified inbox search (Status: Planned, Priority: High, Area: Inbox, ID: F-123)
  - Faster multi-field search across emails, events, and documents.
```

- **Table summary (many items)**:

```markdown
| Type    | ID    | Title                 | Status      | Priority | Area  |
| ------- | ----- | --------------------- | ----------- | -------- | ----- |
| Feature | F-123 | Unified inbox search  | Planned     | High     | Inbox |
| Bug     | B-301 | Login fails on Safari | In Progress | Critical | Auth  |
```

The agent should avoid dumping raw JSON from Notion; only show human-friendly summaries.

### 2. Create New Items from Chat

When the user describes a feature/roadmap/bucket item or uses a trigger phrase like:

- “Sync this feature into Notion”
- “Add this to the roadmap”
- “Create a bug in the backlog for this issue”

The agent should:

1. Infer the **item type** (`Feature`, `Roadmap`, `TechDebt`, `Bug`).
2. Extract:
   - `Title`
   - `Description`
   - Suggested `Status` (default: `Planned` for features/roadmap, `Open` or `Planned` for bugs, `Identified` for tech debt).
   - Suggested `Priority` (default: `Medium` if not obvious).
   - `Area` from context (e.g. references to Inbox, Calendar, Auth, etc.), or leave as `Unknown`.
3. Generate a unique short `ID`:
   - Use a prefix by type: `F-`, `R-`, `TD-`, `B-`.
   - Append a random or timestamp-based number, or if feasible, increment based on existing IDs.
4. Construct a canonical text block for the bullet:

```text
[Feature] Unified inbox search (ID: F-124)
- Status: Planned
- Priority: High
- Area: Inbox
- Description: Faster multi-field search across emails, events, and documents, including subject, body, and participants.
```

5. Use the Notion API `append block children` endpoint to add this bullet to the correct page.
6. Confirm creation to the user with a short summary:

```markdown
- **Created Notion Feature** `F-124` on the feature list:
  - **Title**: Unified inbox search
  - **Status**: Planned
  - **Priority**: High
  - **Area**: Inbox
```

#### Automatic creation behavior

When the user **describes a new feature in natural language** in the context of product planning (even without saying “sync”), the agent should:

- Assume the intent is to **add it to the Notion feature list**, unless the user explicitly says otherwise.
- Either:
  - Create it immediately and then confirm what was created, **or**
  - Briefly ask for confirmation if there is significant ambiguity (e.g. unclear whether it is a feature vs bug vs tech-debt item).

Examples of phrases that should trigger **automatic feature creation**:

- “New feature: …”
- “We should add a feature that …”
- “For this app, I want a feature where …”

In these cases, the agent should default to:

- Type: `Feature`
- Target page: `NOTION_FEATURES_PAGE_ID`
- Status: `Planned` (unless the user specifies another status)
- Priority: `Medium` or inferred from wording (e.g. “critical” → `Critical`)

### 3. Update Existing Items

When the user says things like:

- “Update the status of Unified inbox search in the Notion feature list to In Progress”
- “Mark F-123 as Done”
- “Increase the priority of B-301 to Critical”

The agent should:

1. Identify the target list page based on context (feature list, bugs, etc.).
2. Locate the item:
   - Prefer matching by `ID` if provided (e.g. `F-123`, `B-301`).
   - Otherwise, match by `Title` (case-insensitive, fuzzy if necessary). If ambiguous, ask the user to clarify.
3. Parse the bullet’s canonical line, modify only the specified fields (e.g. `Status`, `Priority`, `Area`, `Title`).
4. Replace the bullet’s text content using the Notion API:
   - Preserve additional description lines and nested bullets.
5. Confirm the update with a concise summary:

```markdown
- **Updated** `F-123`:
  - **Status**: Planned → In Progress
```

If multiple matches are possible:

- Present a short disambiguation list and ask the user which ID or title they mean before updating.

### 4. Archive / Delete Items

When the user explicitly asks to archive or delete items, e.g.:

- “Archive F-123 in the feature list”
- “Delete this bug from the Notion backlog”

The agent should:

1. Prefer **archiving in-place** rather than deleting:
   - Update the item’s `Status` to `Archived`.
   - Optionally move the bullet under an “Archived” heading within the page, if such a heading exists.
2. Only perform a hard delete (removing the block from the page) if the user explicitly says “delete” or “remove permanently”.
3. Confirm the action with a clear statement:

```markdown
- **Archived** feature `F-123` (Unified inbox search) in the Notion feature list.
```

If the user uses ambiguous language like “remove”, the agent should **prefer archiving** and clarify in the response.

### 5. Reorganize / Normalize Existing Content

Over time, the Notion pages may accumulate a mix of formats (legacy bullets, ad-hoc notes, older tables). When the user explicitly asks to “reorganize” or “normalize” a page, for example:

- “Reorganize the FEATURES page into the clean table format”
- “Normalize the tech debt list so everything is in the table”

The agent should:

1. **Read all existing content** on the relevant page:
   - Bulleted lists
   - Existing tables
   - Headings and free-text notes
2. **Extract candidate items**:
   - Parse bullets or rows that look like individual items (features, roadmap entries, tech-debt items, bugs).
   - Infer Type / ID / Title / Status / Priority / Area / Description where possible.
3. **Populate the canonical table**:
   - Ensure there is exactly one main table with the standard columns.
   - Add a row per item, filling in whatever fields can be inferred; leave others as `Unknown` or blank.
4. **Preserve context**:
   - Do **not delete** legacy bullets or notes by default.
   - Instead, move them under a heading like “Legacy / Archived Notes” or “Unstructured Items” so information is not lost.
5. **Confirm the reorganization**:
   - Summarize how many items were normalized into the table.
   - Call out any items that could not be parsed cleanly.

The agent should **only perform large-scale reorganizations when the user explicitly asks for it**, to avoid surprising structural changes in Notion.

## Trigger Phrases & When to Use This Skill

The agent should automatically consider this skill when:

- The user mentions **Notion** together with:
  - “feature list”, “features”
  - “roadmap”
  - “tech debt”, “technical debt”
  - “bug backlog”, “bugs”
- The user uses phrases like:
  - “Sync this feature into Notion”
  - “Show me planned features”
  - “Update the status of X in the Notion feature list”
  - “Add this to the roadmap”
  - “Add this to tech debt”
  - “Create a bug in the backlog”

Additionally, the agent should:

- Suggest syncing to Notion when the user describes a feature, bug, or tech-debt item in detail, even without an explicit Notion mention. For example:
  - If the user describes a new feature in chat, the agent can ask: “Do you want me to sync this into the Notion feature list?” and then create it when confirmed.

## Implementation Notes (TypeScript-Oriented)

This project prefers TypeScript. When implementing concrete helpers, the agent should:

- Place helper scripts under a directory such as:
  - `scripts/notion/featureList.ts`
- Use the official Notion API via `fetch` or a lightweight TS client.
- Read configuration from environment variables without logging their values.

### Example TypeScript Outline (for reference)

The following is a **conceptual outline**, not a required exact implementation:

```ts
// scripts/notion/featureList.ts
import "dotenv/config";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const FEATURES_PAGE_ID = process.env.NOTION_FEATURES_PAGE_ID;

if (!NOTION_TOKEN) {
  throw new Error("NOTION_TOKEN is not set");
}

export async function appendFeatureItem(text: string) {
  if (!FEATURES_PAGE_ID) {
    throw new Error("NOTION_FEATURES_PAGE_ID is not set");
  }

  const body = {
    children: [
      {
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [
            {
              type: "text",
              text: { content: text },
            },
          ],
        },
      },
    ],
  };

  const res = await fetch(
    `https://api.notion.com/v1/blocks/${FEATURES_PAGE_ID}/children`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const textBody = await res.text();
    throw new Error(`Failed to append Notion block: ${res.status} ${textBody}`);
  }
}
```

The agent may adapt this pattern for:

- Reading all bullet items from a page.
- Updating a specific bullet block in place.
- Archiving/moving items under headings.

## Workflow from Chat to Notion

When the user describes a feature (or roadmap item, tech debt, bug) in chat and indicates it should be synced:

1. **Interpret the request**:
   - Determine type: `Feature`, `Roadmap`, `TechDebt`, or `Bug`.
   - Extract title, description, status, priority, area.
2. **Check configuration**:
   - Verify `NOTION_TOKEN` and the appropriate `*_PAGE_ID` are set.
   - If not, explain what is missing and how to fix it (by adding to `.env`).
3. **Construct canonical text**:
   - Use the canonical item format with a new unique ID.
4. **Write to Notion**:
   - Append a new bullet to the appropriate page.
5. **Confirm to the user**:
   - Show a brief bullet or table row including Type, ID, Title, Status, Priority, Area.

When the user asks to **inspect or update** items:

1. Read & parse bullets from the appropriate page.
2. Apply filters and show a concise, human-readable summary.
3. For updates, modify the canonical line while preserving extra details.
4. Confirm changes back to the user.

This skill should ensure that working with Notion feature/roadmap/tech-debt/bug lists from within Cursor remains **safe, structured, and reversible**, while keeping output **brief, summarized, and easy to scan**.

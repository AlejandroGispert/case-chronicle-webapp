/**
 * Sync recent calendar work to Notion FEATURES page.
 * Run from project root: node scripts/notion/syncCalendarToNotion.mjs
 */
import "dotenv/config";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const FEATURES_PAGE_ID = process.env.NOTION_FEATURES_PAGE_ID;

if (!NOTION_TOKEN) {
  console.error("NOTION_TOKEN is not set in .env");
  process.exit(1);
}

if (!FEATURES_PAGE_ID) {
  console.error("NOTION_FEATURES_PAGE_ID is not set in .env");
  process.exit(1);
}

const FEATURES = [
  {
    title: "Case-filtered calendar from case cards",
    description:
      "Calendar button next to Register New Case Entry on each case card; navigates to /calendar filtered by that case. Banner shows 'Viewing calendar for: [case title]' and 'View all calendar' to clear.",
    status: "Done",
    area: "Calendar",
  },
  {
    title: "Calendar year/month dropdowns and single-month layout",
    description:
      "Month and year selectors (dropdown only, no duplicate nav). Single-month view; single-column layout to avoid repeated calendar UI.",
    status: "Done",
    area: "Calendar",
  },
  {
    title: "Calendar entries display and day highlighting",
    description:
      "Entries for selected date shown in right panel, sorted by time. Days with entries have background color (events: legal-100, emails: amber-100). Robust date normalization and grouping so entries show correctly.",
    status: "Done",
    area: "Calendar",
  },
];

async function findOrCreateFeaturesTable() {
  const childrenRes = await fetch(
    `https://api.notion.com/v1/blocks/${FEATURES_PAGE_ID}/children?page_size=100`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
      },
    },
  );

  if (!childrenRes.ok) {
    const text = await childrenRes.text();
    throw new Error(
      `Failed to fetch FEATURES page children: ${childrenRes.status} ${text}`,
    );
  }

  const childrenData = await childrenRes.json();
  const tableBlock = childrenData.results.find((b) => b.type === "table");

  if (tableBlock) return tableBlock.id;

  const tableBody = {
    children: [
      {
        object: "block",
        type: "table",
        table: {
          table_width: 4,
          has_column_header: true,
          has_row_header: false,
          children: [
            {
              object: "block",
              type: "table_row",
              table_row: {
                cells: [
                  [{ type: "text", text: { content: "Title" } }],
                  [{ type: "text", text: { content: "Status" } }],
                  [{ type: "text", text: { content: "Area" } }],
                  [{ type: "text", text: { content: "Description" } }],
                ],
              },
            },
          ],
        },
      },
    ],
  };

  const createRes = await fetch(
    `https://api.notion.com/v1/blocks/${FEATURES_PAGE_ID}/children`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify(tableBody),
    },
  );

  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(
      `Failed to create FEATURES table: ${createRes.status} ${text}`,
    );
  }

  const created = await createRes.json();
  const newTableBlock = created.results.find((b) => b.type === "table");
  if (!newTableBlock) {
    throw new Error("FEATURES table creation did not return a table block");
  }
  return newTableBlock.id;
}

async function appendFeatureRow(tableId, { title, description, status, area }) {
  const truncate = (s, max = 2000) =>
    s.length > max ? s.slice(0, max - 3) + "..." : s;

  const rowBody = {
    children: [
      {
        object: "block",
        type: "table_row",
        table_row: {
          cells: [
            [{ type: "text", text: { content: truncate(title, 2000) } }],
            [{ type: "text", text: { content: status } }],
            [{ type: "text", text: { content: area } }],
            [{ type: "text", text: { content: truncate(description, 2000) } }],
          ],
        },
      },
    ],
  };

  const res = await fetch(
    `https://api.notion.com/v1/blocks/${tableId}/children`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify(rowBody),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to append feature row: ${res.status} ${text}`);
  }
}

async function main() {
  const tableId = await findOrCreateFeaturesTable();

  for (const f of FEATURES) {
    await appendFeatureRow(tableId, f);
    console.log(`Appended: ${f.title} (${f.status}, ${f.area})`);
  }

  console.log(
    `Synced ${FEATURES.length} calendar feature(s) to Notion FEATURES.`,
  );
}

main().catch((err) => {
  console.error("Sync to Notion failed:", err.message);
  process.exit(1);
});

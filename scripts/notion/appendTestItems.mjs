import "dotenv/config";

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const FEATURES_PAGE_ID = process.env.NOTION_FEATURES_PAGE_ID;
const ROADMAP_PAGE_ID = process.env.NOTION_ROADMAP_PAGE_ID;
const TECH_DEBT_PAGE_ID = process.env.NOTION_TECH_DEBT_PAGE_ID;
const BUG_BACKLOG_PAGE_ID = process.env.NOTION_BUG_BACKLOG_PAGE_ID;

if (!NOTION_TOKEN) {
  console.error("NOTION_TOKEN is not set in .env");
  process.exit(1);
}

const REQUIRED = [
  ["NOTION_FEATURES_PAGE_ID", FEATURES_PAGE_ID],
  ["NOTION_ROADMAP_PAGE_ID", ROADMAP_PAGE_ID],
  ["NOTION_TECH_DEBT_PAGE_ID", TECH_DEBT_PAGE_ID],
  ["NOTION_BUG_BACKLOG_PAGE_ID", BUG_BACKLOG_PAGE_ID],
];

for (const [name, value] of REQUIRED) {
  if (!value) {
    console.error(`${name} is not set in .env`);
    process.exit(1);
  }
}

async function findOrCreateTable(pageId, title) {
  const childrenRes = await fetch(
    `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`,
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
      `Failed to fetch children for page ${title}: ${childrenRes.status} ${text}`,
    );
  }

  const childrenData = await childrenRes.json();
  const existing = childrenData.results.find((b) => b.type === "table");
  if (existing) return existing.id;

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
    `https://api.notion.com/v1/blocks/${pageId}/children`,
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
      `Failed to create table for page ${title}: ${createRes.status} ${text}`,
    );
  }

  const created = await createRes.json();
  const newTable = created.results.find((b) => b.type === "table");
  if (!newTable) {
    throw new Error(`Table creation for page ${title} did not return a table`);
  }
  return newTable.id;
}

async function appendRow(tableId, row) {
  const rowBody = {
    children: [
      {
        object: "block",
        type: "table_row",
        table_row: {
          cells: [
            [{ type: "text", text: { content: row.title } }],
            [{ type: "text", text: { content: row.status } }],
            [{ type: "text", text: { content: row.area } }],
            [{ type: "text", text: { content: row.description } }],
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
    throw new Error(
      `Failed to append row to table ${tableId}: ${res.status} ${text}`,
    );
  }
}

async function run() {
  const suffix = Date.now().toString().slice(-4);

  const pages = [
    {
      name: "FEATURES",
      pageId: FEATURES_PAGE_ID,
      row: {
        title: "Test: unified case search",
        description:
          "Single search bar across emails, events, documents, and contacts.",
        type: "Feature",
        id: `F-${suffix}`,
        status: "Planned",
        priority: "High",
        area: "Inbox",
      },
    },
    {
      name: "ROADMAP",
      pageId: ROADMAP_PAGE_ID,
      row: {
        title: "Test: Q3 performance improvements",
        description: "Optimize inbox rendering and Supabase queries.",
        type: "Roadmap",
        id: `R-${suffix}`,
        status: "Planned",
        priority: "Medium",
        area: "Dashboard",
      },
    },
    {
      name: "TECH_DEBT",
      pageId: TECH_DEBT_PAGE_ID,
      row: {
        title: "Test: auth flow refactor",
        description: "Simplify login callbacks and error handling.",
        type: "TechDebt",
        id: `TD-${suffix}`,
        status: "Identified",
        priority: "High",
        area: "Auth",
      },
    },
    {
      name: "BUG_BACKLOG",
      pageId: BUG_BACKLOG_PAGE_ID,
      row: {
        title: "Test: calendar not updating",
        description: "Events list does not refresh after creating a new event.",
        type: "Bug",
        id: `B-${suffix}`,
        status: "Open",
        priority: "Critical",
        area: "Calendar",
      },
    },
  ];

  for (const page of pages) {
    const tableId = await findOrCreateTable(page.pageId, page.name);
    await appendRow(tableId, page.row);
    console.log(
      `Appended test row to ${page.name} page: ${page.row.id} – ${page.row.title}`,
    );
  }
}

run().catch((err) => {
  console.error("Error appending test rows to Notion pages:", err);
  process.exit(1);
});

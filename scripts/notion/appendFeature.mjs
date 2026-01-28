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

// Feature details – aligned with the Skill’s canonical table format
const featureTitle = "Email tagging and category filters";
const description =
  "Allow case handlers to tag emails with multiple categories and filter the inbox by those tags to quickly find relevant communications.";

// Simple unique ID generator for this test feature
const idSuffix = Date.now().toString().slice(-6);
const featureId = `F-${idSuffix}`;

async function findOrCreateFeaturesTable() {
  // 1) Fetch children of the FEATURES page and look for a table block
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

  if (tableBlock) {
    return tableBlock.id;
  }

  // 2) No table found: create a new table with header row
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

async function appendFeatureRow(tableId) {
  const rowBody = {
    children: [
      {
        object: "block",
        type: "table_row",
        table_row: {
          cells: [
            [{ type: "text", text: { content: featureTitle } }],
            [{ type: "text", text: { content: "Planned" } }],
            [{ type: "text", text: { content: "Inbox" } }],
            [{ type: "text", text: { content: description } }],
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
      `Failed to append feature row to Notion table: ${res.status} ${text}`,
    );
  }
}

async function main() {
  const tableId = await findOrCreateFeaturesTable();
  await appendFeatureRow(tableId);

  console.log(
    `Appended table row to Notion FEATURES page with ID ${featureId}: ${featureTitle}`,
  );
}

main().catch((err) => {
  console.error("Unexpected error while appending feature to Notion:", err);
  process.exit(1);
});

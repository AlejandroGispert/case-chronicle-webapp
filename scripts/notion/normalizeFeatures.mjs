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

function extractPlainText(block) {
  const type = block.type;
  const rich = block[type]?.rich_text ?? [];
  return rich
    .map((r) => r.plain_text ?? "")
    .join(" ")
    .trim();
}

function inferFieldsFromText(text) {
  // Very simple heuristics – safe best-effort parsing
  let type = "Feature";
  if (/bug/i.test(text)) type = "Bug";
  else if (/roadmap/i.test(text)) type = "Roadmap";
  else if (/tech[\s_-]?debt/i.test(text)) type = "TechDebt";

  let id = "";
  const idMatch = text.match(/\b([FRB]D?-\d+)\b/i);
  if (idMatch) id = idMatch[1].toUpperCase();

  // Use up to first 80 chars as title fallback
  const title = text.slice(0, 80);

  let status = "";
  if (/in progress/i.test(text)) status = "In Progress";
  else if (/done|completed/i.test(text)) status = "Done";
  else if (/planned/i.test(text)) status = "Planned";

  let priority = "";
  if (/critical|p0/i.test(text)) priority = "Critical";
  else if (/high|p1/i.test(text)) priority = "High";
  else if (/low|p3/i.test(text)) priority = "Low";

  let area = "";
  if (/inbox/i.test(text)) area = "Inbox";
  else if (/calendar/i.test(text)) area = "Calendar";
  else if (/auth|login|signup/i.test(text)) area = "Auth";

  const description = text;

  return { type, id, title, status, priority, area, description };
}

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

  if (tableBlock) {
    return { tableId: tableBlock.id, children: childrenData.results };
  }

  // No table yet – create one with header row
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

  // Fetch children again so we have the latest list including the table
  const refetch = await fetch(
    `https://api.notion.com/v1/blocks/${FEATURES_PAGE_ID}/children?page_size=100`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
      },
    },
  );
  const refetchData = await refetch.json();

  return { tableId: newTableBlock.id, children: refetchData.results };
}

async function appendRows(tableId, rows) {
  if (!rows.length) return;

  const rowBlocks = rows.map((r) => ({
    object: "block",
    type: "table_row",
    table_row: {
      cells: [
        [{ type: "text", text: { content: r.title } }],
        [{ type: "text", text: { content: r.status } }],
        [{ type: "text", text: { content: r.area } }],
        [{ type: "text", text: { content: r.description } }],
      ],
    },
  }));

  const res = await fetch(
    `https://api.notion.com/v1/blocks/${tableId}/children`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({ children: rowBlocks }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to append rows to FEATURES table: ${res.status} ${text}`,
    );
  }
}

async function main() {
  const { tableId, children } = await findOrCreateFeaturesTable();

  // Collect candidate items from bullets / paragraphs that aren't the table itself
  const candidates = children.filter(
    (b) =>
      b.type === "bulleted_list_item" ||
      b.type === "numbered_list_item" ||
      b.type === "paragraph",
  );

  const rows = candidates
    .map((block) => {
      const text = extractPlainText(block);
      if (!text) return null;
      return inferFieldsFromText(text);
    })
    .filter(Boolean);

  await appendRows(tableId, rows);

  console.log(
    `Normalized ${rows.length} existing items into the FEATURES table (original content left in place for safety).`,
  );
}

main().catch((err) => {
  console.error("Unexpected error while normalizing FEATURES page:", err);
  process.exit(1);
});

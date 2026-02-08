# Case Chronicles API (OpenAPI)

This folder contains the **OpenAPI 3.0** specification for the Case Chronicles REST API, used when migrating to a Rust backend (Hetzner + Keycloak + PostgreSQL).

## File

- **`openapi.yaml`** – Full API contract: all endpoints, request/response schemas, security (Bearer JWT), and GDPR/audit notes.

## Purpose

- **Contract** – Single source of truth for paths, methods, and payloads so the Rust backend and frontend (or generated client) stay in sync.
- **Security** – Documents `securitySchemes.bearerAuth` (Keycloak JWT) and which operations require authentication.
- **GDPR** – Endpoints for data export (Art. 20) and account deletion (Art. 17) are described and marked with audit behaviour.

## How to view the OpenAPI spec

**Quick preview (Redoc, live server):** From the project root run:

```bash
npx @redocly/cli@1 preview-docs docs/api/openapi.yaml
```

Then open http://localhost:8080.

---

- **VS Code / Cursor** – Install the [OpenAPI (Swagger) Editor](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi) or [Swagger Viewer](https://marketplace.visualstudio.com/items?itemName=Arjun.swagger-viewer) extension, then open `openapi.yaml` and use the preview (e.g. “Preview Swagger” or “OpenAPI Preview”).
- **Swagger UI in the browser** – From the project root run:
  ```bash
  npx --yes swagger-ui-watcher docs/api/openapi.yaml
  ```
  Then open the URL shown (e.g. http://localhost:8080).
- **Redoc in the browser** – Choose one:
  - **Live preview (Redocly CLI v1):**
    ```bash
    npx @redocly/cli@1 preview-docs docs/api/openapi.yaml
    ```
    Then open http://localhost:8080.
  - **Build static HTML (Redocly CLI v2):**
    ```bash
    npx @redocly/cli build-docs docs/api/openapi.yaml -o docs/api/redoc-static.html
    ```
    Then open `docs/api/redoc-static.html` in your browser.
  - **Deprecated but works:** `npx --yes redoc-cli serve docs/api/openapi.yaml` then open http://localhost:8080.
- **Online** – Paste the contents of `openapi.yaml` into [Swagger Editor](https://editor.swagger.io/) or [Redoc demo](https://redocly.github.io/redoc/) (paste or point to a hosted URL).

## How to use

1. **Implement the backend** – Use the spec to implement routes in Rust (e.g. Axum/Actix-web); validate requests/responses against the schemas.
2. **Generate a client** – Use OpenAPI codegen (e.g. `openapi-generator`, `orval`) to generate a TypeScript/JavaScript client for the frontend.
3. **View docs** – Use [Swagger UI](https://swagger.io/tools/swagger-ui/) or [Redoc](https://redocly.com/redoc/) to serve `openapi.yaml` for human-readable API docs.

## Related

- **Migration checklist:** [../HETZNER_RUST_KEYCLOAK_GDPR_CHECKLIST.md](../HETZNER_RUST_KEYCLOAK_GDPR_CHECKLIST.md)
- **Architecture:** [../../ARCHITECTURE.md](../../ARCHITECTURE.md)

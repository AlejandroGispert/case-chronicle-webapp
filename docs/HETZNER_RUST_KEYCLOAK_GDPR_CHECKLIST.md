# Migration Checklist: Hetzner + Rust + Keycloak + PostgreSQL (EU, Security & GDPR)

This document is the actionable checklist for moving Case Chronicles to:

- **Server:** Hetzner (EU)
- **Backend:** Rust (e.g. Axum / Actix-web)
- **Frontend:** Same server (static build)
- **Auth:** Keycloak
- **Database:** PostgreSQL
- **Focus:** Maximum security and strong GDPR compliance in the EU

---

## 1. API & Backend Boundary

- [x] **1.1** List every controller operation the UI uses (cases, auth, contacts, events, documents, export, etc.).
- [x] **1.2** For each operation, define: HTTP method, path, request (path/query/body) and response shape.
- [x] **1.3** Document which auth/role/ownership checks apply (mirror current `requireAuth` / `requireRole` / `requireOwnership`).
- [x] **1.4** Optionally produce an OpenAPI spec so Rust and frontend share the contract. → **Done:** `docs/api/openapi.yaml`
- [ ] **1.5** Implement the API in Rust (Axum or Actix-web) with the same semantics as current controllers.

---

## 2. Authentication (Keycloak)

Authentication uses short-lived access tokens validated by the backend; refresh tokens are handled exclusively by the Keycloak JS adapter. Authorization is based on client roles defined on the `case-chronicles-api` client.

- [ ] **2.1** Frontend: integrate Keycloak JS adapter; login/redirect; store and send access token to API.
- [ ] **2.2** Rust: validate Keycloak JWT on every protected request (signature, issuer, audience, expiry).
- [ ] **2.3** Extract user id (`sub`) and roles from token; use for authorization (same rules as current controllers).
- [ ] **2.4** No auth logic in UI beyond obtaining and attaching the token; all authorization on backend.
- [ ] **2.5** Keycloak instance and realm configured in EU (same region as app).

---

## 3. Database (PostgreSQL)

- [ ] **3.1** PostgreSQL hosted in EU (e.g. Hetzner same region as app, or managed EU Postgres).
- [ ] **3.2** Rust: use SQLx, Diesel, or SeaORM; implement same resources and ownership rules as current models.
- [ ] **3.3** All user-scoped queries filter by `user_id` (or equivalent); never trust client for scoping.
- [ ] **3.4** Use parameterized queries only; no string concatenation for SQL.
- [ ] **3.5** Connection strings and credentials in environment variables; never in code or frontend.

---

## 4. Security (Hardening)

- [ ] **4.1** HTTPS only (TLS 1.2+); redirect HTTP → HTTPS.
- [ ] **4.2** Secure cookies: `Secure`, `HttpOnly`, `SameSite=Strict` (or Lax if cross-site needed).
- [ ] **4.3** CORS: allow only your frontend origin(s); no wildcard in production.
- [ ] **4.4** Security headers: `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`.
- [ ] **4.5** Rate limiting on auth and sensitive endpoints (login, export, delete).
- [ ] **4.6** Request ID (or correlation ID) on each request for audit and debugging; no PII in logs.
- [ ] **4.7** No secrets in frontend bundle; no `any` / `unknown` / unsafe typecasting in backend.
- [ ] **4.8** Dependency review: lockfile committed; regular updates; no known-vulnerable deps (e.g. `cargo audit`, `npm audit`).

---

## 5. GDPR (Strong Compliance)

- [ ] **5.1** **Data export (Art. 20):** Endpoint that returns all data linked to the authenticated user (same scope as current `dataExportController.exportUserData`), in machine-readable format (e.g. JSON); audit log the export.
- [ ] **5.2** **Right to erasure (Art. 17):** Single “delete my account and all my data” flow: delete or anonymize user and all related data (cases, contacts, events, documents, etc.); audit log the deletion; no PII left in logs.
- [ ] **5.3** **Lawfulness (Art. 6):** Document legal basis (e.g. consent, contract) for each processing; privacy notice updated.
- [ ] **5.4** **Data minimization:** Collect and retain only what’s necessary; no extra PII in logs or analytics.
- [ ] **5.5** **Audit trail:** Append-only audit log for login/logout, data export, data/account deletion, permission changes, file access; logs contain no PII (only user_id, action, resource_id, timestamp, request_id).
- [ ] **5.6** **Retention:** Define and document retention for user data and audit logs; automated or documented deletion where applicable.
- [ ] **5.7** **Subprocessors:** List subprocessors (e.g. Hetzner, Keycloak host); DPAs where required; processing in EU only for EU data.

---

## 6. EU Data Residency & Hosting

- [ ] **6.1** App server (Rust + static frontend): Hetzner EU (e.g. Falkenstein, Helsinki).
- [ ] **6.2** PostgreSQL: same EU region (Hetzner or managed EU Postgres).
- [ ] **6.3** Keycloak: same EU region (self-hosted on Hetzner or EU Keycloak provider).
- [ ] **6.4** File storage (documents): EU only (local disk or S3-compatible in EU).
- [ ] **6.5** No US (or non-adequate) services processing EU personal data unless strictly necessary and with appropriate safeguards (e.g. SCCs, adequacy).

---

## 7. Frontend Changes

- [ ] **7.1** Replace direct controller calls with `fetch('/api/...')` (or generated client) using Keycloak access token (e.g. `Authorization: Bearer <token>`).
- [ ] **7.2** AuthContext (or equivalent) uses Keycloak for login state and token; no Supabase auth in bundle.
- [ ] **7.3** Build: `npm run build`; serve static assets from Rust or reverse proxy (nginx) on same server.
- [ ] **7.4** No API keys or secrets in frontend; only token obtained via Keycloak flow.

---

## 8. Storage (Documents / Files)

- [ ] **8.1** Replace Supabase Storage with EU-backed storage (e.g. local filesystem or S3-compatible in EU).
- [ ] **8.2** Rust: endpoints for upload/download; auth required; audit log upload/download where required.
- [ ] **8.3** Access control: only resource owner (or explicitly shared) can access files; enforce on backend.
- [ ] **8.4** No public URLs for sensitive documents; serve via authenticated API.

---

## 9. Deployment & Operations

- [ ] **9.1** Single server or minimal set: Rust app + static files; optional nginx in front; Postgres and Keycloak on same or adjacent EU nodes.
- [ ] **9.2** Environment-based config: dev/staging/prod; secrets from env or secret manager (not in repo).
- [ ] **9.3** Backups: Postgres backups; restore procedure documented and tested periodically.
- [ ] **9.4** Monitoring: centralized errors and health checks; no PII in logs or metrics.

---

## 10. Documentation & Legal

- [ ] **10.1** Update privacy notice: data collected, legal basis, retention, rights (access, rectification, erasure, portability, etc.), EU contact/DPO if applicable.
- [ ] **10.2** Document data flow (e.g. user → frontend → Rust API → Postgres/Keycloak/storage); keep DATA_INVENTORY and DATA_FLOW up to date (see `docs/ISO 27001/`).
- [ ] **10.3** Document subprocessors and DPAs; keep LEGAL_COMPLIANCE and retention policy aligned (see `docs/ISO 27001/`).
- [ ] **10.4** Internal runbook: how to handle access/deletion/export requests within SLA (e.g. 30 days for GDPR requests).

---

## Quick Reference: Security & GDPR Priorities

| Priority | Item |
|---------|------|
| **Security** | HTTPS only, secure cookies, CORS, security headers, rate limiting, no secrets in frontend, JWT validation on every request |
| **Security** | All authorization on backend; parameterized queries; request IDs; dependency audits |
| **GDPR** | Data export (Art. 20), right to erasure (Art. 17), audit log (no PII), retention, data minimization |
| **GDPR** | EU-only processing for EU data; subprocessors and DPAs documented |
| **Both** | Append-only audit for sensitive actions; no PII in logs; backups and restore tested |

---

**Related docs:** `ARCHITECTURE.md`, `MIGRATION_GUIDE.md`, `docs/ISO 27001/SECURITY_CHECKLIST.md`, `docs/ISO 27001/LEGAL_COMPLIANCE.md`, `docs/ISO 27001/DATA_INVENTORY.md`

**Last updated:** 2026-02-07

# Data Inventory - Where Personal Data Lives

## Overview

This document catalogs all locations where personal data is stored, required for GDPR compliance and data mapping.

---

## Database Tables (Supabase PostgreSQL)

### `auth.users` (Supabase Auth)
**Personal Data:**
- Email address
- Password hash (not PII, but sensitive)
- User ID (UUID)
- Email verification status
- Created timestamp

**Purpose:** User authentication
**Legal Basis:** Contract (user account)
**Retention:** While account active + 30 days after deletion
**Access:** User (own data), Application (authentication), Admin (all)

---

### `profiles`
**Personal Data:**
- User ID (UUID) - FK to auth.users
- Email address
- First name
- Last name
- Created timestamp
- Updated timestamp

**Purpose:** User profile information
**Legal Basis:** Contract (user account)
**Retention:** While account active + 30 days after deletion
**Access:** User (own data), Application (via service), Admin (all)

---

### `cases`
**Personal Data:**
- User ID (UUID) - FK to profiles
- Case title (may contain client names)
- Client name
- Case number
- Status
- Date created
- Date updated

**Purpose:** Case management
**Legal Basis:** Contract (service provision)
**Retention:** While account active + 30 days after deletion
**Access:** User (own cases), Application (via service), Admin (all)

---

### `emails`
**Personal Data:**
- User ID (UUID) - FK to profiles
- Case ID (UUID) - FK to cases
- Subject (may contain PII)
- Body (may contain PII)
- Date
- Time
- Attachments (JSON metadata)
- Sender/recipient information (may be in body)

**Purpose:** Email tracking and management
**Legal Basis:** Contract (service provision)
**Retention:** While account active + 30 days after deletion
**Access:** User (own emails), Application (via service), Admin (all)

---

### `events`
**Personal Data:**
- User ID (UUID) - FK to profiles
- Case ID (UUID) - FK to cases
- Title
- Description (may contain PII)
- Date
- Time
- Event type

**Purpose:** Event tracking
**Legal Basis:** Contract (service provision)
**Retention:** While account active + 30 days after deletion
**Access:** User (own events), Application (via service), Admin (all)

---

### `contacts`
**Personal Data:**
- User ID (UUID) - FK to profiles
- Case ID (UUID) - FK to cases (nullable)
- Name
- Email (if provided)
- Phone (if provided)
- Other contact information

**Purpose:** Contact management
**Legal Basis:** Contract (service provision)
**Retention:** While account active + 30 days after deletion
**Access:** User (own contacts), Application (via service), Admin (all)

---

### `case_access_codes`
**Personal Data:**
- Case ID (UUID) - FK to cases
- Access code (temporary)
- Created timestamp

**Purpose:** Temporary case access
**Legal Basis:** Legitimate interest (case sharing)
**Retention:** 30 days after creation or until used
**Access:** Application (via service), Admin (all)

---

### `audit_logs`
**Personal Data:**
- User ID (UUID) - FK to auth.users (nullable)
- Action type
- Resource type
- Resource ID
- Timestamp
- Request ID
- IP address (if available)
- User agent (if available)
- Metadata (sanitized, no PII)

**Purpose:** Compliance and security auditing
**Legal Basis:** Legal obligation (ISO 27001, GDPR)
**Retention:** 7 years
**Access:** User (own logs), Admin (all), System (write-only)

**Note:** Audit logs contain NO PII by design. PII is automatically sanitized.

---

## Storage Buckets (Supabase Storage)

### `email_attachments`
**Personal Data:**
- Email attachments (files)
- May contain: Documents, images, PDFs with PII

**Purpose:** Email attachment storage
**Legal Basis:** Contract (service provision)
**Retention:** While email exists + 30 days after email deletion
**Access:** User (own attachments), Application (via service), Admin (all)

**Path Structure:** `{userId}/{timestamp}-{filename}`

---

### `case_document`
**Personal Data:**
- Case documents (files)
- May contain: Legal documents, reports, images with PII

**Purpose:** Case document storage
**Legal Basis:** Contract (service provision)
**Retention:** While case exists + 30 days after case deletion
**Access:** User (own documents), Application (via service), Admin (all)

**Path Structure:** `{userId}/{caseId}/{timestamp}-{filename}`

---

## Backup Storage

### Supabase Automated Backups
**Personal Data:**
- Complete database snapshots
- Includes all tables listed above

**Purpose:** Disaster recovery
**Legal Basis:** Legitimate interest (business continuity)
**Retention:** 90 days
**Access:** Admin only

**Location:** Supabase managed backup storage
**Encryption:** AES-256

---

## Third-Party Services

### Supabase (Data Processor)
**Personal Data Processed:**
- All data listed above

**Purpose:** Infrastructure and hosting
**Legal Basis:** Contract (DPA required)
**Location:** EU/US (configurable)
**Retention:** As per primary storage
**Access:** Supabase (infrastructure), Application (via API)

**GDPR Status:** ⚠️ DPA required

---

## Data Categories

### Directly Identifiable
- Email addresses
- Names (first, last)
- User IDs (UUIDs)

### Indirectly Identifiable
- Case titles (may contain client names)
- Email content (may contain names, addresses)
- Document content (may contain PII)

### Pseudonymized
- User IDs (UUIDs instead of emails in some contexts)
- Resource IDs (UUIDs)

### Anonymized
- Audit logs (PII sanitized)
- Aggregated statistics (if any)

---

## Data Minimization Status

| Data Type | Required? | Purpose | Can Be Removed? |
|-----------|-----------|---------|-----------------|
| Email | Yes | Authentication, communication | No (required for account) |
| Password | Yes | Authentication | No (required for account) |
| First Name | Optional | User preference | Yes |
| Last Name | Optional | User preference | Yes |
| Case Data | Yes | Core functionality | Yes (user can delete) |
| Email Content | Yes | Core functionality | Yes (user can delete) |
| Documents | Optional | User uploads | Yes (user can delete) |
| Contacts | Optional | User input | Yes (user can delete) |

---

## Data Access Log

### Who Accesses What

**End Users:**
- Own profile data
- Own cases
- Own emails
- Own events
- Own contacts
- Own documents
- Own audit logs (read-only)

**Application (Service Role):**
- All data (for operations)
- No direct user access
- All operations logged

**Administrators:**
- All data (for support/debugging)
- Audit logs
- Backup access
- Supabase Dashboard access

**System:**
- Audit logs (write-only)
- No user data access

---

## Data Processing Activities

### Collection
- **Source:** User input (forms, uploads)
- **Method:** HTTPS encrypted forms
- **Consent:** Implicit (account creation)

### Storage
- **Location:** Supabase (EU/US)
- **Encryption:** AES-256 at rest
- **Backup:** Automated daily

### Processing
- **Location:** Application servers (Supabase)
- **Purpose:** Service provision
- **Automation:** Automated processing for service delivery

### Sharing
- **Current:** None (no third-party sharing)
- **Future:** Only with explicit user consent

### Deletion
- **Method:** Soft delete (30 days) or hard delete
- **Process:** User-initiated or admin-initiated
- **Verification:** Audit logged

---

## Data Subject Rights Implementation

### Right to Access (Art. 15)
- **Endpoint:** `dataController.exportUserData()`
- **Format:** JSON/CSV
- **Content:** All user data from all tables
- **Timeline:** On-demand generation

### Right to Rectification (Art. 16)
- **Endpoints:** Update endpoints in all controllers
- **Process:** User updates → Controller → Model → Database
- **Verification:** User can view updated data

### Right to Erasure (Art. 17)
- **Endpoint:** `dataController.deleteUserData()`
- **Options:** Soft delete (30 days) or hard delete
- **Scope:** All user data + files
- **Verification:** Audit logged

### Right to Data Portability (Art. 20)
- **Endpoint:** `dataController.exportUserData()`
- **Format:** Machine-readable (JSON/CSV)
- **Delivery:** Download link or email

### Right to Object (Art. 21)
- **Implementation:** Account deletion
- **Process:** Same as Right to Erasure

---

## Compliance Checklist

### GDPR Requirements
- [x] Data inventory documented
- [x] Data flow documented
- [x] Legal basis identified
- [x] Retention periods defined
- [x] Data subject rights supported
- [x] Audit logging implemented
- [ ] DPA with Supabase signed
- [ ] Privacy policy published
- [ ] Data processing agreement with users

### ISO 27001 Requirements
- [x] Data locations documented
- [x] Access controls documented
- [x] Encryption documented
- [x] Backup procedures documented
- [ ] Security policies formalized
- [ ] Incident response plan
- [ ] Regular security audits

---

**Last Updated:** January 26, 2026  
**Next Review:** Quarterly or when data processing changes

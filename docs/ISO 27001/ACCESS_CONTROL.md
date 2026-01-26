# Access Control Documentation

## Overview

This document describes who has access to what data in the Case Chronicles application, required for ISO 27001 and GDPR compliance.

---

## Access Control Matrix

| Role | Database Tables | Storage Buckets | Audit Logs | Admin Panel | Supabase Dashboard |
|------|----------------|-----------------|------------|-------------|-------------------|
| **End User** | Own data only (RLS) | Own files only | Own logs (read) | No | No |
| **Application** | All data (service role) | All files (service role) | Write-only | No | No |
| **Admin** | All data | All files | All logs (read) | Yes | Yes |
| **System** | Audit logs (write) | None | Write-only | No | No |

---

## User Roles

### End User (Authenticated)
**Access Level:** Standard user
**Authentication:** Supabase Auth (email/password or OAuth)
**Authorization:** Application-level (controllers)

**Can Access:**
- Own profile data
- Own cases
- Own emails
- Own events
- Own contacts
- Own documents
- Own audit logs (read-only)

**Cannot Access:**
- Other users' data
- Admin functions
- System configuration
- Supabase Dashboard

**Access Method:**
- Via application UI
- Row Level Security (RLS) enforced
- Controller-level authorization checks

---

### Application (Service Role)
**Access Level:** System/service
**Authentication:** Service role key (server-side only)
**Authorization:** Application code

**Can Access:**
- All database tables (for operations)
- All storage buckets (for operations)
- Audit logs (write-only)

**Cannot Access:**
- User passwords (hashed only)
- Supabase Dashboard (no UI access)

**Access Method:**
- Via service abstraction layer
- Service role key in environment variables
- Never exposed to frontend

**Security:**
- Service role key stored in `.env` (never committed)
- Only used server-side
- All operations logged

---

### Administrator
**Access Level:** Full access
**Authentication:** Supabase Dashboard login
**Authorization:** Supabase project owner/team member

**Can Access:**
- All database tables (via Supabase Dashboard)
- All storage buckets (via Supabase Dashboard)
- All audit logs
- System configuration
- Backups

**Cannot Access:**
- User passwords (hashed only, cannot decrypt)

**Access Method:**
- Supabase Dashboard (web UI)
- SQL Editor (for queries)
- Storage Manager (for files)

**Security Requirements:**
- MFA required (see Security Checklist)
- Minimal admin users (principle of least privilege)
- All admin actions should be logged (future enhancement)

---

### System (Automated)
**Access Level:** Write-only (audit logs)
**Authentication:** Application service role
**Authorization:** Application code

**Can Access:**
- Audit logs table (write-only)

**Cannot Access:**
- User data
- Other tables
- Storage

**Access Method:**
- Automated audit logging
- No manual access

---

## Row Level Security (RLS) Policies

### Database Tables

All user-facing tables have RLS enabled with policies:

**Policy Pattern:**
```sql
-- Users can only see their own data
CREATE POLICY "Users can view own {table}"
  ON {table}
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own data
CREATE POLICY "Users can insert own {table}"
  ON {table}
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own data
CREATE POLICY "Users can update own {table}"
  ON {table}
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own data
CREATE POLICY "Users can delete own {table}"
  ON {table}
  FOR DELETE
  USING (auth.uid() = user_id);
```

**Tables with RLS:**
- `profiles`
- `cases`
- `emails`
- `events`
- `contacts`
- `audit_logs` (users see own logs only)

---

## Storage Bucket Policies

### `email_attachments` Bucket

**Policy:**
- Users can upload to `{userId}/` path only
- Users can read from `{userId}/` path only
- Users can delete from `{userId}/` path only
- Public access: Disabled

**Implementation:**
- Path-based access control
- Verified in application code (controllers)

### `case_document` Bucket

**Policy:**
- Users can upload to `{userId}/{caseId}/` path only
- Users can read from `{userId}/{caseId}/` path only
- Users can delete from `{userId}/{caseId}/` path only
- Public access: Disabled

**Implementation:**
- Path-based access control
- Verified in application code (controllers)

---

## Application-Level Authorization

### Controllers

All controllers enforce authorization:

```typescript
import { requireAuth, requireOwnership } from '@/backend/auth';

export const caseController = {
  async removeCase(caseId: string, user: User | null) {
    requireAuth(user); // Must be authenticated
    const case = await caseModel.getCase(caseId);
    requireOwnership(case.user_id, user.id); // Must own resource
    // ... proceed with operation
  }
};
```

**Authorization Checks:**
- `requireAuth()` - User must be authenticated
- `requireOwnership()` - User must own the resource
- `requireRole()` - User must have specific role (future)

---

## Access Logging

### What Gets Logged

**Authentication Events:**
- Login attempts (success/failure)
- Logout events
- Password reset requests
- OAuth logins

**Data Access Events:**
- Data reads (sensitive data only)
- Data creates
- Data updates
- Data deletes

**File Access Events:**
- File uploads
- File downloads
- File deletions

**All logged to:** `audit_logs` table

---

## Access Review Process

### Quarterly Reviews

**Review Items:**
1. Active user accounts
2. Admin user list (should be minimal)
3. Service role key usage
4. RLS policy effectiveness
5. Storage bucket access
6. Audit log anomalies

**Reviewers:**
- System Administrator
- Security Officer (if assigned)

**Documentation:**
- Review findings documented
- Access changes logged
- Remediation actions tracked

---

## Principle of Least Privilege

### Implementation

**Users:**
- Only access to own data
- No admin functions
- No system access

**Application:**
- Service role only for necessary operations
- No unnecessary permissions
- All operations logged

**Admins:**
- Minimal admin accounts
- MFA required
- Regular access reviews

---

## Access Revocation

### User Account Deletion

**Process:**
1. User requests deletion
2. Authorization verified
3. Data soft-deleted (30 days) or hard-deleted
4. Access immediately revoked
5. Audit logged

**Timeline:**
- Immediate: Access revoked
- 30 days: Data permanently deleted (if hard delete)

### Admin Access Revocation

**Process:**
1. Remove from Supabase team
2. Revoke API keys (if any)
3. Audit logged
4. Verify access removed

**Timeline:**
- Immediate: Access revoked

---

## Security Measures

### Authentication
- Supabase Auth (JWT tokens)
- Password hashing (bcrypt)
- OAuth support (Google)
- Session management

### Authorization
- Application-level (controllers)
- Database-level (RLS)
- Storage-level (bucket policies)

### Monitoring
- Audit logging (all access)
- Error logging
- Access pattern monitoring (future)

---

## Compliance Notes

### ISO 27001
- ✅ Access control documented
- ✅ Principle of least privilege implemented
- ✅ Access reviews scheduled
- ✅ Access revocation process defined
- ⚠️ Regular access reviews required

### GDPR
- ✅ Data access limited to necessary
- ✅ User access to own data only
- ✅ Access logging implemented
- ✅ Access revocation supported

---

**Last Updated:** January 26, 2026  
**Next Review:** Quarterly

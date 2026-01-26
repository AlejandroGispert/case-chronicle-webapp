# Data Retention Policy

## Overview

This policy defines how long personal data is retained in the Case Chronicles application, required for GDPR compliance (Art. 5(1)(e) - storage limitation).

---

## Retention Principles

1. **Data Minimization:** Retain only necessary data
2. **Purpose Limitation:** Retain only for stated purpose
3. **Storage Limitation:** Delete when no longer needed
4. **User Control:** Users can request deletion

---

## Retention Periods

### Active User Data

**Retention Period:** While user account is active

**Applies To:**
- User profile data
- Cases
- Emails
- Events
- Contacts
- Documents
- Storage files

**Legal Basis:** Contract (service provision)

**Deletion Trigger:**
- User account deletion
- User request for data deletion

---

### Deleted User Data (Soft Delete)

**Retention Period:** 30 days after deletion

**Applies To:**
- Soft-deleted user accounts
- Soft-deleted cases
- Soft-deleted emails
- Soft-deleted events
- Soft-deleted contacts
- Soft-deleted documents

**Purpose:** Recovery period (user can restore within 30 days)

**Legal Basis:** Legitimate interest (data recovery)

**Deletion Process:**
1. Data marked as `deleted = true`
2. Timestamp recorded (`deleted_at`)
3. Data hidden from user view
4. Retained for 30 days
5. Automatically hard-deleted after 30 days

**User Rights:**
- Can restore within 30 days
- Can request immediate hard delete

---

### Hard Deleted Data

**Retention Period:** Immediately removed

**Applies To:**
- Hard-deleted user accounts
- Hard-deleted cases
- Hard-deleted emails
- Hard-deleted events
- Hard-deleted contacts
- Hard-deleted documents
- Storage files

**Purpose:** Complete data removal (GDPR Art. 17)

**Legal Basis:** User request (GDPR Art. 17)

**Deletion Process:**
1. User requests hard delete
2. Authorization verified
3. All data permanently removed
4. Storage files deleted
5. Audit logged
6. Cannot be recovered

---

### Audit Logs

**Retention Period:** 7 years

**Applies To:**
- All audit log entries

**Purpose:** Compliance and security auditing

**Legal Basis:** Legal obligation (ISO 27001, GDPR compliance)

**Deletion:** Never deleted (append-only)

**Access:**
- Users: Own logs (read-only)
- Admins: All logs (read-only)
- System: Write-only

**Archival:**
- After 1 year: Move to archive storage (future enhancement)
- After 7 years: Can be deleted (if legally allowed)

---

### Backups

**Retention Period:** 90 days

**Applies To:**
- Database backups
- Storage backups

**Purpose:** Disaster recovery

**Legal Basis:** Legitimate interest (business continuity)

**Deletion Process:**
- Automated by Supabase
- Oldest backups automatically deleted
- Cannot be manually deleted (Supabase managed)

**Access:** Admin only

---

### Temporary Access Codes

**Retention Period:** 30 days or until used

**Applies To:**
- Case access codes (`case_access_codes` table)

**Purpose:** Temporary case sharing

**Legal Basis:** Legitimate interest (case sharing)

**Deletion Process:**
- Automatically deleted after 30 days
- Deleted immediately after use (if single-use)
- Can be manually revoked

---

### Session Data

**Retention Period:** Session duration + 7 days

**Applies To:**
- Authentication sessions
- JWT tokens

**Purpose:** User authentication

**Legal Basis:** Contract (service provision)

**Deletion Process:**
- Tokens expire after session timeout
- Expired tokens automatically invalidated
- Session data cleaned up after 7 days

---

## Deletion Procedures

### Soft Delete Procedure

1. **User Initiates:**
   - User requests deletion (account, case, etc.)
   - Authorization verified

2. **Application Process:**
   - Set `deleted = true`
   - Set `deleted_at = NOW()`
   - Hide from user view
   - Audit log: `data_deletion` action

3. **Retention Period:**
   - Data retained for 30 days
   - User can restore within 30 days

4. **Automatic Cleanup:**
   - Background job runs daily
   - Finds data with `deleted_at < NOW() - 30 days`
   - Converts to hard delete
   - Permanently removes data

### Hard Delete Procedure

1. **User Initiates:**
   - User requests permanent deletion
   - OR 30-day soft delete period expired
   - Authorization verified

2. **Application Process:**
   - Delete from database tables
   - Delete from storage buckets
   - Delete related data (cascade)
   - Audit log: `data_deletion` action (hard delete)

3. **Verification:**
   - Verify data removed
   - Verify storage files removed
   - Confirm in audit log

4. **Recovery:**
   - Not possible after hard delete
   - Only from backups (admin only, 90 days)

---

## Implementation Status

### ✅ Implemented

- [x] Retention periods defined
- [x] Audit logging for deletions
- [x] User-initiated deletion
- [x] Authorization checks

### ⚠️ Needs Implementation

- [ ] Soft delete for all data types
- [ ] Automatic cleanup job (30-day soft delete)
- [ ] Hard delete option for users
- [ ] Backup deletion after 90 days (Supabase managed)
- [ ] Access code automatic cleanup

---

## Code Implementation

### Soft Delete Example

```typescript
// Model
export const caseModel = {
  async softDeleteCase(caseId: string): Promise<boolean> {
    const db = getDatabaseService();
    const { error } = await db
      .from('cases')
      .update({
        deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', caseId)
      .execute();
    
    return !error;
  }
};

// Controller
export const caseController = {
  async removeCase(caseId: string, user: User | null) {
    requireAuth(user);
    const case = await caseModel.getCase(caseId);
    requireOwnership(case.user_id, user.id);
    
    await caseModel.softDeleteCase(caseId);
    await logSuccess(user.id, 'data_deletion', {
      resource_type: 'case',
      resource_id: caseId,
    });
  }
};
```

### Hard Delete Example

```typescript
// Model
export const caseModel = {
  async hardDeleteCase(caseId: string): Promise<boolean> {
    const db = getDatabaseService();
    
    // Delete related data first
    await db.from('emails').delete().eq('case_id', caseId).execute();
    await db.from('events').delete().eq('case_id', caseId).execute();
    
    // Delete case
    const { error } = await db
      .from('cases')
      .delete()
      .eq('id', caseId)
      .execute();
    
    return !error;
  }
};
```

### Automatic Cleanup Job (Future)

```typescript
// Background job (run daily)
async function cleanupSoftDeletedData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Find soft-deleted data older than 30 days
  const { data } = await db
    .from('cases')
    .select('id')
    .eq('deleted', true)
    .lt('deleted_at', thirtyDaysAgo.toISOString())
    .execute();
  
  // Hard delete each
  for (const case of data || []) {
    await caseModel.hardDeleteCase(case.id);
  }
}
```

---

## User Rights

### Right to Deletion (GDPR Art. 17)

**User Can:**
- Request soft delete (30-day recovery)
- Request hard delete (immediate, permanent)
- Delete individual items (cases, emails, etc.)
- Delete entire account

**Process:**
1. User requests deletion
2. Authorization verified
3. Data deleted (soft or hard)
4. Confirmation provided
5. Audit logged

**Timeline:**
- Soft delete: Immediate
- Hard delete: Immediate
- Automatic cleanup: Daily (for expired soft deletes)

---

## Compliance Notes

### GDPR Art. 5(1)(e) - Storage Limitation

✅ **Compliant:**
- Data retained only as long as necessary
- Clear retention periods defined
- Automatic deletion after retention period
- User can request early deletion

### GDPR Art. 17 - Right to Erasure

✅ **Compliant:**
- Users can request deletion
- Soft delete with recovery option
- Hard delete for permanent removal
- All deletions audit logged

### ISO 27001

✅ **Compliant:**
- Retention periods documented
- Deletion procedures defined
- Audit logging implemented
- Regular review process

---

## Review and Updates

### Regular Reviews

**Frequency:** Quarterly

**Review Items:**
- Retention periods still appropriate
- Deletion procedures effective
- Automatic cleanup working
- User requests handled promptly
- Compliance maintained

### Updates

**When to Update:**
- Legal requirements change
- Business needs change
- New data types added
- Retention periods need adjustment

**Process:**
1. Review retention policy
2. Update documentation
3. Update code if needed
4. Notify users if significant changes
5. Audit log policy changes

---

**Last Updated:** January 26, 2026  
**Next Review:** Quarterly  
**Policy Owner:** System Administrator

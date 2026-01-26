# Legal Compliance Checklist

## Overview

This document tracks legal compliance requirements for GDPR and general data protection.

---

## Privacy Policy

### ⚠️ Status: **REQUIRED - NOT YET CREATED**

### Requirements

**Must Include:**
- [ ] Data controller information
- [ ] Data processor information (Supabase)
- [ ] Types of personal data collected
- [ ] Purpose of data processing
- [ ] Legal basis for processing
- [ ] Data retention periods
- [ ] Data subject rights
- [ ] Contact information for data protection
- [ ] Cookie policy (if applicable)
- [ ] Third-party services (Supabase)

### Template Sections

```markdown
# Privacy Policy

## 1. Data Controller
[Your Company Name]
[Address]
[Contact Email]

## 2. Data Processor
Supabase Inc.
[Supabase Address]
[Supabase DPA Link]

## 3. Personal Data Collected
- Email addresses
- Names (first, last)
- Case information
- Email content
- Documents
- [List all data types]

## 4. Purpose of Processing
- User account management
- Service provision
- Case management
- [List all purposes]

## 5. Legal Basis
- Contract (user account)
- Legitimate interest (service provision)
- [List all legal bases]

## 6. Data Retention
- Active data: While account active
- Deleted data: 30 days after deletion
- Audit logs: 7 years
- [List all retention periods]

## 7. Data Subject Rights
- Right to access (Art. 15)
- Right to rectification (Art. 16)
- Right to erasure (Art. 17)
- Right to data portability (Art. 20)
- Right to object (Art. 21)
- [Link to implementation]

## 8. Data Sharing
- Supabase (data processor)
- No other third parties
- [List all data sharing]

## 9. Contact
For data protection inquiries:
[Email]
[Address]
```

### Action Items

- [ ] Create privacy policy document
- [ ] Review with legal counsel
- [ ] Publish on website/app
- [ ] Link from app footer
- [ ] Update when data processing changes
- [ ] Review annually

**Deadline:** Before production launch

---

## Data Processing Agreement (DPA) with Supabase

### ⚠️ Status: **REQUIRED - NOT YET SIGNED**

### Requirements

**Supabase DPA:**
- [ ] Request DPA from Supabase
- [ ] Review DPA terms
- [ ] Sign DPA
- [ ] Store signed DPA
- [ ] Document DPA status

### How to Request

1. Contact Supabase support
2. Request Data Processing Agreement
3. Review terms (especially data location, sub-processors)
4. Sign and return
5. Keep copy on file

### Key Points to Verify

- [ ] Data location (EU/US preference)
- [ ] Sub-processor list
- [ ] Security measures
- [ ] Data breach notification
- [ ] Data deletion procedures
- [ ] Audit rights

**Deadline:** Before processing personal data in production

---

## Data Retention Rules

### ✅ Status: **DEFINED - DOCUMENTED**

### Retention Periods

| Data Type | Retention Period | Legal Basis |
|-----------|-----------------|-------------|
| **Active User Data** | While account active | Contract |
| **Deleted User Data** | 30 days (soft delete) | Legitimate interest (recovery) |
| **Hard Deleted Data** | Immediately removed | User request (GDPR Art. 17) |
| **Audit Logs** | 7 years | Legal obligation (compliance) |
| **Backups** | 90 days | Legitimate interest (disaster recovery) |
| **Case Access Codes** | 30 days or until used | Legitimate interest |

### Implementation

**Soft Delete:**
- Data marked as deleted
- Retained for 30 days
- User can recover within 30 days
- Automatically hard-deleted after 30 days

**Hard Delete:**
- Immediate permanent removal
- User-initiated (GDPR Art. 17)
- All related data deleted
- Audit logged

**Audit Logs:**
- Append-only
- Never deleted (compliance requirement)
- 7-year retention
- Archived after 1 year (future enhancement)

### Action Items

- [ ] Implement soft delete for all user data
- [ ] Implement hard delete option
- [ ] Configure automatic cleanup (30-day soft delete)
- [ ] Document retention procedures
- [ ] Test deletion processes

**Status:** Partially implemented (needs soft delete enhancement)

---

## Terms of Service

### ⚠️ Status: **RECOMMENDED - NOT YET CREATED**

### Requirements

**Should Include:**
- [ ] Service description
- [ ] User obligations
- [ ] Service limitations
- [ ] Liability limitations
- [ ] Termination clauses
- [ ] Data processing consent
- [ ] Acceptable use policy

### Action Items

- [ ] Create terms of service
- [ ] Review with legal counsel
- [ ] Publish on website/app
- [ ] Require acceptance on signup
- [ ] Update when service changes

**Deadline:** Before production launch

---

## Cookie Policy

### ⚠️ Status: **REQUIRED IF USING COOKIES**

### Current Cookie Usage

**Supabase Auth:**
- Session cookies (required for authentication)
- Secure, HttpOnly, SameSite

**Analytics:**
- None currently
- If added: Require consent

### Action Items

- [ ] Audit cookie usage
- [ ] Create cookie policy (if needed)
- [ ] Implement cookie consent (if using non-essential cookies)
- [ ] Publish cookie policy

**Deadline:** Before production launch (if cookies used)

---

## Data Breach Notification Plan

### ⚠️ Status: **REQUIRED - NOT YET CREATED**

### Requirements

**GDPR Art. 33 (72-hour notification):**
- [ ] Define breach detection procedures
- [ ] Document notification process
- [ ] Identify notification contacts
- [ ] Create breach notification template
- [ ] Test breach response (annually)

### Notification Timeline

1. **Detection** (Immediate)
   - Identify breach
   - Contain breach
   - Assess impact

2. **Assessment** (Within 24 hours)
   - Determine if notification required
   - Assess data subjects affected
   - Document breach details

3. **Supervisory Authority** (Within 72 hours)
   - Notify relevant DPA
   - Provide breach details
   - Document notification

4. **Data Subjects** (Without undue delay)
   - If high risk to rights
   - Clear communication
   - Remediation steps

### Action Items

- [ ] Create breach notification plan
- [ ] Identify supervisory authority
- [ ] Create notification templates
- [ ] Assign breach response team
- [ ] Test breach response (annually)

**Deadline:** Before production launch

---

## Records of Processing Activities (ROPA)

### ✅ Status: **DOCUMENTED**

### Documentation

**Created Documents:**
- [x] Data Flow Diagram (`docs/DATA_FLOW_DIAGRAM.md`)
- [x] Data Inventory (`docs/DATA_INVENTORY.md`)
- [x] Access Control (`docs/ACCESS_CONTROL.md`)

**Action Items:**
- [ ] Review ROPA quarterly
- [ ] Update when processing changes
- [ ] Maintain accuracy

**Review:** Quarterly

---

## Data Subject Rights Implementation

### ✅ Status: **IMPLEMENTED**

### Rights and Implementation

| Right | Article | Implementation | Status |
|-------|---------|----------------|--------|
| Right to Access | Art. 15 | `dataController.exportUserData()` | ✅ |
| Right to Rectification | Art. 16 | Update endpoints | ✅ |
| Right to Erasure | Art. 17 | `dataController.deleteUserData()` | ✅ |
| Right to Portability | Art. 20 | Export endpoint | ✅ |
| Right to Object | Art. 21 | Account deletion | ✅ |

### Action Items

- [x] Implement all data subject rights
- [ ] Test all rights implementations
- [ ] Document user-facing process
- [ ] Create user guide

**Status:** Implemented, needs testing

---

## Compliance Checklist

### GDPR Compliance

- [x] Data inventory documented
- [x] Data flow documented
- [x] Legal basis identified
- [x] Retention periods defined
- [x] Data subject rights implemented
- [x] Audit logging implemented
- [ ] DPA with Supabase signed
- [ ] Privacy policy published
- [ ] Terms of service created
- [ ] Breach notification plan created

### ISO 27001 Compliance

- [x] Security policies documented
- [x] Access control documented
- [x] Audit logging implemented
- [x] Backup procedures documented
- [ ] Security policies formalized
- [ ] Regular security audits
- [ ] Incident response plan

---

## Action Items Summary

### Critical (Before Production)

1. **Privacy Policy**
   - Create and publish
   - Review with legal counsel

2. **DPA with Supabase**
   - Request and sign
   - Document status

3. **Data Retention Rules**
   - Implement soft delete
   - Configure automatic cleanup

4. **Breach Notification Plan**
   - Create plan
   - Test procedures

### Important (Before Production)

5. **Terms of Service**
   - Create and publish
   - Require acceptance

6. **Cookie Policy**
   - Audit usage
   - Create if needed

### Ongoing

7. **Regular Reviews**
   - Quarterly compliance review
   - Annual legal review
   - Update documentation as needed

---

**Last Updated:** January 26, 2026  
**Next Review:** Before production launch, then quarterly

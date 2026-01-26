# Audit Logging Setup Guide

## Overview

The audit logging system provides compliance-ready logging for ISO 27001 and GDPR requirements. All sensitive operations are automatically logged.

## Database Setup

### Create Audit Logs Table

Run this SQL in your Supabase SQL editor:

```sql
-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_id TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert audit logs (via service role)
-- Note: This requires service role key, not anon key
-- For now, allow authenticated users to insert (will be restricted later)
CREATE POLICY "Authenticated users can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

## Usage in Controllers

### Example: Logging Data Creation

```typescript
import { logSuccess, logFailure, getRequestContext } from '@/backend/audit';
import { requireAuth } from '@/backend/auth';

export const caseController = {
  async createNewCase(caseData: CreateCaseInput, user: User | null) {
    requireAuth(user);
    
    const context = getRequestContext();
    
    try {
      const case = await caseModel.createCase(caseData);
      
      // Log successful creation
      await logSuccess(user.id, 'data_create', {
        resource_type: 'case',
        resource_id: case.id,
        ...context,
      });
      
      return case;
    } catch (error) {
      // Log failure
      await logFailure(
        user.id,
        'data_create',
        error instanceof Error ? error.message : 'Unknown error',
        {
          resource_type: 'case',
          ...context,
        }
      );
      throw error;
    }
  }
};
```

### Example: Logging Data Deletion (GDPR)

```typescript
import { logSuccess, logFailure } from '@/backend/audit';
import { requireAuth, requireOwnership } from '@/backend/auth';

export const caseController = {
  async removeCase(caseId: string, user: User | null) {
    requireAuth(user);
    
    // Get case to verify ownership
    const case = await caseModel.getCase(caseId);
    requireOwnership(case.user_id, user.id);
    
    try {
      await caseModel.deleteCase(caseId);
      
      // Log deletion (GDPR requirement)
      await logSuccess(user.id, 'data_deletion', {
        resource_type: 'case',
        resource_id: caseId,
      });
      
      return true;
    } catch (error) {
      await logFailure(
        user.id,
        'data_deletion',
        error instanceof Error ? error.message : 'Unknown error',
        {
          resource_type: 'case',
          resource_id: caseId,
        }
      );
      throw error;
    }
  }
};
```

### Example: Logging Data Export (GDPR Art. 20)

```typescript
import { logSuccess, logFailure } from '@/backend/audit';

export const dataController = {
  async exportUserData(userId: string, user: User | null) {
    requireAuth(user);
    requireOwnership(userId, user.id);
    
    try {
      const data = await exportModel.exportAllUserData(userId);
      
      // Log data export (GDPR Art. 20 requirement)
      await logSuccess(user.id, 'data_export', {
        resource_type: 'user',
        resource_id: userId,
      });
      
      return data;
    } catch (error) {
      await logFailure(
        user.id,
        'data_export',
        error instanceof Error ? error.message : 'Unknown error',
        {
          resource_type: 'user',
          resource_id: userId,
        }
      );
      throw error;
    }
  }
};
```

## Required Logging Points

According to `.cursorrules`, you MUST log:

1. **Login / logout** - In `authController`
2. **Data create / update / delete** - In all data controllers
3. **Permission changes** - In authorization controllers
4. **File upload / download** - In `documentController` and `emailController`
5. **Data export / deletion (GDPR)** - In data export/deletion endpoints

## PII Protection

The audit logger automatically sanitizes metadata to remove PII:

- Email addresses → `[REDACTED]`
- Passwords → `[REDACTED]`
- Names → `[REDACTED]`
- Phone numbers → `[REDACTED]`
- Addresses → `[REDACTED]`

**Never log PII directly in metadata.**

## Querying Audit Logs

```typescript
import { getDatabaseService } from '@/backend/services';

// Get user's audit logs
const db = getDatabaseService();
const { data } = await db
  .from('audit_logs')
  .select('*')
  .eq('user_id', userId)
  .order('timestamp', { ascending: false })
  .limit(100)
  .execute();
```

## Compliance Notes

- **ISO 27001**: Audit logs provide evidence of security controls
- **GDPR Art. 20**: Data export must be logged
- **GDPR Art. 17**: Data deletion must be logged
- **Append-only**: Logs cannot be modified or deleted
- **Retention**: Consider implementing log retention policies

---

**Last Updated:** January 26, 2026

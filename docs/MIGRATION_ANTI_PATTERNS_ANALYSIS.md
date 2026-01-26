# Migration Anti-Patterns Analysis

## Current Issues Found

### ❌ 1. Hard-code Supabase client everywhere
**Status:** **CRITICAL ISSUE**

**Problem:**
- The `supabase` client is directly imported in 20+ files across the codebase
- Files affected:
  - All models (`caseModel.ts`, `emailModel.ts`, `eventModel.ts`, `documentModel.ts`, `profileModel.ts`, `contactModel.ts`, `caseAccessModel.ts`)
  - All controllers (`authController.ts`, `eventController.ts`, `emailController.ts`, `documentController.ts`)
  - Contexts (`AuthContext.tsx`)
  - Pages (`AuthCallback.tsx`)

**Impact:**
- Makes migration to another backend nearly impossible
- Tight coupling to Supabase SDK
- Difficult to test (can't easily mock)
- Can't swap implementations

**Example:**
```typescript
// ❌ BAD - Direct import everywhere
import { supabase } from '@/integrations/supabase/client';
const { data } = await supabase.from('cases').select('*');
```

---

### ✅ 2. Build business logic inside RLS
**Status:** **GOOD** ✅

**Analysis:**
- No SQL migration files found
- Business logic is properly handled in application layer (models/controllers)
- User filtering is done in code (`eq('user_id', user.user.id)`)
- RLS policies (if any) are likely simple access control, not business logic

**Recommendation:**
- Keep business logic in application code
- Use RLS only for basic access control (user can only see their own data)

---

### ✅ 3. Depend on Supabase Realtime deeply
**Status:** **GOOD** ✅

**Analysis:**
- Only using `supabase.auth.onAuthStateChange()` for auth state management
- No Realtime subscriptions found (`channel()`, `subscribe()`, etc.)
- Auth state listener is acceptable and has a fallback mechanism

**Recommendation:**
- Continue avoiding Realtime subscriptions
- If real-time features are needed, use polling or WebSockets with abstraction

---

### ⚠️ 4. Store auth assumptions in frontend
**Status:** **PARTIAL ISSUE**

**Problem:**
- `AuthContext.tsx` directly uses `supabase.auth.signInWithOAuth()` (line 200)
- Auth state stored in React context (acceptable, but should be abstracted)
- Direct Supabase auth calls in context

**Impact:**
- Frontend knows too much about Supabase auth implementation
- Hard to swap auth providers

**Example:**
```typescript
// ❌ BAD - Direct Supabase auth in context
const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: `${window.location.origin}/auth/callback` }
});
```

---

### ❌ 5. Use Supabase-only features without fallback
**Status:** **CRITICAL ISSUE**

**Problem:**
- Direct use of `supabase.storage` (documentModel.ts, emailModel.ts)
- Direct use of `supabase.auth` throughout
- Direct use of `.from()` query builder everywhere
- No abstraction layer
- No fallback mechanisms

**Impact:**
- Can't migrate to other storage solutions (S3, Cloudflare R2, etc.)
- Can't swap database (PostgreSQL with different client, etc.)
- No graceful degradation if Supabase is down

**Examples:**
```typescript
// ❌ BAD - Direct Supabase Storage
const { data } = await supabase.storage
  .from(bucketName)
  .upload(fileName, file);

// ❌ BAD - Direct query builder
const { data } = await supabase
  .from('cases')
  .select('*')
  .eq('user_id', user.user.id);
```

---

## Summary

| Anti-Pattern | Status | Severity | Files Affected |
|--------------|--------|----------|----------------|
| Hard-code Supabase client | ❌ Found | Critical | 20+ files |
| Business logic in RLS | ✅ Good | None | 0 |
| Deep Realtime dependency | ✅ Good | None | 0 |
| Auth assumptions in frontend | ⚠️ Partial | Medium | 1 file |
| Supabase-only features | ❌ Found | Critical | 10+ files |

---

## Recommended Fixes

### Priority 1: Create Abstraction Layers

1. **Database Abstraction Layer**
   - Create `src/backend/services/database.ts` with generic interface
   - Implement Supabase adapter
   - Replace all direct `supabase.from()` calls

2. **Storage Abstraction Layer**
   - Create `src/backend/services/storage.ts` with generic interface
   - Implement Supabase Storage adapter
   - Replace all direct `supabase.storage` calls

3. **Auth Abstraction Layer**
   - Extend `authController` to handle all auth operations
   - Remove direct `supabase.auth` calls from contexts
   - Create generic auth interface

### Priority 2: Dependency Injection

1. **Service Injection**
   - Pass database/storage services as parameters
   - Use dependency injection pattern
   - Enable easy swapping of implementations

2. **Client Factory**
   - Create factory pattern for client creation
   - Support multiple backend providers
   - Environment-based configuration

### Priority 3: Fallback Mechanisms

1. **Error Handling**
   - Add retry logic
   - Graceful degradation
   - Offline support

2. **Feature Detection**
   - Check if features are available
   - Provide fallbacks for missing features
   - Progressive enhancement

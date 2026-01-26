# Migration Guide: Removing Supabase Anti-Patterns

This guide documents the changes made to address migration anti-patterns and how to complete the migration.

## ✅ Completed Changes

### 1. Created Abstraction Layers

**Database Abstraction** (`src/backend/services/database.types.ts` & `database.supabase.ts`)
- Created `IDatabaseService` interface
- Implemented `SupabaseDatabaseService` adapter
- Query builder pattern for type-safe database operations

**Storage Abstraction** (`src/backend/services/storage.types.ts` & `storage.supabase.ts`)
- Created `IStorageService` interface  
- Implemented `SupabaseStorageService` adapter
- Supports upload, download, list, delete, move, copy operations

**Auth Abstraction** (`src/backend/services/auth.types.ts` & `auth.supabase.ts`)
- Created `IAuthService` interface
- Implemented `SupabaseAuthService` adapter
- Handles all auth operations (login, signup, OAuth, session management)

**Service Provider** (`src/backend/services/index.ts`)
- Centralized service factory
- Dependency injection pattern
- Easy to swap implementations for testing or migration

### 2. Refactored Auth Layer

- ✅ `authController.ts` - Now uses `IAuthService` abstraction
- ✅ `AuthContext.tsx` - Removed direct `supabase.auth` calls
- ✅ `AuthCallback.tsx` - Uses `authController` instead of direct Supabase

### 3. Refactored Storage Layer

- ✅ `documentModel.ts` - Now uses `IStorageService` abstraction

## 🔄 Remaining Work

### Models That Need Refactoring

The following models still use direct Supabase client and should be migrated:

1. **caseModel.ts** - See `caseModel.refactored.example.ts` for pattern
2. **emailModel.ts** - Needs both database and storage abstraction
3. **eventModel.ts** - Needs database abstraction
4. **profileModel.ts** - Needs database abstraction
5. **contactModel.ts** - Needs database abstraction
6. **caseAccessModel.ts** - Needs database abstraction

### Migration Pattern

For each model, follow this pattern:

**Before:**
```typescript
import { supabase } from '@/integrations/supabase/client';

export const myModel = {
  async getItems() {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('user_id', user.user.id);
    return data || [];
  }
};
```

**After:**
```typescript
import { getDatabaseService, getAuthService } from '../services';

export const myModel = {
  async getItems() {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return [];
    
    const db = getDatabaseService();
    const { data, error } = await db
      .from<ItemType>('table')
      .select('*')
      .eq('user_id', user.id)
      .execute();
    
    if (error) {
      console.error('Error:', error);
      return [];
    }
    
    return data || [];
  }
};
```

### Storage Migration Pattern

**Before:**
```typescript
const { data, error } = await supabase.storage
  .from(bucket)
  .upload(path, file);
```

**After:**
```typescript
const storageService = getStorageService();
const { data, error } = await storageService.upload(bucket, path, file);
```

## 🧪 Testing

After refactoring each model:

1. Test all CRUD operations
2. Verify error handling
3. Check that user filtering still works
4. Test with different user sessions

## 🚀 Benefits

Once migration is complete:

1. **Easy Backend Migration**: Can swap Supabase for any other backend
2. **Better Testing**: Can inject mock services for unit tests
3. **Type Safety**: Interfaces ensure consistent API
4. **Maintainability**: Clear separation of concerns
5. **Flexibility**: Can use multiple backends simultaneously

## 📝 Next Steps

1. Refactor remaining models one at a time
2. Test thoroughly after each refactor
3. Update any controllers that directly use Supabase
4. Consider adding fallback mechanisms for critical operations
5. Document any Supabase-specific features that need special handling

## ⚠️ Important Notes

- The Supabase client is still used internally by the adapters
- This is intentional - the abstraction layer hides implementation details
- To migrate to a different backend, create new adapter implementations
- Keep the abstraction interfaces stable - don't add backend-specific methods

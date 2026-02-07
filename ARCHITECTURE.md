# Architecture Overview

## ✅ Model-View-Controller (MVC) Architecture

Your codebase follows a **clean MVC architecture** with clear separation of concerns.

---

## 📁 Architecture Layers

### 1. **Models** (`src/backend/models/`)

**Responsibility:** Data access and business logic

- Handle all database operations
- Use service abstraction layer (database, storage, auth)
- Contain business rules and data transformations
- Examples:
  - `caseModel.ts` - Case data operations
  - `emailModel.ts` - Email data operations
  - `eventModel.ts` - Event data operations
  - `profileModel.ts` - Profile data operations
  - `contactModel.ts` - Contact data operations
  - `documentModel.ts` - Document data operations
  - `caseAccessModel.ts` - Case access code operations

**Example:**

```typescript
// src/backend/models/caseModel.ts
export const caseModel = {
  async getCases(): Promise<Case[]> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    // ... database operations
  },
};
```

---

### 2. **Controllers** (`src/backend/controllers/`)

**Responsibility:** Request handling and orchestration

- Act as intermediaries between Views and Models
- Handle request/response logic
- Coordinate multiple model calls
- Transform data for views
- Examples:
  - `caseController.ts` - Case operations
  - `emailController.ts` - Email operations
  - `eventController.ts` - Event operations
  - `authController.ts` - Authentication operations
  - `documentController.ts` - Document operations
  - `contactController.ts` - Contact operations
  - `caseAccessController.ts` - Case access operations

**Example:**

```typescript
// src/backend/controllers/caseController.ts
export const caseController = {
  async fetchAllCases() {
    return await caseModel.getCases();
  },
  async createNewCase(caseData: CreateCaseInput) {
    return await caseModel.createCase(caseData);
  },
};
```

---

### 3. **Views** (`src/pages/` + `src/components/`)

**Responsibility:** User interface and presentation

- React components that render UI
- Call controllers (never models directly)
- Handle user interactions
- Display data from controllers

**Pages** (`src/pages/`):

- `Inbox.tsx` - Email inbox
- `Contacts.tsx` - Contacts page
- `Calendar.tsx` - Calendar view
- `Login.tsx` - Login page
- etc.

**Components** (`src/components/`):

- Reusable UI components
- Feature-specific components
- UI library components (`ui/` folder)

**Example:**

```typescript
// src/pages/Dashboard.tsx
import { caseController } from "@/backend/controllers/caseController";

const Dashboard = () => {
  useEffect(() => {
    const fetchCases = async () => {
      const cases = await caseController.fetchAllCases();
      setCases(cases);
    };
    fetchCases();
  }, []);
  // ... render UI
};
```

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────┐
│           VIEW LAYER                    │
│  (Pages & Components - React)          │
│                                         │
│  - User interactions                   │
│  - UI rendering                        │
│  - Calls controllers                   │
└──────────────┬──────────────────────────┘
               │
               │ Calls
               ▼
┌─────────────────────────────────────────┐
│        CONTROLLER LAYER                 │
│  (Business Logic Orchestration)         │
│                                         │
│  - Request handling                    │
│  - Data transformation                 │
│  - Coordinates models                  │
│  - Calls models                        │
└──────────────┬──────────────────────────┘
               │
               │ Calls
               ▼
┌─────────────────────────────────────────┐
│          MODEL LAYER                    │
│  (Data Access & Business Rules)         │
│                                         │
│  - Database operations                 │
│  - Business logic                      │
│  - Uses service abstraction            │
└──────────────┬──────────────────────────┘
               │
               │ Uses
               ▼
┌─────────────────────────────────────────┐
│      SERVICE ABSTRACTION LAYER          │
│  (Database, Storage, Auth Interfaces)  │
│                                         │
│  - IDatabaseService                    │
│  - IStorageService                     │
│  - IAuthService                        │
└──────────────┬──────────────────────────┘
               │
               │ Implemented by
               ▼
┌─────────────────────────────────────────┐
│      SUPABASE ADAPTERS                  │
│  (Supabase-specific implementations)    │
└─────────────────────────────────────────┘
```

---

## 📊 Architecture Compliance

| MVC Component   | Location                         | Status      | Notes               |
| --------------- | -------------------------------- | ----------- | ------------------- |
| **Models**      | `src/backend/models/`            | ✅ Complete | All data operations |
| **Views**       | `src/pages/` + `src/components/` | ✅ Complete | React components    |
| **Controllers** | `src/backend/controllers/`       | ✅ Complete | Business logic      |

---

## ✅ MVC Principles Followed

### 1. **Separation of Concerns**

- ✅ Models handle data
- ✅ Controllers handle business logic
- ✅ Views handle presentation

### 2. **Single Responsibility**

- ✅ Each model handles one domain (cases, emails, etc.)
- ✅ Each controller handles one domain's operations
- ✅ Components are focused and reusable

### 3. **Dependency Direction**

- ✅ Views → Controllers → Models → Services
- ✅ No circular dependencies
- ✅ Clear data flow

### 4. **Abstraction**

- ✅ Models use service interfaces (not direct Supabase)
- ✅ Controllers don't know about database details
- ✅ Views don't know about data sources

---

## 🎯 Additional Architecture Patterns

### Service Layer Pattern

Located in `src/backend/services/`:

- Provides abstraction over external services
- Allows easy backend migration
- Implements dependency injection

### Context Pattern (React)

Located in `src/contexts/`:

- `AuthContext.tsx` - Global auth state
- Provides shared state across components

### Component Composition

- Reusable UI components in `src/components/ui/`
- Feature components in `src/components/`
- Page-level components in `src/pages/`

---

## 📝 Best Practices Followed

1. ✅ **Views never call models directly** - Always go through controllers
2. ✅ **Controllers orchestrate** - Coordinate multiple model calls
3. ✅ **Models are pure** - Focus on data operations
4. ✅ **Service abstraction** - Models use interfaces, not implementations
5. ✅ **Type safety** - TypeScript throughout
6. ✅ **Clear naming** - Consistent naming conventions

---

## 🔍 Example: Complete Flow

### User Creates a Case

1. **View** (`NewCaseModal.tsx`):

   ```typescript
   const handleSubmit = async () => {
     await caseController.createNewCase(formData);
   };
   ```

2. **Controller** (`caseController.ts`):

   ```typescript
   async createNewCase(caseData: CreateCaseInput) {
     return await caseModel.createCase(caseData);
   }
   ```

3. **Model** (`caseModel.ts`):

   ```typescript
   async createCase(caseData: CreateCaseInput): Promise<Case | null> {
     const db = getDatabaseService();
     const { data, error } = await db
       .from<Case>('cases')
       .insert(caseData)
       .select()
       .single();
     return data;
   }
   ```

4. **Service** (`database.supabase.ts`):
   ```typescript
   // Handles actual Supabase call
   ```

---

## 🚀 Benefits of This Architecture

1. **Maintainability** - Clear separation makes code easy to understand
2. **Testability** - Each layer can be tested independently
3. **Scalability** - Easy to add new features following the pattern
4. **Flexibility** - Can swap backends without changing business logic
5. **Type Safety** - TypeScript ensures consistency across layers

---

## 📚 Related Documentation

- `MIGRATION_COMPLETE.md` - Service abstraction details
- `MIGRATION_GUIDE.md` - Migration patterns
- `ANTI_PATTERNS_FIXED.md` - Architecture improvements

---

**Architecture Type:** Model-View-Controller (MVC)  
**Status:** ✅ Well-structured and compliant  
**Compliance:** ✅ 100% - All views use controllers, no direct model calls  
**Last Updated:** January 26, 2026

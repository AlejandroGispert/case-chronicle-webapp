# Case Chronicles - Project Requirements

This document contains the core requirements and standards for the Case Chronicles project. This is a reference document that should be consulted when making architectural decisions or adding new features.

## Table of Contents
1. [Architecture Requirements](#architecture-requirements)
2. [Code Standards](#code-standards)
3. [Service Abstraction Requirements](#service-abstraction-requirements)
4. [MVC Pattern Requirements](#mvc-pattern-requirements)
5. [Security Requirements](#security-requirements)
6. [Performance Requirements](#performance-requirements)
7. [Documentation Requirements](#documentation-requirements)

---

## Architecture Requirements

### MVC Pattern (Mandatory)
- **Models** (`src/backend/models/`) handle data access
- **Controllers** (`src/backend/controllers/`) handle business logic
- **Views** (`src/pages/` + `src/components/`) handle UI presentation
- **Views MUST call controllers, NEVER models directly**

### Service Abstraction Layer (Mandatory)
- All database operations use `getDatabaseService()`
- All storage operations use `getStorageService()`
- All auth operations use `getAuthService()`
- **NEVER** import Supabase client directly (except in `services/index.ts`)

---

## Code Standards

### TypeScript
- All code must be TypeScript
- Proper typing for all functions, parameters, and return values
- Use types from `src/backend/models/types.ts`
- Generic types for database queries: `db.from<MyType>('table')`

### Error Handling
- Always use try/catch for async operations
- Return empty arrays/null on errors, don't throw
- Log errors with `console.error`
- Provide user-friendly error messages via toasts

### Code Organization
- Follow existing file structure
- One model per domain (cases, emails, events, etc.)
- One controller per domain
- Reusable components in `src/components/`
- Page-level components in `src/pages/`

---

## Service Abstraction Requirements

### Database Operations
```typescript
// ✅ REQUIRED PATTERN
import { getDatabaseService, getAuthService } from '../services';

const db = getDatabaseService();
const authService = getAuthService();
const { user } = await authService.getUser();
const { data, error } = await db.from<Type>('table').select('*').execute();
```

### Storage Operations
```typescript
// ✅ REQUIRED PATTERN
import { getStorageService } from '../services';

const storage = getStorageService();
const { data, error } = await storage.upload(bucket, path, file);
```

### Authentication Operations
```typescript
// ✅ REQUIRED PATTERN
import { authController } from '@/backend/controllers/authController';

// In components, use authController or useAuth() hook
```

---

## MVC Pattern Requirements

### Data Flow (Mandatory)
```
View → Controller → Model → Service → Supabase Adapter
```

### View Layer Requirements
- React components only
- Call controllers, never models
- Use hooks for state management
- Handle loading/error states

### Controller Layer Requirements
- Orchestrate business logic
- Call models, not services directly
- Transform data for views
- Handle request/response logic

### Model Layer Requirements
- Use service abstractions
- Handle data access only
- Business rules and validation
- User filtering (always filter by `user_id`)

---

## Security Requirements

### Authentication
- All routes must be protected (except public routes)
- Use `ProtectedRoute` component for protected pages
- Always verify user authentication in models
- Never trust client-side auth state alone

### Data Access
- Always filter by `user_id` for user-specific data
- Never expose other users' data
- Validate user permissions before operations
- Use service abstractions (not direct DB access)

### File Storage
- Verify user authentication before uploads
- Use proper bucket permissions
- Validate file types and sizes
- Sanitize file names

---

## Performance Requirements

### Database Queries
- Use proper indexing (handled by Supabase)
- Limit query results when appropriate
- Use pagination for large datasets
- Avoid N+1 queries (use joins or batch queries)

### Frontend
- Lazy load components when possible
- Use React.memo for expensive components
- Optimize re-renders
- Handle loading states properly

---

## Documentation Requirements

### Code Comments
- Document complex business logic
- Explain non-obvious code patterns
- Add JSDoc comments for public APIs
- Keep comments up-to-date

### Architecture Documentation
- Update `ARCHITECTURE.md` when architecture changes
- Document new patterns in relevant docs
- Keep migration guides updated

---

## Testing Requirements

### Unit Tests (Future)
- Test models independently
- Test controllers with mocked models
- Test components with mocked controllers
- Use service mocks for testing

### Integration Tests (Future)
- Test full request flows
- Test authentication flows
- Test data persistence
- Test error scenarios

---

## Migration Requirements

### Backend Migration Readiness
- All Supabase code must be abstracted
- Service interfaces must be stable
- No vendor-specific features without abstraction
- Easy to swap implementations

### When Migrating
1. Implement new service adapters
2. Update service factory (`services/index.ts`)
3. No other code changes needed
4. All tests should still pass

---

## UI/UX Requirements

### Component Library
- Use shadcn/ui components from `src/components/ui/`
- Maintain consistent styling
- Follow existing design patterns
- Responsive design for mobile/tablet/desktop

### User Feedback
- Use `useToast()` for notifications
- Show loading states during async operations
- Display clear error messages
- Provide success confirmations

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

---

## Deployment Requirements

### Environment Variables
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key
- Never commit secrets to git

### Build Requirements
- TypeScript compilation must pass
- No linter errors
- All imports must resolve
- Build must succeed

---

## Version Control Requirements

### Git Workflow
- Meaningful commit messages
- Feature branches for new features
- Code review before merging
- Keep commits atomic

### Before Committing
- [ ] No direct Supabase imports (except services)
- [ ] MVC pattern followed
- [ ] Service abstractions used
- [ ] TypeScript types correct
- [ ] Error handling in place
- [ ] User filtering implemented
- [ ] No console.logs (or proper logging)

---

## Future Considerations

### Scalability
- Design for horizontal scaling
- Use connection pooling
- Cache frequently accessed data
- Optimize database queries

### Monitoring
- Add error tracking (Sentry, etc.)
- Log important operations
- Monitor performance metrics
- Track user analytics

### Features
- Real-time updates (via service abstraction)
- Offline support
- Export functionality
- Advanced search/filtering

---

**Last Updated:** January 26, 2026  
**Status:** Active Requirements Document

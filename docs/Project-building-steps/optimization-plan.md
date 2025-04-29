# Optimization Plan

## Authentication Configuration
- [x] Step 1: Create centralized auth configuration
  - **Task**: Create a single source of truth for auth configuration including dev mode flag, endpoints, and environment settings
  - **Files**:
    - `packages/auth-common/src/config.ts`: New file to hold all auth configuration
    - `apps/web/src/middleware.ts`: Update to use centralized config
    - `apps/web/src/hooks/useAuth.ts`: Update to use centralized config
    - `apps/web/src/components/auth/ProtectedRoute.tsx`: Update to use centralized config
  - **Step Dependencies**: None
  - **User Instructions**: None
  - **Note**:
  - After updating main auth consumers (middleware.ts, useAuth.ts, ProtectedRoute.tsx), search the entire codebase for any          remaining direct usage of environment variables or hardcoded URLs related to auth.
  - Refactor them to use auth-common/config.ts instead to avoid inconsistencies.

## Authentication State Management
- [x] Step 2: Improve token storage mechanism
  - **Task**: Refactor token storage to use a more consistent and secure approach
  - **Files**:
    - `packages/api-client/src/utils/token-storage.ts`: Refactor to use a more consistent approach with proper typing
    - `packages/api-client/src/auth/auth-client.ts`: Update to use refactored token storage
  - **Step Dependencies**: Step 1
  - **User Instructions**: After implementation, clear browser localStorage and cookies for testing
  - **Note**:
  - After refactoring token storage, audit the codebase for any manual localStorage/sessionStorage access related to tokens.
  - Replace all manual usages with the centralized token-storage.ts utilities to enforce consistency and security.

- [x] Step 3: Create a global auth context provider
  - **Task**: Create a centralized auth context provider to manage auth state across the application
  - **Files**:
    - `apps/web/src/contexts/auth-context.tsx`: Create new auth context provider
    - `apps/web/src/app/layout.tsx`: Update to use new auth provider
    - `apps/web/src/hooks/useAuth.ts`: Refactor to use new auth context
  - **Step Dependencies**: Step 2
  - **User Instructions**: None
  - **Note**: 
  - After creating the global auth-context.tsx, immediately update all components, hooks, and pages relying on auth (useAuth, auth checks, etc.) to use the new context.
  - Remove any legacy direct localStorage checks for auth state to avoid mismatch bugs.

## Navigation and Redirection
- [x] Step 4: Implement consistent navigation handling
  - **Task**: Create a navigation utility to handle redirects consistently
  - **Files**:
    - `apps/web/src/utils/navigation.ts`: New file with navigation utilities
    - `apps/web/src/app/login/page.tsx`: Update to use navigation utility
    - `apps/web/src/components/auth/ProtectedRoute.tsx`: Update to use navigation utility
    - `apps/web/src/app/dashboard/layout.tsx`: Update to use navigation utility
  - **Step Dependencies**: Step 3
  - **User Instructions**: None
  - **Note**: 
  - After creating navigation.ts, refactor all places where navigation happens (router.push, window.location.href, etc.) to use the new navigation utility for consistent behavior across the app.

## Component Structure
- [x] Step 5: Improve dashboard layout architecture
  - **Task**: Refactor dashboard layout to be more modular and reusable
  - **Files**:
    - `apps/web/src/components/layout/DashboardSidebar.tsx`: Extract sidebar to component
    - `apps/web/src/components/layout/DashboardHeader.tsx`: Extract header to component
    - `apps/web/src/app/dashboard/layout.tsx`: Update to use new components
  - **Step Dependencies**: Step 4
  - **User Instructions**: None
  - **Note**: 
  - After extracting DashboardSidebar and DashboardHeader, review all dashboard pages and sub-pages to ensure they import and use the new layout components instead of repeating old layouts manually.

- [x] Step 6: Create better loading and error states
  - **Task**: Implement consistent loading and error states across the application
  - **Files**:
    - `apps/web/src/components/ui/LoadingIndicator.tsx`: Create reusable loading component
    - `apps/web/src/components/ui/ErrorDisplay.tsx`: Create reusable error component
    - `apps/web/src/app/dashboard/page.tsx`: Update to use new components
    - `apps/web/src/components/auth/ProtectedRoute.tsx`: Update to use new components
  - **Step Dependencies**: Step 5
  - **User Instructions**: None
  - **Note**: 
  - After creating LoadingIndicator and ErrorDisplay, refactor all pages and components with custom loading spinners or ad-hoc error messages to use the new standardized UI components.

## Error Handling
- [x] Step 7: Implement consistent error handling
  - **Task**: Create a centralized error handling approach with proper error boundaries and logging
  - **Files**:
    - `apps/web/src/utils/error-handler.ts`: Create centralized error handling
    - `apps/web/src/components/ErrorBoundary.tsx`: Create error boundary component
    - `packages/api-client/src/auth/auth-client.ts`: Update error handling
    - `apps/web/src/hooks/useAuth.ts`: Update error handling
  - **Step Dependencies**: Step 6
  - **User Instructions**: None
  - **Note**:
  - After creating centralized error handling and ErrorBoundary.tsx, wrap critical pages/components inside the error boundaries.
  - Update all try/catch blocks and API calls to use centralized error utilities for uniform logging and handling.

## Type Safety
- [x] Step 8: Improve TypeScript type safety
  - **Task**: Strengthen type definitions and enforce strict typing throughout the auth flow
  - **Files**:
    - `packages/api-client/src/auth/types.ts`: Enhance type definitions
    - `apps/web/src/hooks/useAuth.ts`: Improve type safety
    - `apps/web/src/components/auth/ProtectedRoute.tsx`: Add proper type guards
  - **Step Dependencies**: Step 7
  - **User Instructions**: None
  - **Note**:
  - After enhancing type definitions, enforce the new types in all files handling auth, tokens, user sessions, etc.
  - Remove any any, loose object typing, or unsafe assumptions related to auth data across the app.

## Development Experience
- [x] Step 9: Add dev mode indicator
  - **Task**: Create a visual indicator when running in development mode
  - **Files**:
    - `apps/web/src/components/DevModeIndicator.tsx`: Create dev mode indicator component
    - `apps/web/src/app/layout.tsx`: Add dev mode indicator to layout
  - **Step Dependencies**: Step 1
  - **User Instructions**: None
  - **Note**:
  - After creating the Dev Mode Indicator, review layouts and ensure it is properly rendered in all relevant layouts during development mode.
  - Optionally hide/remove it for production builds using the centralized config.

## Testing and Verification
- [x] Step 10: Add authentication flow tests
  - **Task**: Create comprehensive tests for the authentication flow
  - **Files**:
    - `apps/web/src/__tests__/auth/auth-flow.test.tsx`: Create auth flow tests
    - `apps/web/src/__tests__/auth/protected-route.test.tsx`: Create protected route tests
  - **Step Dependencies**: All previous steps
  - **User Instructions**: Run tests after implementation
  - **Note**:
  - After writing auth flow tests, run full regression tests across the app to confirm nothing was broken by the auth system refactor.
  - Cover not only the happy path but also failures (invalid tokens, expired sessions, unauthorized redirects).

## Final Review and Documentation
- [x] Step 11: Create auth flow documentation
  - **Task**: Document the authentication flow for developers
  - **Files**:
    - `docs/auth-flow.md`: Create documentation explaining auth flow
    - `packages/auth-common/README.md`: Update with usage instructions
  - **Step Dependencies**: All previous steps
  - **User Instructions**: None
  - **Note**:
  - After documenting the auth flow, review and update README files and onboarding documents to point developers to the new flow.
   -Clearly deprecate the old auth logic to avoid confusion for future contributors.

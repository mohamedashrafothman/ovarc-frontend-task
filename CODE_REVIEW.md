## 1. Project Structure

- The app is bootstrapped with Vite, React, and Tailwind which is a solid base for modern frontend projects. However, the project is currently JavaScript-only.
  In today’s standards, **TypeScript is a must** for ensuring type safety, reducing runtime errors, and improving developer productivity.
- There is no clear separation between domain types, API layer, and UI components. Suggested structure:
    1. `/src/services/api` -> Centralized API wrapper. Each service file (books, authors, stores) exports promise-based functions for its domain.
    2. `/src/providers` -> Context providers (Auth, Theme, etc...).
    3. `/src/components/` -> Shared UI pieces (tables, inputs, inline edit).
    4. `/src/hooks` -> Shared custom hooks. This may include TanStack Query hooks or other shared functionality.
    5. `/src/types` -> Shared domain types.
    6. `/src/styles` -> Global styles, Tailwind overrides, design variables (colors, spacing, typography).
- Some files mix concerns (UI + data fetching in the same component).
  Better to keep fetching logic in separate custom hooks.
- The existing `/src/components/` folder lacks a clear organizational pattern.
  Components of different abstraction levels (form inputs, pages, table logic, wrappers) are mixed together without distinction.
  This makes it harder to identify shared reusable UI elements versus page-specific components.
  **Recommendation:** adopt either:
  - A **compose component structure** (small, focused components combined into larger ones), or
  - A **wrapper/container structure** (separating presentational and stateful logic).

---

## 2. Developer Experience and QC (Quality Control)

- There are no quality control tools integrated to ensure consistency and static code standards. Adding these tools would significantly improve Developer Experience, reduce PR noise, and keep the codebase maintainable.
  Missing elements include:
    1. **TypeScript** → for strict typing across the project.
    2. **Prettier** → consistent code formatting.
    3. **Husky + Lint-Staged** → pre-commit hooks to prevent bad code entering the repo.
    4. **Commitlint** → enforces commit message conventions.
    5. **Git Flow/branching strategy** → standardizing how new features, fixes, and releases are managed.
- Missing `.env` documentation. Variables like `VITE_API_URL` and `VITE_USE_MOCK` should be included in `.env`.

---

## 3. State Management & Data Fetching

- Data is fetched imperatively using `fetch` in components. This makes caching/revalidation difficult.
- Suggest using **TanStack Query (React Query)** for fetching, caching, and invalidation after mutations.
- Authentication/session state is currently unmanaged.
  A global store (**AuthContext, Zustand, Redux, or Jotai**) is needed for consistent access control across the app.

---

## 4. API Layer

The project currently lacks a dedicated API layer, which makes network calls harder to maintain, test, and scale. Recommended improvements:

- Create a centralized API instance using **Axios** instead of raw `fetch`.
  This allows interceptors, centralized error handling, and easier switching between multiple API route URLs based on environment.
- Combine data fetching with **TanStack Query**, and place custom hooks inside `/src/hooks/` for encapsulation and reusability.
- All data fetching is currently centralized in `/src/hooks/useLibraryData.js`.
  This creates tight coupling, makes testing difficult, and risks breaking unrelated modules when modified.
  **Recommendation:** split API calls into domain-specific services and hooks for scalability and maintainability.

---

## 5. UI/UX

- Tables exist but lack sorting, searching, and pagination or virtualization for large lists.
- Inline editing is inconsistent (some pages allow it, some don’t).
  A shared `<InlineEdit>` component would improve consistency.
- Auth state doesn’t restrict UI.
  Buttons like **Delete/Edit** are enabled regardless of user session.
- No clear mention of accessibility or responsiveness.
  Ensure UI components follow **accessibility best practices** and are **mobile-friendly**.

---

## 6. Styles

- Styling is applied across components without a clear organization.
- A dedicated `/src/styles/` folder should be introduced to contain:
  - **Global styles** (index.css, reset.css, Tailwind base layers).
  - **Tailwind overrides** (custom utilities, plugin configs).
  - **Design variables** (colors, spacing, typography, shadows).
  - **Theme management** (light/dark mode, brand themes).
- Co-locating component-specific styles in the same folder as the component is fine (e.g., `Button.jsx` + `Button.module.css`), but global/shared design definitions should stay inside `/src/styles/`.

---

## 7. Utilities

- Utility functions are currently mixed inside UI components, which makes components harder to read, harder to test, and less reusable.
- Create a dedicated `/src/utils/` folder for helper functions that are not tied to UI rendering.
- Examples of what belongs in `/src/utils/`:
  - **Formatting helpers** (dates, currency, text truncation).
  - **Validation functions** (email, phone, ISBN, etc.).
  - **Data transformation** (mapping API responses to domain types).
  - **Local storage/session helpers** (get/set/remove).
- Benefits:
  - Components stay lean and focused on presentation.
  - Utility functions become easily testable with unit tests.
  - Avoids duplication across different parts of the app.

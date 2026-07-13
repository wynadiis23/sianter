**Objective:** Implement a fully accessible, WCAG 2.1 AA compliant, custom Native Accessibility Preferences Panel inside our React + Vite web application. We are completely avoiding automated third-party overlay widgets and instead building native UI state variables injected into the DOM root.

**Core Technical Requirements:**
1. **State Management:** Implement state tracking for:
   - `textSize`: 'normal' | 'large' | 'extra-large'
   - `contrast`: 'normal' | 'high'
   - `dyslexicFont`: boolean
   Persist these configurations across sessions using `localStorage`.

2. **DOM Attributes Injection:** 
   Create a dedicated hook or `useEffect` that updates the `document.documentElement.classList` or maps custom data attributes (e.g., `data-a11y-text`, `data-a11y-contrast`, `data-a11y-dyslexic`) onto the HTML root node whenever the state changes. Clean up old class mappings appropriately before applying updated configurations.

3. **Styling Hooks Setup:**
   - Provide the necessary CSS configurations (global CSS variables or Tailwind CSS custom variant setups) so that these root attributes dynamically scale text fluidly using relative units (`rem`, `em`) and invert/swap theme color tokens for absolute high contrast when active.
   - For `dyslexicFont`, prepare a CSS fallback rule mapping to an accessible font family stack (e.g., OpenDyslexic or heavy-weighted clean sans-serif families).

4. **Component Layout & Semantics:**
   - Build a highly scannable UI module called `AccessibilityPanel`.
   - Ensure explicit semantic correctness: Use container components with valid `role="region"` or `role="dialog"`, use descriptive `aria-label` tags, and make sure button groups use `aria-pressed` state attributes to signal active settings cleanly to screen readers.
   - All interactive configurations must be natively focusable via `Tab` keyboard navigation without requiring custom Javascript key listeners.

5. **Local Dev Auditing Setup:**
   - Install and initialize `@axe-core/react` inside our primary client entry file (`main.tsx` or `index.tsx`). Ensure this package is dynamically imported and conditionally executed *only* when `process.env.NODE_ENV !== 'production'` to guard console behavior on production builds.
   - Add standard configurations for `eslint-plugin-jsx-a11y` in our ESLint setup file if not present.

**Steps to Complete:**
1. Write the state logic, local storage persistence, and DOM injection hook.
2. Build the UI panel component with proper semantic tags and native interactive HTML nodes.
3. Provide the clean CSS/Tailwind configuration blocks needed to map the layout adaptations.
4. Show exactly how to integrate the dynamic dev auditor block inside the entry point file.
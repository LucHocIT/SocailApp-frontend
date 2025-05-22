# CSS Architecture for SocialApp

This document outlines our CSS architecture strategy for SocialApp frontend.

## Overview

We've implemented a hybrid approach using:
1. **Global SCSS architecture** for shared styles and utility classes
2. **CSS Modules** for component-specific styling to avoid conflicts

## Directory Structure

```
src/
├── styles/
│   ├── abstracts/             # Variables, mixins, functions
│   │   ├── _variables.scss    # Color schemes, spacing, typography
│   │   └── _mixins.scss       # Reusable patterns
│   ├── base/                  # Base styles
│   │   ├── _reset.scss        # CSS reset
│   │   ├── _typography.scss   # Text styles
│   │   └── _animations.scss   # Animation keyframes
│   ├── components/            # Global component styles
│   │   ├── _buttons.scss      # Button styles
│   │   ├── _forms.scss        # Form styles
│   │   ├── _cards.scss        # Card component styles
│   │   └── _modals.scss       # Modal styles
│   ├── layout/                # Layout styles
│   │   └── _grid.scss         # Grid system
│   ├── utilities/             # Utility classes
│   │   ├── _spacing.scss      # Margin/padding utilities
│   │   ├── _display.scss      # Display/flex utilities
│   │   └── _shadows.scss      # Shadow utilities
│   └── main.scss              # Main file that imports all styles
└── components/
    ├── ComponentName.jsx      # React component
    └── ComponentName.module.scss # Component-specific styles (CSS Modules)
```

## CSS Modules

We use CSS Modules for component-specific styles. This has several advantages:
- Scopes styles to specific components (no class name conflicts)
- Allows for more maintainable code
- Makes component styling more explicit
- Improves build performance by only loading needed styles

### Example:

```jsx
// Component.jsx
import styles from './Component.module.scss';

const Component = () => (
  <div className={styles.container}>
    <h2 className={styles.title}>Hello World</h2>
  </div>
);
```

```scss
// Component.module.scss
.container {
  padding: 1rem;
}

.title {
  font-size: 1.5rem;
}
```

## Global Styles

Global styles are organized in the `src/styles/` directory and imported in `main.scss`.

### Usage

1. **For component-specific styles**: Use CSS Modules
2. **For global styles**: Use the appropriate file in the styles directory
3. **For theme variables**: Import from abstracts

```scss
// In a .module.scss file
@use '../../styles/abstracts/variables' as *;
@use '../../styles/abstracts/mixins' as *;

.myComponent {
  @include card-base;
  color: $primary-color;
}
```

## Conversion Progress

We've converted these components to use CSS Modules:

1. **Page Components**:
   - `HomePage.module.scss`
   - `ProfilePage.module.scss`
   - `RequestVerificationPage.module.scss`
   
2. **Navigation**:
   - `Navbar.module.scss`
   
3. **Auth Components**:
   - `LoginModal.module.scss`
   - `RegisterModal.module.scss`
   - `ForgotPasswordModal.module.scss`
   
4. **Profile Components**:
   - `ProfileHeader.module.scss`
   - `ProfileEditForm.module.scss`
   - `PasswordChangeForm.module.scss`
   - `FollowersModal.module.scss`
   - `FollowingModal.module.scss`
   - `FollowersList.module.scss`
   - `UserList.module.scss`

## Best Practices

1. **Component-First**: Put component-specific styles in CSS Modules
2. **DRY (Don't Repeat Yourself)**: Use mixins and variables
3. **Minimal Specificity**: Keep selectors as simple as possible
4. **Avoid `!important`**: It makes styles hard to override
5. **Use utility classes** for small, reusable styling needs

## Migration Path

We're gradually migrating from the old SCSS structure to CSS Modules:

1. Create the CSS Module file (e.g., `Component.module.scss`)
2. Import it in your component
3. Replace class names with the imported styles
4. Remove the old SCSS file when all components have been migrated

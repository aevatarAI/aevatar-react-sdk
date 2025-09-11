# Theme Management in AevatarProvider

This document explains how to use the theme functionality and how it connects to CSS variables.

## How It Works

The `AevatarProvider` automatically syncs the React theme state to the CSS `data-theme` attribute on `document.documentElement`. This enables the CSS variables defined in `:root[data-theme="dark"]` and `:root[data-theme="light"]` to work properly.

## Usage

### 1. Basic Provider Setup

```tsx
import { AevatarProvider } from '@aevatar-react-sdk/ui-react';

function App() {
  return (
    <AevatarProvider theme="dark">
      <YourApp />
    </AevatarProvider>
  );
}
```

### 2. Using the useTheme Hook

```tsx
import { useTheme } from '@aevatar-react-sdk/ui-react';

function ThemeToggle() {
  const { theme, toggleTheme, setTheme, isDark, isLight } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Toggle to {isDark ? 'light' : 'dark'}
      </button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
    </div>
  );
}
```

### 3. CSS Variables Usage

Once the theme is set, you can use the CSS variables in your components:

```css
.my-component {
  background-color: var(--sdk-color-bg-primary);
  color: var(--sdk-color-text-primary);
  border: 1px solid var(--sdk-color-border-primary);
}
```

## Theme Synchronization

The provider automatically:

1. **Initializes theme**: Sets `data-theme` attribute on mount
2. **Syncs changes**: Updates `data-theme` whenever theme prop or state changes
3. **CSS variables**: Enables CSS variables based on the current theme

## Available CSS Variables

### Dark Theme (`data-theme="dark"`)
- `--sdk-color-bg-primary: #141415`
- `--sdk-color-text-primary: #fafafa`
- `--sdk-color-border-primary: #3f3f46`
- `--sdk-bg-background: #09090b`
- `--sdk-sidebar-background: #18181b`
- And many more...

### Light Theme (`data-theme="light"`)
- `--sdk-color-bg-primary: #ffffff`
- `--sdk-color-text-primary: #09090b`
- `--sdk-color-border-primary: #e4e4e7`
- `--sdk-bg-background: #ffffff`
- `--sdk-sidebar-background: #fafafa`
- And many more...

## Example Component

```tsx
import { useTheme } from '@aevatar-react-sdk/ui-react';

function ThemedCard() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="themed-card">
      <h2>Theme: {theme}</h2>
      <p>This card automatically adapts to the current theme</p>
      <button onClick={toggleTheme}>Switch Theme</button>
    </div>
  );
}
```

```css
.themed-card {
  background-color: var(--sdk-color-bg-primary);
  color: var(--sdk-color-text-primary);
  border: 1px solid var(--sdk-color-border-primary);
  padding: 1rem;
  border-radius: 0.5rem;
}
```

## Notes

- The theme automatically syncs to CSS `data-theme` attribute
- CSS variables are automatically applied based on the current theme
- No manual DOM manipulation needed
- Works with any CSS-in-JS solution or regular CSS 
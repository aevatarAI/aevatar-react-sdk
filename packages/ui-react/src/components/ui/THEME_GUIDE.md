# Theme System Guide

This guide explains how to use the theme system for black and white mode switching in the Aevatar React SDK.

## Overview

The theme system uses CSS custom properties (variables) that automatically switch between light and dark values based on the `data-theme` attribute on the document root.

## Available CSS Variables

### Background Colors
- `--sdk-color-bg-primary`: Primary background color
- `--sdk-color-bg-secondary`: Secondary background color  
- `--sdk-color-bg-tertiary`: Tertiary background color
- `--sdk-bg-background`: Main background color
- `--sdk-bg-muted`: Muted background color
- `--sdk-bg-accent`: Accent background color

### Text Colors
- `--sdk-color-text-primary`: Primary text color
- `--sdk-color-text-secondary`: Secondary text color
- `--sdk-color-text-tertiary`: Tertiary text color
- `--sdk-muted-foreground`: Muted text color

### Border Colors
- `--sdk-color-border-primary`: Primary border color
- `--sdk-color-border-secondary`: Secondary border color
- `--sdk-color-border-black-light`: Light black border
- `--sdk-color-border-gray-300` to `--sdk-color-border-gray-600`: Gray border variants

### Semantic Colors
- `--sdk-color-success`: Success color (green)
- `--sdk-color-warning`: Warning color (red)
- `--sdk-color-error`: Error color (red)
- `--sdk-color-info`: Info color (blue)
- `--sdk-color-input-node`: Input node color (blue)
- `--sdk-color-output-node`: Output node color (pink)

### Utility Colors
- `--sdk-color-text-primary`: Primary text color (replaces --sdk-color-white)
- `--sdk-bg-background`: Main background color (replaces --sdk-color-black)
- `--sdk-color-gray-light`: Light gray
- `--sdk-color-border-primary`: Deep gray
- `--sdk-color-highlight-blue`: Highlight blue

## Usage in CSS

```css
.my-component {
  background-color: var(--sdk-color-bg-primary);
  color: var(--sdk-color-text-primary);
  border: 1px solid var(--sdk-color-border-primary);
}
```

## Usage in React Components

### Using Tailwind Classes
```tsx
<div className="sdk:bg-[var(--sdk-color-bg-primary)] sdk:text-[var(--sdk-color-text-primary)]">
  Content
</div>
```

### Using Inline Styles
```tsx
<div style={{
  backgroundColor: 'var(--sdk-color-bg-primary)',
  color: 'var(--sdk-color-text-primary)'
}}>
  Content
</div>
```

## Theme Management

### Using the useTheme Hook
```tsx
import { useTheme } from '@aevatar-react-sdk/ui-react';

function MyComponent() {
  const { theme, toggleTheme, setTheme, isDark, isLight } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'light' : 'dark'}
      </button>
    </div>
  );
}
```

### Using the ThemeToggle Component
```tsx
import { ThemeToggle } from '@aevatar-react-sdk/ui-react';

function App() {
  return (
    <div>
      <ThemeToggle />
    </div>
  );
}
```

## SVG Theming

For SVG elements, use the ThemedSVG wrapper component:

```tsx
import { ThemedSVG } from '@aevatar-react-sdk/ui-react';

function MyIcon() {
  return (
    <ThemedSVG theme="primary">
      <svg>
        <path d="..." />
      </svg>
    </ThemedSVG>
  );
}
```

Or apply theme classes directly:
```css
.my-svg {
  fill: var(--sdk-color-text-primary);
}
```

## Best Practices

1. **Always use CSS variables** instead of hardcoded colors
2. **Use semantic color names** (primary, secondary, success, etc.) when possible
3. **Test both themes** to ensure proper contrast and readability
4. **Use the theme toggle** during development to verify theme switching works
5. **Avoid inline styles** with hardcoded colors - use CSS variables instead

## Migration from Hardcoded Colors

If you have existing components with hardcoded colors, replace them with CSS variables:

```css
/* Before */
.my-component {
  background-color: #ffffff;
  color: #000000;
  border: 1px solid #303030;
}

/* After */
.my-component {
  background-color: var(--sdk-color-bg-primary);
  color: var(--sdk-color-text-primary);
  border: 1px solid var(--sdk-color-border-primary);
}
```

## Troubleshooting

1. **Colors not changing**: Ensure the `data-theme` attribute is set on `document.documentElement`
2. **Missing variables**: Check that the CSS variables are defined in both light and dark themes
3. **SVG colors**: Use the ThemedSVG component or apply theme classes to SVG elements
4. **Tailwind classes**: Use the `sdk:` prefix for custom CSS variables in Tailwind classes

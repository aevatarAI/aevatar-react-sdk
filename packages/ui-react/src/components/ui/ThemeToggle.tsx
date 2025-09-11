import React from 'react';
import { useTheme } from '../context/AevatarProvider';

/**
 * A theme toggle component that allows users to switch between light and dark themes
 * 
 * @example
 * <ThemeToggle />
 */
export function ThemeToggle() {
  const { theme, toggleTheme, isDark, isLight } = useTheme();

  return (
    // biome-ignore lint/a11y/useButtonType: <explanation>
<button
      onClick={toggleTheme}
      className="sdk:flex sdk:items-center sdk:gap-2 sdk:px-4 sdk:py-2 sdk:rounded-md sdk:border sdk:border-[var(--sdk-color-border-primary)] sdk:bg-[var(--sdk-color-bg-primary)] sdk:text-[var(--sdk-color-text-primary)] sdk:hover:bg-[var(--sdk-color-bg-secondary)] sdk:transition-colors"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <span className="sdk:text-sm sdk:font-medium">
        {isDark ? '☀️' : '🌙'}
      </span>
      <span className="sdk:text-sm">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}

export default ThemeToggle;

import React from 'react';
import { useTheme } from '../context/AevatarProvider';

/**
 * A test component to verify theme switching functionality
 * This component demonstrates how colors change between light and dark themes
 */
export function ThemeTest() {
  const { theme, toggleTheme, isDark, isLight } = useTheme();

  return (
    <div className="sdk:p-6 sdk:space-y-4">
      <h2 className="sdk:text-2xl sdk:font-bold sdk:text-[var(--sdk-color-text-primary)]">
        Theme Test Component
      </h2>
      
      <div className="sdk:flex sdk:gap-4 sdk:items-center">
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button
          onClick={toggleTheme}
          className="sdk:px-4 sdk:py-2 sdk:rounded-md sdk:border sdk:border-[var(--sdk-color-border-primary)] sdk:bg-[var(--sdk-color-bg-primary)] sdk:text-[var(--sdk-color-text-primary)] sdk:hover:bg-[var(--sdk-color-bg-secondary)] sdk:transition-colors"
        >
          Switch to {isDark ? 'Light' : 'Dark'} Theme
        </button>
        
        <span className="sdk:text-[var(--sdk-color-text-secondary)]">
          Current: {theme}
        </span>
      </div>

      <div className="sdk:grid sdk:grid-cols-2 sdk:gap-4">
        {/* Background Colors */}
        <div className="sdk:space-y-2">
          <h3 className="sdk:text-lg sdk:font-semibold sdk:text-[var(--sdk-color-text-primary)]">
            Background Colors
          </h3>
          <div className="sdk:p-4 sdk:rounded sdk:bg-[var(--sdk-color-bg-primary)] sdk:border sdk:border-[var(--sdk-color-border-primary)]">
            <p className="sdk:text-[var(--sdk-color-text-primary)]">Primary Background</p>
          </div>
          <div className="sdk:p-4 sdk:rounded sdk:bg-[var(--sdk-color-bg-secondary)] sdk:border sdk:border-[var(--sdk-color-border-primary)]">
            <p className="sdk:text-[var(--sdk-color-text-primary)]">Secondary Background</p>
          </div>
          <div className="sdk:p-4 sdk:rounded sdk:bg-[var(--sdk-color-bg-tertiary)] sdk:border sdk:border-[var(--sdk-color-border-primary)]">
            <p className="sdk:text-[var(--sdk-color-text-primary)]">Tertiary Background</p>
          </div>
        </div>

        {/* Text Colors */}
        <div className="sdk:space-y-2">
          <h3 className="sdk:text-lg sdk:font-semibold sdk:text-[var(--sdk-color-text-primary)]">
            Text Colors
          </h3>
          <div className="sdk:p-4 sdk:rounded sdk:bg-[var(--sdk-color-bg-primary)] sdk:border sdk:border-[var(--sdk-color-border-primary)]">
            <p className="sdk:text-[var(--sdk-color-text-primary)]">Primary Text</p>
            <p className="sdk:text-[var(--sdk-color-text-secondary)]">Secondary Text</p>
            <p className="sdk:text-[var(--sdk-color-text-tertiary)]">Tertiary Text</p>
          </div>
        </div>

        {/* Semantic Colors */}
        <div className="sdk:space-y-2">
          <h3 className="sdk:text-lg sdk:font-semibold sdk:text-[var(--sdk-color-text-primary)]">
            Semantic Colors
          </h3>
          <div className="sdk:p-4 sdk:rounded sdk:bg-[var(--sdk-color-bg-primary)] sdk:border sdk:border-[var(--sdk-color-border-primary)]">
            <p className="sdk:text-[var(--sdk-color-success)]">Success Color</p>
            <p className="sdk:text-[var(--sdk-color-warning)]">Warning Color</p>
            <p className="sdk:text-[var(--sdk-color-error)]">Error Color</p>
            <p className="sdk:text-[var(--sdk-color-info)]">Info Color</p>
          </div>
        </div>

        {/* Border Colors */}
        <div className="sdk:space-y-2">
          <h3 className="sdk:text-lg sdk:font-semibold sdk:text-[var(--sdk-color-text-primary)]">
            Border Colors
          </h3>
          <div className="sdk:p-4 sdk:rounded sdk:bg-[var(--sdk-color-bg-primary)] sdk:border-2 sdk:border-[var(--sdk-color-border-primary)]">
            <p className="sdk:text-[var(--sdk-color-text-primary)]">Primary Border</p>
          </div>
          <div className="sdk:p-4 sdk:rounded sdk:bg-[var(--sdk-color-bg-primary)] sdk:border-2 sdk:border-[var(--sdk-color-border-secondary)]">
            <p className="sdk:text-[var(--sdk-color-text-primary)]">Secondary Border</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeTest;

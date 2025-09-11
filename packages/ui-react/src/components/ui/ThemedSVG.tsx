import React from 'react';

interface ThemedSVGProps {
  children: React.ReactNode;
  className?: string;
  theme?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'info' | 'border' | 'bg';
}

/**
 * A wrapper component for SVG elements that applies theme-aware colors
 * Usage: Wrap your SVG with this component and specify the theme
 * 
 * @example
 * <ThemedSVG theme="primary">
 *   <svg>
 *     <path d="..." />
 *   </svg>
 * </ThemedSVG>
 */
export function ThemedSVG({ children, className = '', theme = 'primary' }: ThemedSVGProps) {
  const themeClass = `sdk-svg-theme${theme === 'primary' ? '' : `-${theme}`}`;
  
  return (
    <div className={`${themeClass} ${className}`}>
      {children}
    </div>
  );
}

export default ThemedSVG;

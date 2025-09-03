import React from 'react';
import HypotenuseSVG from '../../assets/svg/hypotenuse.svg?react';
import { ThemedSVG } from './ThemedSVG';

interface HypotenuseIconProps {
  className?: string;
  theme?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'info' | 'border' | 'bg';
  size?: number;
}

/**
 * A themed hypotenuse icon component
 * Supports automatic theme switching between light and dark modes
 * 
 * @example
 * <HypotenuseIcon theme="primary" size={20} />
 * <HypotenuseIcon theme="bg" className="my-custom-class" />
 */
export function HypotenuseIcon({ 
  className = '', 
  theme = 'bg',
  size = 17 
}: HypotenuseIconProps) {
  return (
    <ThemedSVG theme={theme} className={className}>
      <HypotenuseSVG 
        width={size} 
        height={Math.round(size * 14 / 17)} // Maintain aspect ratio
        className="hypotenuse-icon"
      />
    </ThemedSVG>
  );
}

export default HypotenuseIcon;

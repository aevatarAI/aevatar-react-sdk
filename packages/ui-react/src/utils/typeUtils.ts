/**
 * Type utility functions for safe type checking and conversion
 * These functions provide robust type safety and error handling
 */

/**
 * Safe object type check utility
 * Distinguishes between plain objects and other object types (arrays, null, etc.)
 */
export const isPlainObject = (value: any): value is Record<string, any> => {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
};

/**
 * Safe string conversion utility
 * Handles null, undefined, and other edge cases gracefully
 */
export const safeStringify = (value: any): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
};

/**
 * Safe React element check
 * Determines if a value is a valid React element
 */
export const isReactElement = (value: any): boolean => {
  return (
    value !== null &&
    typeof value === "object" &&
    (value.$$typeof === Symbol.for("react.element") ||
      (typeof value === "object" && value.type && value.props))
  );
};

/**
 * Safe number conversion utility
 * Converts value to number with fallback handling
 */
export const safeNumber = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;

  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

/**
 * Safe boolean conversion utility
 * Converts value to boolean with proper handling of truthy/falsy values
 */
export const safeBoolean = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return Boolean(value);
};

/**
 * Type guard for checking if value is a valid key
 * Useful for React key props
 */
export const isValidKey = (value: any): value is string | number => {
  return typeof value === "string" || typeof value === "number";
};

/**
 * Safe key generation utility
 * Creates a safe key for React elements
 */
export const safeKey = (value: any, fallback?: string | number): string => {
  if (isValidKey(value)) return String(value);
  if (isValidKey(fallback)) return String(fallback);
  return `key-${Math.random().toString(36).substr(2, 9)}`;
};

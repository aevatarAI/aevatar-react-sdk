/**
 * Deep clone utility that preserves functions and handles circular references
 * @param obj - The object to clone
 * @param hash - WeakMap for tracking circular references
 * @returns Deep cloned object
 */
export const deepClone = <T>(obj: T, hash = new WeakMap()): T => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Handle functions - return them as-is
  if (typeof obj === "function") {
    return obj;
  }

  // Handle circular references
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  // Handle RegExp objects
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as T;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    const clonedArray = [] as any;
    hash.set(obj, clonedArray);
    for (let i = 0; i < obj.length; i++) {
      clonedArray[i] = deepClone(obj[i], hash);
    }
    return clonedArray;
  }

  // Handle objects - create a new object and copy all properties
  const clonedObj = {} as any;
  hash.set(obj, clonedObj);
  
  // Copy all enumerable properties
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key], hash);
    }
  }
  
  // Also copy non-enumerable properties that might be functions
  const allKeys = Object.getOwnPropertyNames(obj);
  for (const key of allKeys) {
    if (!Object.prototype.hasOwnProperty.call(clonedObj, key)) {
      clonedObj[key] = deepClone(obj[key], hash);
    }
  }
  
  return clonedObj;
}; 
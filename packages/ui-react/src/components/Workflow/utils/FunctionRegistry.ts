/**
 * Function registry to manage function references
 * Prevents function reference issues during undo/redo operations
 */
export class FunctionRegistry {
  private static instance: FunctionRegistry;
  private functions: Map<string, (...args: any[]) => any> = new Map();
  private nextId = 1;

  static getInstance(): FunctionRegistry {
    if (!FunctionRegistry.instance) {
      FunctionRegistry.instance = new FunctionRegistry();
    }
    return FunctionRegistry.instance;
  }

  /**
   * Register a function and return its ID
   */
  register(fn: (...args: any[]) => any): string {
    const id = `fn_${this.nextId++}`;
    this.functions.set(id, fn);
    return id;
  }

  /**
   * Get a function by its ID
   */
  get(id: string): ((...args: any[]) => any) | undefined {
    return this.functions.get(id);
  }

  /**
   * Update a function reference by its ID
   */
  update(id: string, fn: (...args: any[]) => any): void {
    this.functions.set(id, fn);
  }

  /**
   * Clear all registered functions
   */
  clear(): void {
    this.functions.clear();
    this.nextId = 1;
  }

  /**
   * Get the number of registered functions
   */
  size(): number {
    return this.functions.size;
  }

  /**
   * Check if a function ID exists
   */
  has(id: string): boolean {
    return this.functions.has(id);
  }
}

// Export singleton instance
export const functionRegistry = FunctionRegistry.getInstance(); 
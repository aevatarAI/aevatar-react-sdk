import type { JSONSchemaType } from "../components";

// Recursively resolve $ref in schema
type SchemaMap = Record<string, any>;

function resolveRef(ref: string, rootSchema: any): any {
  if (!ref.startsWith("#/")) return null;
  const path = ref.replace(/^#\//, "").split("/");
  let current: any = rootSchema;
  for (const key of path) {
    current = current[key];
    if (!current) return null;
  }
  return current;
}

function parseJsonSchemaProperties(
  properties: Record<string, any>,
  rootSchema: any,
  definitions: SchemaMap,
  values?: Record<string, any>,
  requiredList?: string[]
): [string, any][] {
  return Object.entries(properties).map(([name, prop]) => {
    const isRequired = requiredList?.includes(name);
    const propWithRequired = isRequired ? { ...prop, required: true } : prop;
    return [
      name,
      parseJsonSchema(
        propWithRequired,
        rootSchema,
        definitions,
        values?.[name]
      ),
    ];
  });
}

export function parseJsonSchema(
  schema: any,
  rootSchema: any,
  definitions: SchemaMap,
  value?: any
): any {
  // Handle $ref
  if (schema.$ref) {
    const refSchema = resolveRef(schema.$ref, rootSchema);
    if (!refSchema) return { ...schema, value };
    return parseJsonSchema(refSchema, rootSchema, definitions, value);
  }
  // Handle allOf/anyOf/oneOf (not implemented, fallback to first)
  if (schema.allOf && Array.isArray(schema.allOf)) {
    return parseJsonSchema(schema.allOf[0], rootSchema, definitions, value);
  }
  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    return parseJsonSchema(schema.anyOf[0], rootSchema, definitions, value);
  }
  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    return parseJsonSchema(schema.oneOf[0], rootSchema, definitions, value);
  }
  // Handle object
  if (schema.type === "object" && schema.properties) {
    return {
      ...schema,
      value,
      children: parseJsonSchemaProperties(
        schema.properties,
        rootSchema,
        definitions,
        value,
        schema.required
      ),
    };
  }
  // Handle array
  if (schema.type === "array" && schema.items) {
    return {
      ...schema,
      value,
      itemsSchema: parseJsonSchema(
        schema.items,
        rootSchema,
        definitions,
        undefined
      ),
    };
  }
  // Handle enum
  if (schema.enum) {
    return {
      ...schema,
      value,
    };
  }
  // Handle primitive types (string, number, boolean, file, etc)
  return {
    ...schema,
    value,
  };
}

// Main entry: parse jsonSchemaString to [name, schema] pairs (top-level properties)
export const jsonSchemaParse = (
  jsonSchemaString?: string,
  properties?: Record<string, any>
): [string, any][] => {
  const jsonSchema = JSON.parse(
    (jsonSchemaString === "" ? "{}" : jsonSchemaString) ?? "{}"
  );
  const definitions = jsonSchema?.definitions || {};
  const _properties = jsonSchema?.properties;
  const requiredList = jsonSchema?.required;

  if (!_properties) return [];
  return Object.entries(_properties).map(([name, prop]) => {
    const isRequired = requiredList?.includes(name);

    const propWithRequired = { ...((prop as any) ?? {}), required: isRequired };

    return [
      name,
      parseJsonSchema(
        propWithRequired,
        jsonSchema,
        definitions,
        properties?.[name]
      ),
    ];
  });
};

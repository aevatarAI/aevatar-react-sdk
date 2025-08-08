import Ajv from "ajv";
import addFormats from "ajv-formats";

// Create AJV instance with custom options
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
  validateFormats: true,
});

// Add format support including email
addFormats(ajv);

// Constants for handled keys to avoid recreating array on each function call
const HANDLED_KEYS = [
  'required', 'type', 'enum', 'x-enumNames', 'const', 'not', 'allOf', 'anyOf', 'oneOf',
  'minItems', 'maxItems', 'uniqueItems', 'contains', 'additionalItems',
  'minProperties', 'maxProperties', 'dependencies', 'propertyNames', 'patternProperties',
  'format', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf',
  'pattern', 'minLength', 'maxLength', 'contentMediaType', 'contentEncoding',
  'itemsSchema', 'children' // These are custom properties that should not be in JSON Schema
];

// Helper function to copy property if it exists
function copyProperty(schema: any, jsonSchema: any, propertyName: string): void {
  if (schema[propertyName] !== undefined) {
    jsonSchema[propertyName] = schema[propertyName];
  }
}

// Helper function to copy property with conversion if it exists
function copyPropertyWithConversion(schema: any, jsonSchema: any, propertyName: string): void {
  if (schema[propertyName]) {
    jsonSchema[propertyName] = convertToJsonSchema(schema[propertyName]);
  }
}

// Convert custom schema format to standard JSON Schema
function convertToJsonSchema(schema: any): any {
  // Start with a copy of the original schema to preserve all properties
  const jsonSchema: any = { ...schema };

  // Handle required field - this should not be in the schema itself
  // required is handled at the wrapper level, not in the individual field schema
  if (jsonSchema.required !== undefined) {
    // biome-ignore lint/performance/noDelete: <explanation>
    delete jsonSchema.required;
  }

  // Handle enum with x-enumNames - preserve both enum and x-enumNames
  if (schema.enum) {
    jsonSchema.enum = schema.enum;
    if (schema["x-enumNames"]) {
      jsonSchema["x-enumNames"] = schema["x-enumNames"];
    }
  }

  // Handle const validation
  copyProperty(schema, jsonSchema, 'const');

  // Handle not validation
  copyPropertyWithConversion(schema, jsonSchema, 'not');

  // Handle allOf/anyOf/oneOf validation - use loop to avoid repetition
  ['allOf', 'anyOf', 'oneOf'].forEach(key => {
    if (schema[key] && Array.isArray(schema[key])) {
      jsonSchema[key] = schema[key].map((subSchema: any) => convertToJsonSchema(subSchema));
    }
  });

  // Handle array type with all constraints
  if (schema.type === "array" && schema.itemsSchema) {
    jsonSchema.type = "array";
    jsonSchema.items = convertToJsonSchema(schema.itemsSchema);
    
    // Preserve array-specific constraints
    copyProperty(schema, jsonSchema, 'minItems');
    copyProperty(schema, jsonSchema, 'maxItems');
    copyProperty(schema, jsonSchema, 'uniqueItems');
    copyPropertyWithConversion(schema, jsonSchema, 'contains');
    
    if (schema.additionalItems !== undefined) {
      if (typeof schema.additionalItems === "boolean") {
        jsonSchema.additionalItems = schema.additionalItems;
      } else {
        jsonSchema.additionalItems = convertToJsonSchema(schema.additionalItems);
      }
    }
  }

  // Handle object type with all constraints
  if (schema.type === "object" && schema.children) {
    jsonSchema.type = "object";
    
    // Handle additionalProperties structure
    if (schema.children[0]?.isAdditionalProperties) {
      jsonSchema.additionalProperties = convertToJsonSchema(
        schema.children[0].valueSchema
      );
    } else {
      // Handle properties structure (default)
      jsonSchema.properties = {};
      
      schema.children.forEach(([childName, childSchema]: [string, any]) => {
        jsonSchema.properties[childName] = convertToJsonSchema(childSchema);
      });
    }

    // Preserve object-specific constraints
    copyProperty(schema, jsonSchema, 'minProperties');
    copyProperty(schema, jsonSchema, 'maxProperties');
    copyProperty(schema, jsonSchema, 'dependencies');
    copyPropertyWithConversion(schema, jsonSchema, 'propertyNames');
    
    if (schema.required && Array.isArray(schema.required)) {
      jsonSchema.required = schema.required;
    }
    
    if (schema.patternProperties) {
      jsonSchema.patternProperties = {};
      Object.keys(schema.patternProperties).forEach(pattern => {
        jsonSchema.patternProperties[pattern] = convertToJsonSchema(schema.patternProperties[pattern]);
      });
    }
  }

  // Handle boolean type
  if (schema.type === "boolean") {
    jsonSchema.type = "boolean";
  }

  // Handle file type (custom type, not standard JSON Schema)
  if (schema.type === "file") {
    // For file type, we'll handle it specially in validation
    jsonSchema.type = "string";
    jsonSchema.format = "file";
  }

  // Handle number/integer type with all constraints
  if (schema.type === "number" || schema.type === "integer") {
    jsonSchema.type = schema.type;
    
    // Preserve all number constraints
    copyProperty(schema, jsonSchema, 'format');
    copyProperty(schema, jsonSchema, 'minimum');
    copyProperty(schema, jsonSchema, 'maximum');
    copyProperty(schema, jsonSchema, 'exclusiveMinimum');
    copyProperty(schema, jsonSchema, 'exclusiveMaximum');
    copyProperty(schema, jsonSchema, 'multipleOf');
  }

  // Handle string type with all constraints
  if (schema.type === "string") {
    jsonSchema.type = "string";
    
    // Preserve all string constraints
    copyProperty(schema, jsonSchema, 'pattern');
    copyProperty(schema, jsonSchema, 'minLength');
    copyProperty(schema, jsonSchema, 'maxLength');
    copyProperty(schema, jsonSchema, 'format');
    copyProperty(schema, jsonSchema, 'contentMediaType');
    copyProperty(schema, jsonSchema, 'contentEncoding');
  }

  // Preserve any other custom properties that might be in the schema
  // This ensures we don't lose any custom validation rules
  Object.keys(schema).forEach(key => {
    if (!HANDLED_KEYS.includes(key) && !(key in jsonSchema)) {
      jsonSchema[key] = schema[key];
    }
  });

  return jsonSchema;
}

// Convert AJV errors to our format
function convertAjvErrors(
  ajvErrors: any[],
  fieldName: string
): { name: string; error: string }[] {
  return ajvErrors.map((error) => {
    let errorMessage = "";

    switch (error.keyword) {
      case "required":
        errorMessage = "required";
        break;
      case "enum":
        errorMessage = `Must be one of: ${error.params.allowedValues.join(
          ", "
        )}`;
        break;
      case "type":
        if (error.params.type === "number") {
          errorMessage = "Must be a number";
        } else {
          errorMessage = `Must be ${error.params.type}`;
        }
        break;
      case "minItems":
        errorMessage = "required";
        break;
      case "minimum":
        errorMessage = `Minimum: ${error.params.limit}`;
        break;
      case "maximum":
        errorMessage = `Maximum: ${error.params.limit}`;
        break;
      case "minLength":
        errorMessage = `MinLength: ${error.params.limit}`;
        break;
      case "maxLength":
        errorMessage = `MaxLength: ${error.params.limit}`;
        break;
      case "pattern":
        errorMessage = `Pattern: ${error.params.pattern}`;
        break;
      case "format":
        if (error.params.format === "int32") {
          errorMessage = "Must be int32 integer (-2147483648 to 2147483647)";
        } else {
          errorMessage = `Invalid format: ${error.params.format}`;
        }
        break;
      default:
        errorMessage = error.message || "Invalid value";
    }

    return {
      name: fieldName,
      error: errorMessage,
    };
  });
}

// Recursive validation for JSON Schema fields using AJV
// Supports object, array, enum, boolean, file, string, number, etc.
// Returns { errors, param } where errors is an array of { name, error }, param is the validated value
export function validateSchemaFieldAjv(
  name: string,
  schema: any,
  _value: any,
  parentName = ""
): { errors: { name: string; error: string }[]; param: any } {
  let value = _value;
  const fieldName = parentName ? `${parentName}.${name}` : name;

  // Handle required field
  if (
    schema.required &&
    (value === undefined || value === null || value === "")
  ) {
    return {
      errors: [{ name: fieldName, error: "required" }],
      param: undefined,
    };
  }

  // Handle optional field with empty value
  if (
    !schema.required &&
    (value === undefined || value === null || value === "")
  ) {
    return { errors: [], param: value };
  }

  // Handle enum with x-enumNames conversion
  if (schema.enum && schema["x-enumNames"]) {
    if (schema["x-enumNames"].includes(value)) {
      value = schema.enum[schema["x-enumNames"].indexOf(value)];
    }
  }

  // Handle file type specially
  if (schema.type === "file") {
    if (!value) {
      return {
        errors: [{ name: fieldName, error: "File required" }],
        param: value,
      };
    }
    return { errors: [], param: value };
  }

  // Handle number/integer type specially for better error handling
  if (schema.type === "number" || schema.type === "integer") {
    if (value === undefined || value === null || value === "") {
      return {
        errors: [{ name: fieldName, error: "required" }],
        param: undefined,
      };
    }

    if (Number.isNaN(Number(value))) {
      return {
        errors: [{ name: fieldName, error: "Must be a number" }],
        param: value,
      };
    }

    // Handle int32 format validation
    if (schema.type === "integer" && schema.format === "int32") {
      const intVal = Number(value);
      if (
        !Number.isInteger(intVal) ||
        intVal < -2147483648 ||
        intVal > 2147483647
      ) {
        return {
          errors: [
            {
              name: fieldName,
              error: "Must be int32 integer (-2147483648 to 2147483647)",
            },
          ],
          param: value,
        };
      }
    }

    // Handle min/max validation
    if (schema.minimum !== undefined && Number(value) < schema.minimum) {
      return {
        errors: [{ name: fieldName, error: `Minimum: ${schema.minimum}` }],
        param: value,
      };
    }
    if (schema.maximum !== undefined && Number(value) > schema.maximum) {
      return {
        errors: [{ name: fieldName, error: `Maximum: ${schema.maximum}` }],
        param: value,
      };
    }

    return { errors: [], param: Number(value) };
  }

  // Convert schema to JSON Schema format
  const jsonSchema = convertToJsonSchema(schema);
  // Create a wrapper schema for the specific field
  const wrapperSchema = {
    type: "object",
    properties: {
      [name]: jsonSchema,
    },
    required: schema.required ? [name] : [],
  };

  // Validate using AJV
  const validate = ajv.compile(wrapperSchema);
  const data = { [name]: value };
  const isValid = validate(data);

  if (isValid) {
    // Handle special cases for param value
    let param = data[name];

    // Convert number strings to numbers
    if (
      (schema.type === "number" || schema.type === "integer") &&
      typeof param === "string"
    ) {
      param = Number(param);
    }

    return { errors: [], param };
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    // Convert AJV errors to our format
    const errors = convertAjvErrors(validate.errors || [], fieldName);
    return { errors, param: value };
  }
}

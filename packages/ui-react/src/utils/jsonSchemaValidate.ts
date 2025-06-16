// Recursive validation for JSON Schema fields
// Supports object, array, enum, boolean, file, string, number, etc.
// Returns { errors, param } where errors is an array of { name, error }, param is the validated value
export function validateSchemaField(
  name: string,
  schema: any,
  _value: any,
  parentName = ""
) {
  let value = _value;
  const errors: { name: string; error: string }[] = [];
  let param: any = undefined;
  const fieldName = parentName ? `${parentName}.${name}` : name;
  // required
  if (
    schema.required &&
    (value === undefined || value === null || value === "")
  ) {
    errors.push({ name: fieldName, error: "required" });
    return { errors, param };
  }

  if (
    !schema.required &&
    (value === undefined || value === null || value === "")
  )
    return { errors, param: value };

  // enum
  if (schema.enum) {
    if (!schema.enum.includes(value)) {
      if (schema["x-enumNames"]?.includes?.(value)) {
        value = schema.enum[schema["x-enumNames"].indexOf(value)];
      } else {
        errors.push({
          name: fieldName,
          error: `Must be one of: ${(schema["x-enumNames"] ?? schema.enum).join(
            ", "
          )}`,
        });
      }
    }
    param = value;

    return { errors, param };
  }
  // array
  if (schema.type === "array" && schema.itemsSchema) {
    if (
      schema.required &&
      (value === undefined ||
        value === null ||
        (Array.isArray(value) && value.length === 0))
    ) {
      errors.push({ name: fieldName, error: "required" });
      return { errors, param };
    }
    if (!Array.isArray(value)) {
      errors.push({ name: fieldName, error: "Must be an array" });
      return { errors, param };
    }
    param = [];
    value.forEach((item: any, idx: number) => {
      const { errors: childErrors, param: childParam } = validateSchemaField(
        String(idx),
        schema.itemsSchema,
        item,
        fieldName
      );
      errors.push(...childErrors);
      param.push(childParam);
    });
    return { errors, param };
  }
  // object
  if (schema.type === "object" && schema.children) {
    // additionalProperties structure
    if (schema.children[0]?.isAdditionalProperties) {
      param = {};
      for (const key in value) {
        const { errors: childErrors, param: childParam } = validateSchemaField(
          key,
          schema.children[0].valueSchema,
          value[key],
          fieldName
        );
        errors.push(...childErrors);
        if (childParam !== undefined) param[key] = childParam;
      }
      return { errors, param };
    }
    // properties structure (default)
    param = {};
    schema.children.forEach(([childName, childSchema]: [string, any]) => {
      const { errors: childErrors, param: childParam } = validateSchemaField(
        childName,
        childSchema,
        value?.[childName],
        fieldName
      );
      errors.push(...childErrors);
      if (childParam !== undefined) param[childName] = childParam;
    });
    return { errors, param };
  }
  // boolean
  if (schema.type === "boolean") {
    if (typeof value !== "boolean") {
      errors.push({ name: fieldName, error: "Must be boolean" });
    }
    param = value;
    return { errors, param };
  }
  // file
  if (schema.type === "file") {
    // TODO: Extend file validation (type, size, etc.)
    if (!value) {
      errors.push({ name: fieldName, error: "File required" });
    }
    param = value;
    return { errors: errors ?? [], param };
  }
  // number/integer
  if (schema.type === "number" || schema.type === "integer") {
    if (value === undefined || value === null || value === "") {
      errors.push({ name: fieldName, error: "required" });
    } else if (Number.isNaN(Number(value))) {
      errors.push({ name: fieldName, error: "Must be a number" });
    } else {
      // int32 format validation for integer type
      if (schema.type === "integer" && schema.format === "int32") {
        // int32 range: -2147483648 to 2147483647
        const intVal = Number(value);
        if (
          !Number.isInteger(intVal) ||
          intVal < -2147483648 ||
          intVal > 2147483647
        ) {
          errors.push({
            name: fieldName,
            error: "Must be int32 integer (-2147483648 to 2147483647)",
          });
        }
      }
      if (schema.minimum !== undefined && Number(value) < schema.minimum) {
        errors.push({ name: fieldName, error: `Minimum: ${schema.minimum}` });
      }
      if (schema.maximum !== undefined && Number(value) > schema.maximum) {
        errors.push({ name: fieldName, error: `Maximum: ${schema.maximum}` });
      }
    }
    param = Number(value);
    return { errors, param };
  }
  // string
  if (schema.type === "string") {
    if (
      schema.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors.push({ name: fieldName, error: "required" });
    } else {
      if (schema.pattern) {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(value)) {
          errors.push({ name: fieldName, error: `Pattern: ${schema.pattern}` });
        }
      }
      if (schema.minLength && value.length < schema.minLength) {
        errors.push({
          name: fieldName,
          error: `MinLength: ${schema.minLength}`,
        });
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        errors.push({
          name: fieldName,
          error: `MaxLength: ${schema.maxLength}`,
        });
      }
    }
    param = value;
    return { errors, param };
  }
  // fallback
  param = value;
  return { errors, param };
}

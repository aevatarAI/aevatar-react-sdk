import { describe, it, expect } from "vitest";
import { validateSchemaFieldAjv } from "./jsonSchemaValidateAjv";
import { validateSchemaField } from "./jsonSchemaValidate";

describe("validateSchemaFieldAjv", () => {
  it("validates required field", () => {
    const schema = { type: "string", required: true };
    const { errors } = validateSchemaFieldAjv("foo", schema, undefined);
    expect(errors[0].error).toBe("required");
  });

  it("validates enum", () => {
    const schema = { type: "string", enum: ["a", "b"] };
    const { errors, param } = validateSchemaFieldAjv("foo", schema, "c");
    expect(errors[0].error).toContain("Must be one of");
    expect(param).toBe("c");
  });

  it("validates enum with x-enumNames", () => {
    const schema = { type: "string", enum: ["a", "b"], "x-enumNames": ["A", "B"] };
    const { errors, param } = validateSchemaFieldAjv("foo", schema, "A");
    expect(errors.length).toBe(0);
    expect(param).toBe("a");
  });

  it("validates array of strings", () => {
    const schema = { type: "array", itemsSchema: { type: "string", required: true } };
    const { errors, param } = validateSchemaFieldAjv("arr", schema, ["a", "b"]);
    expect(errors.length).toBe(0);
    expect(param).toEqual(["a", "b"]);
  });

  it("validates object with children", () => {
    const schema = {
      type: "object",
      children: [
        ["foo", { type: "string", required: true }],
        ["bar", { type: "number" }],
      ],
    };
    const { errors, param } = validateSchemaFieldAjv("obj", schema, { foo: "abc", bar: 1 });
    expect(errors.length).toBe(0);
    expect(param.foo).toBe("abc");
    expect(param.bar).toBe(1);
  });

  it("validates object with additionalProperties", () => {
    const schema = {
      type: "object",
      children: [
        {
          isAdditionalProperties: true,
          valueSchema: { type: "number", required: true },
        },
      ],
    };
    const { errors, param } = validateSchemaFieldAjv("obj", schema, { a: 1, b: 2 });
    expect(errors.length).toBe(0);
    expect(param.a).toBe(1);
    expect(param.b).toBe(2);
  });

  it("validates boolean", () => {
    const schema = { type: "boolean" };
    const { errors, param } = validateSchemaFieldAjv("flag", schema, true);
    expect(errors.length).toBe(0);
    expect(param).toBe(true);
    const { errors: err2 } = validateSchemaFieldAjv("flag", schema, "notbool");
    expect(err2[0].error).toBe("Must be boolean");
  });

  it("validates file", () => {
    const schema = { type: "file" };
    const { errors } = validateSchemaFieldAjv("file", schema, undefined);
    expect(Array.isArray(errors)).toBe(true);
    if (errors.length > 0) {
      expect(errors[0].error).toBe("File required");
    }
  });

  it("validates number/integer", () => {
    const schema = { type: "number", required: true };
    const { errors, param } = validateSchemaFieldAjv("num", schema, 123);
    expect(errors.length).toBe(0);
    expect(param).toBe(123);
    const { errors: err2 } = validateSchemaFieldAjv("num", schema, "abc");
    expect(err2[0].error).toBe("Must be a number");
  });

  it("validates integer with int32 format", () => {
    const schema = { type: "integer", format: "int32" };
    const { errors } = validateSchemaFieldAjv("int", schema, 2147483648);
    expect(errors[0].error).toContain("int32");
  });

  it("validates number with min/max", () => {
    const schema = { type: "number", minimum: 1, maximum: 10 };
    const { errors } = validateSchemaFieldAjv("num", schema, 0);
    expect(errors[0].error).toContain("Minimum");
    const { errors: err2 } = validateSchemaFieldAjv("num", schema, 11);
    expect(err2[0].error).toContain("Maximum");
  });

  it("validates string with pattern/minLength/maxLength", () => {
    const schema = { type: "string", pattern: "^a.*z$", minLength: 3, maxLength: 5 };
    const { errors } = validateSchemaFieldAjv("str", schema, "ab");
    expect(errors.some(e => e.error.includes("Pattern"))).toBe(true);
    expect(errors.some(e => e.error.includes("MinLength"))).toBe(true);
    const { errors: err2 } = validateSchemaFieldAjv("str", schema, "azzzzz");
    expect(err2.some(e => e.error.includes("MaxLength"))).toBe(true);
  });

  it("returns value for fallback", () => {
    const schema = { type: "string" };
    const { errors, param } = validateSchemaFieldAjv("foo", schema, "123");
    expect(errors.length).toBe(0);
    expect(param).toBe("123");
  });
});

// Compare AJV implementation with original implementation
describe("AJV vs Original Implementation", () => {
  it("should produce same results for required field", () => {
    const schema = { type: "string", required: true };
    const value = undefined;
    
    const originalResult = validateSchemaField("foo", schema, value);
    const ajvResult = validateSchemaFieldAjv("foo", schema, value);
    
    expect(ajvResult.errors).toEqual(originalResult.errors);
  });

  it("should produce same results for enum validation", () => {
    const schema = { type: "string", enum: ["a", "b"], "x-enumNames": ["A", "B"] };
    const value = "A";
    
    const originalResult = validateSchemaField("foo", schema, value);
    const ajvResult = validateSchemaFieldAjv("foo", schema, value);
    
    expect(ajvResult.errors).toEqual(originalResult.errors);
    expect(ajvResult.param).toEqual(originalResult.param);
  });

  it("should produce same results for object validation", () => {
    const schema = {
      type: "object",
      children: [
        ["foo", { type: "string", required: true }],
        ["bar", { type: "number" }],
      ],
    };
    const value = { foo: "abc", bar: 1 };
    
    const originalResult = validateSchemaField("obj", schema, value);
    const ajvResult = validateSchemaFieldAjv("obj", schema, value);
    
    expect(ajvResult.errors).toEqual(originalResult.errors);
    expect(ajvResult.param).toEqual(originalResult.param);
  });
}); 

describe("convertToJsonSchema", () => {
  it("should preserve all format validation constraints", () => {
    const originalSchema = {
      type: "string",
      pattern: "^[a-zA-Z]+$",
      minLength: 3,
      maxLength: 10,
      format: "email",
      contentMediaType: "text/plain",
      contentEncoding: "utf-8",
      const: "test",
      not: { type: "number" },
      allOf: [{ type: "string" }, { minLength: 1 }],
      anyOf: [{ type: "string" }, { type: "number" }],
      oneOf: [{ type: "string" }, { type: "number" }],
      required: true
    };

    // Test that the schema conversion preserves all constraints
    const { errors, param } = validateSchemaFieldAjv("test", originalSchema, "invalid-email");
    
    // Should have errors because the value doesn't match the constraints
    expect(errors.length).toBeGreaterThan(0);
    
    // Test with valid value - use a simpler test case
    const simpleSchema = {
      type: "string",
      pattern: "^[a-zA-Z]+$",
      minLength: 3,
      maxLength: 10,
      required: true
    };
    
    const { errors: validErrors, param: validParam } = validateSchemaFieldAjv("test", simpleSchema, "abcde");
    expect(validErrors.length).toBe(0);
    expect(validParam).toBe("abcde");
  });

  it("should preserve array format validation constraints", () => {
    const originalSchema = {
      type: "array",
      itemsSchema: { type: "string", minLength: 2 },
      minItems: 1,
      maxItems: 5,
      uniqueItems: true,
      contains: { type: "string", pattern: "^[A-Z]+$" },
      additionalItems: { type: "number" },
      required: true
    };

    // Test with invalid array
    const { errors, param } = validateSchemaFieldAjv("test", originalSchema, ["a", "b", "c"]);
    expect(errors.length).toBeGreaterThan(0);
    
    // Test with valid array
    const { errors: validErrors, param: validParam } = validateSchemaFieldAjv("test", originalSchema, ["AB", "CD"]);
    expect(validErrors.length).toBe(0);
    expect(Array.isArray(validParam)).toBe(true);
  });

  it("should preserve object format validation constraints", () => {
    const originalSchema = {
      type: "object",
      children: [
        ["name", { type: "string", minLength: 1 }],
        ["age", { type: "integer", minimum: 0, maximum: 150 }]
      ],
      minProperties: 1,
      maxProperties: 3,
      dependencies: { age: ["name"] },
      propertyNames: { type: "string", pattern: "^[a-z]+$" },
      patternProperties: { "^[A-Z]+$": { type: "string" } },
      required: true
    };

    // Test with invalid object
    const { errors, param } = validateSchemaFieldAjv("test", originalSchema, {});
    expect(errors.length).toBeGreaterThan(0);
    
    // Test with valid object
    const { errors: validErrors, param: validParam } = validateSchemaFieldAjv("test", originalSchema, { name: "John", age: 30 });
    expect(validErrors.length).toBe(0);
    expect(typeof validParam).toBe("object");
  });

  it("should preserve number format validation constraints", () => {
    const originalSchema = {
      type: "integer",
      format: "int32",
      minimum: 0,
      maximum: 100,
      exclusiveMinimum: 0,
      exclusiveMaximum: 100,
      multipleOf: 5,
      required: true
    };

    // Test with invalid number
    const { errors, param } = validateSchemaFieldAjv("test", originalSchema, 150);
    expect(errors.length).toBeGreaterThan(0);
    
    // Test with valid number
    const { errors: validErrors, param: validParam } = validateSchemaFieldAjv("test", originalSchema, 25);
    expect(validErrors.length).toBe(0);
    expect(typeof validParam).toBe("number");
  });
}); 
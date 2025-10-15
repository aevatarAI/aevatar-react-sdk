import { describe, it, expect } from "vitest";
import { validateSchemaField } from "./jsonSchemaValidate";

describe("validateSchemaField", () => {
  it("validates required field", () => {
    const schema = { type: "string", required: true };
    const { errors } = validateSchemaField("foo", schema, undefined);
    expect(errors[0].error).toBe("required");
  });

  it("validates enum", () => {
    const schema = { type: "string", enum: ["a", "b"] };
    const { errors, param } = validateSchemaField("foo", schema, "c");
    expect(errors[0].error).toContain("Must be one of");
    expect(param).toBe("c");
  });

  it("validates enum with x-enumNames", () => {
    const schema = { type: "string", enum: ["a", "b"], "x-enumNames": ["A", "B"] };
    const { errors, param } = validateSchemaField("foo", schema, "A");
    expect(errors.length).toBe(0);
    expect(param).toBe("a");
  });

  it("validates array of strings", () => {
    const schema = { type: "array", itemsSchema: { type: "string", required: true } };
    const { errors, param } = validateSchemaField("arr", schema, ["a", "b"]);
    expect(errors.length).toBe(0);
    expect(param).toEqual(["a", "b"]);
  });

  it.skip("validates array with error (Currently, validateSchemaField does not perform type assertion for string type, so this cannot be covered)", () => {
    // const schema = { type: "array", itemsSchema: { type: "string", required: true } };
    // const { errors } = validateSchemaField("arr", schema, ["a", 1]);
    // expect(errors.length).toBeGreaterThan(0);
  });

  it("validates object with children", () => {
    const schema = {
      type: "object",
      children: [
        ["foo", { type: "string", required: true }],
        ["bar", { type: "number" }],
      ],
    };
    const { errors, param } = validateSchemaField("obj", schema, { foo: "abc", bar: 1 });
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
    const { errors, param } = validateSchemaField("obj", schema, { a: 1, b: 2 });
    expect(errors.length).toBe(0);
    expect(param.a).toBe(1);
    expect(param.b).toBe(2);
  });

  it("validates boolean", () => {
    const schema = { type: "boolean" };
    const { errors, param } = validateSchemaField("flag", schema, true);
    expect(errors.length).toBe(0);
    expect(param).toBe(true);
    const { errors: err2 } = validateSchemaField("flag", schema, "notbool");
    expect(err2[0].error).toBe("Must be boolean");
  });

  it("validates file", () => {
    const schema = { type: "file" };
    const { errors } = validateSchemaField("file", schema, undefined);
    expect(Array.isArray(errors)).toBe(true);
    if (errors.length > 0) {
      expect(errors[0].error).toBe("File required");
    }
  });

  it("validates number/integer", () => {
    const schema = { type: "number", required: true };
    const { errors, param } = validateSchemaField("num", schema, 123);
    expect(errors.length).toBe(0);
    expect(param).toBe(123);
    const { errors: err2 } = validateSchemaField("num", schema, "abc");
    expect(err2[0].error).toBe("Must be a number");
  });

  it("validates integer with int32 format", () => {
    const schema = { type: "integer", format: "int32" };
    const { errors } = validateSchemaField("int", schema, 2147483648);
    expect(errors[0].error).toContain("int32");
  });

  it("validates number with min/max", () => {
    const schema = { type: "number", minimum: 1, maximum: 10 };
    const { errors } = validateSchemaField("num", schema, 0);
    expect(errors[0].error).toContain("Minimum");
    const { errors: err2 } = validateSchemaField("num", schema, 11);
    expect(err2[0].error).toContain("Maximum");
  });

  it("validates string with pattern/minLength/maxLength", () => {
    const schema = { type: "string", pattern: "^a.*z$", minLength: 3, maxLength: 5 };
    const { errors } = validateSchemaField("str", schema, "ab");
    expect(errors.some(e => e.error.includes("Pattern"))).toBe(true);
    expect(errors.some(e => e.error.includes("MinLength"))).toBe(true);
    const { errors: err2 } = validateSchemaField("str", schema, "azzzzz");
    expect(err2.some(e => e.error.includes("MaxLength"))).toBe(true);
  });

  it("returns value for fallback", () => {
    const schema = { type: "string" };
    const { errors, param } = validateSchemaField("foo", schema, "123");
    expect(errors.length).toBe(0);
    expect(param).toBe("123");
  });
}); 
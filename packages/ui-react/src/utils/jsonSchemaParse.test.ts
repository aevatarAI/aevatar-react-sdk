import { describe, it, expect } from "vitest";
import { jsonSchemaParse, parseJsonSchema } from "./jsonSchemaParse";

// Basic object schema
const objectSchema = JSON.stringify({
  type: "object",
  properties: {
    foo: { type: "string" },
    bar: { type: "number" },
  },
  required: ["foo"],
});

describe("jsonSchemaParse", () => {
  it("parses basic object schema", () => {
    const result = jsonSchemaParse(objectSchema, { foo: "abc", bar: 123 });
    expect(result).toHaveLength(2);
    expect(result[0][0]).toBe("foo");
    expect(result[0][1].type).toBe("string");
    expect(result[0][1].value).toBe("abc");
    expect(result[0][1].required).toBe(true);
    expect(result[1][0]).toBe("bar");
    expect(result[1][1].type).toBe("number");
    expect(result[1][1].value).toBe(123);
    expect(result[1][1].required).toBe(false);
  });

  it("parses $ref in schema", () => {
    const schema = {
      definitions: {
        Foo: { type: "string" },
      },
      type: "object",
      properties: {
        foo: { $ref: "#/definitions/Foo" },
      },
    };
    const str = JSON.stringify(schema);
    const result = jsonSchemaParse(str, { foo: "abc" });
    expect(result[0][1].type).toBe("string");
    expect(result[0][1].value).toBe("abc");
  });

  it("parses allOf/anyOf/oneOf (fallback to first)", () => {
    const schema = {
      type: "object",
      properties: {
        foo: {
          allOf: [{ type: "string" }, { minLength: 2 }],
        },
        bar: {
          anyOf: [{ type: "number" }, { type: "string" }],
        },
        baz: {
          oneOf: [{ type: "boolean" }, { type: "string" }],
        },
      },
    };
    const str = JSON.stringify(schema);
    const result = jsonSchemaParse(str, { foo: "a", bar: 1, baz: true });
    expect(result[0][1].type).toBe("string");
    expect(result[1][1].type).toBe("number");
    expect(result[2][1].type).toBe("boolean");
  });

  it("parses array schema", () => {
    const schema = {
      type: "object",
      properties: {
        arr: {
          type: "array",
          items: { type: "string" },
        },
      },
    };
    const str = JSON.stringify(schema);
    const result = jsonSchemaParse(str, { arr: ["a", "b"] });
    expect(result[0][1].type).toBe("array");
    expect(result[0][1].itemsSchema.type).toBe("string");
  });

  it("parses enum schema", () => {
    const schema = {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["a", "b", "c"],
        },
      },
    };
    const str = JSON.stringify(schema);
    const result = jsonSchemaParse(str, { status: "a" });
    expect(result[0][1].enum).toEqual(["a", "b", "c"]);
    expect(result[0][1].value).toBe("a");
  });

  it("parses object with additionalProperties: false", () => {
    const schema = {
      type: "object",
      additionalProperties: false,
    };
    const result = parseJsonSchema(schema, schema, {}, {});
    expect(result.children).toEqual([]);
  });

  it("parses object with additionalProperties: true", () => {
    const schema = {
      type: "object",
      additionalProperties: true,
    };
    const result = parseJsonSchema(schema, schema, {}, {});
    expect(result.children[0].isAdditionalProperties).toBe(true);
    expect(result.children[0].valueSchema.type).toBe("any");
  });

  it("parses object with additionalProperties as schema", () => {
    const schema = {
      type: "object",
      additionalProperties: { type: "number" },
    };
    const result = parseJsonSchema(schema, schema, {}, {});
    expect(result.children[0].isAdditionalProperties).toBe(true);
    expect(result.children[0].valueSchema.type).toBe("number");
  });

  it("parses primitive types", () => {
    const schema = { type: "string" };
    const result = parseJsonSchema(schema, schema, {}, "abc");
    expect(result.type).toBe("string");
    expect(result.value).toBe("abc");
  });

  it("returns [] if no properties", () => {
    expect(jsonSchemaParse("{}", undefined)).toEqual([]);
    expect(jsonSchemaParse(undefined, undefined)).toEqual([]);
  });
}); 
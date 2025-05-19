import { DEFAULT_NULL_VALUE } from "../constants/common";
import { it, expect, describe } from "vitest";

describe("DEFAULT_NULL_VALUE", () => {
  it('should be equal to "--"', () => {
    expect(DEFAULT_NULL_VALUE).toBe("--");
  });
});

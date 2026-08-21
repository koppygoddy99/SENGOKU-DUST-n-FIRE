import { describe, expect, it } from "vitest";
import { INTERACTIVE_PROVINCES } from "./provinceMapData";

describe("interactive province catalog", () => {
  it("covers the 68 pre-Meiji province labels with unique ids and usable map coordinates", () => {
    expect(INTERACTIVE_PROVINCES).toHaveLength(68);
    expect(new Set(INTERACTIVE_PROVINCES.map((province) => province.id)).size).toBe(68);
    for (const province of INTERACTIVE_PROVINCES) {
      expect(province.en).not.toHaveLength(0);
      expect(province.th).not.toHaveLength(0);
      expect(province.jp).not.toHaveLength(0);
      expect(province.x).toBeGreaterThanOrEqual(0);
      expect(province.x).toBeLessThanOrEqual(100);
      expect(province.y).toBeGreaterThanOrEqual(0);
      expect(province.y).toBeLessThanOrEqual(100);
    }
  });
});

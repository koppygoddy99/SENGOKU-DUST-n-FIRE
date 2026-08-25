import { describe, expect, it } from "vitest";
import { managementMenuFor } from "./Home";

describe("managementMenuFor", () => {
  it("shows only the six player-appropriate management pages without exposing administrator items", () => {
    const items = managementMenuFor(false).flatMap((section) => section.items);
    expect(items.map((item) => item.id)).toEqual(["profile", "usage", "billing", "app-settings", "guides", "privacy"]);
    expect(items.find((item) => item.id === "admin")).toBeUndefined();
    expect(items.find((item) => item.id === "access")).toBeUndefined();
  });

  it("exposes the three staff-only pages only for an admin identity", () => {
    const items = managementMenuFor(true).flatMap((section) => section.items);
    expect(items).toHaveLength(9);
    expect(items.find((item) => item.id === "analytics")).toMatchObject({ audience: "admin" });
    expect(items.find((item) => item.id === "admin")).toMatchObject({ audience: "admin" });
    expect(items.find((item) => item.id === "access")).toMatchObject({ audience: "admin" });
  });
});

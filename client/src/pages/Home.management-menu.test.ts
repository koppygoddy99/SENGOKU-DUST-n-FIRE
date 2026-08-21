import { describe, expect, it } from "vitest";
import { managementMenuFor } from "./Home";

describe("managementMenuFor", () => {
  it("keeps account and workspace structure visible without exposing staff routes to players", () => {
    const items = managementMenuFor(false).flatMap((section) => section.items);
    expect(items.map((item) => item.id)).toEqual(expect.arrayContaining(["profile", "usage", "billing", "app-settings", "access", "analytics", "admin", "guides", "privacy"]));
    expect(items.find((item) => item.id === "admin")).toMatchObject({ state: "planned", href: undefined });
  });

  it("exposes staff analytics and the admin console only for an admin identity", () => {
    const items = managementMenuFor(true).flatMap((section) => section.items);
    expect(items.find((item) => item.id === "analytics")).toMatchObject({ state: "ready", href: "/admin/operations" });
    expect(items.find((item) => item.id === "admin")).toMatchObject({ state: "ready", href: "/admin" });
  });
});

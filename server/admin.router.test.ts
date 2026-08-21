import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(role: "admin" | "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: `${role}-account`,
      email: `${role}@example.test`,
      name: role,
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin.overview", () => {
  it("returns implementation facts only to administrators", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const overview = await caller.admin.overview();

    expect(overview.product.mode).toContain("local-first");
    expect(overview.systems).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "rules", status: "ready" }),
      expect.objectContaining({ id: "drive-backup", status: "planned" }),
    ]));
  });

  it("refuses overview access to ordinary players", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.admin.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("exposes timeline catalog facts and honest operations states only to administrators", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const [timeline, operations] = await Promise.all([caller.admin.timeline(), caller.admin.operations()]);

    expect(timeline.reviewedYears).toEqual(expect.arrayContaining([1569, 1570]));
    expect(timeline.recordCount).toBeGreaterThan(0);
    expect(operations.visitorAnalytics).toMatchObject({ status: "not-configured" });
    expect(operations.playerData).toMatchObject({ status: "local-first" });
  });

  it("refuses timeline and operations facts to ordinary players", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.admin.timeline()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.operations()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

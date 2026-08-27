import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserTrialCredits: vi.fn(),
  spendUserTrialCredits: vi.fn(),
}));

vi.mock("./db", async (importOriginal) => {
  const original = await importOriginal<typeof import("./db")>();
  return { ...original, getUserTrialCredits: mocks.getUserTrialCredits, spendUserTrialCredits: mocks.spendUserTrialCredits };
});

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { isStarterProfileSelectionValid, selectServerStarterProfile } from "./starterProfiles";
import { STARTER_ERAS, STARTER_TEMPLATES } from "../client/src/lib/game";

function authContext(): TrpcContext {
  return {
    user: { id: 7, openId: "credit-test-user", email: "credit@example.com", name: "Credit Test", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("profile credit router", () => {
  it("reports the 50-credit trial balance associated with the authenticated user", async () => {
    mocks.getUserTrialCredits.mockResolvedValueOnce(50);
    await expect(appRouter.createCaller(authContext()).profile.credits()).resolves.toEqual({ credits: 50 });
    expect(mocks.getUserTrialCredits).toHaveBeenCalledWith(7);
  });

  it("spends a credit only from the authenticated user's own balance", async () => {
    mocks.spendUserTrialCredits.mockResolvedValueOnce(49);
    await expect(appRouter.createCaller(authContext()).profile.spendCredit({ amount: 1 })).resolves.toEqual({ credits: 49 });
    expect(mocks.spendUserTrialCredits).toHaveBeenCalledWith(7, 1);
  });
});

describe("starter.selectProfile", () => {
  it("returns only one deterministic opening profile for an era, occupation, and seed", async () => {
    const caller = appRouter.createCaller(authContext());
    const first = await caller.starter.selectProfile({ eraId: "late-unification", templateId: "sakai_boat_crew", seed: 1588 });
    const second = await caller.starter.selectProfile({ eraId: "late-unification", templateId: "sakai_boat_crew", seed: 1588 });
    expect(first).toEqual(second);
    expect(first).toMatchObject({ id: "late-unification-sakai_boat_crew-2", year: 1583, region: "Izumi", location: "ซาไก แคว้นอิซุมิ" });
    expect(Object.keys(first).sort()).toEqual(["id", "location", "origin", "region", "variation", "year"]);
  });

  it("keeps every eligible server profile aligned with the client era years and compatible regions", () => {
    for (const era of STARTER_ERAS) {
      for (const template of STARTER_TEMPLATES.filter((entry) => era.templateIds.includes(entry.id))) {
        const profile = selectServerStarterProfile({ eraId: era.id, templateId: template.id, seed: 2_000_001 });
        expect(isStarterProfileSelectionValid(era.id, template.id)).toBe(true);
        expect(era.years).toContain(profile.year);
        expect(template.compatibleRegions).toContain(profile.region);
        expect(profile.location).toBe(template.start);
      }
    }
  });

  it("rejects an incompatible era/path pair and an invalid selection seed", async () => {
    const caller = appRouter.createCaller(authContext());
    await expect(caller.starter.selectProfile({ eraId: "late-unification", templateId: "village_scribe", seed: 9 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.starter.selectProfile({ eraId: "late-unification", templateId: "sakai_boat_crew", seed: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

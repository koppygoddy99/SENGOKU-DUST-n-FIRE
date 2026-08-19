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

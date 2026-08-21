import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = { user: null, req: { protocol: "https", headers: {} }, res: {} } as TrpcContext;

describe("timeline.forCampaign", () => {
  it("returns source-linked read-only records with relevance for a requested campaign year and region", async () => {
    const caller = appRouter.createCaller(context);
    const result = await caller.timeline.forCampaign({ year: 1570, region: "Omi" });

    expect(result.boundary).toContain("never mutate rolls");
    expect(result.records).toEqual(expect.arrayContaining([expect.objectContaining({ id: "1570-anegawa", relevance: "regional", source: expect.objectContaining({ url: expect.stringContaining("ufirst.jp") }) })]));
  });
});

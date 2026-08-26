import { describe, expect, it } from "vitest";
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { buildTimelineOperationsFacts } from "./timeline";

const context = { user: null, req: { protocol: "https", headers: {} }, res: {} } as TrpcContext;

describe("timeline.forCampaign", () => {
  it("returns source-linked read-only records with relevance for a requested campaign year and region", async () => {
    const caller = appRouter.createCaller(context);
    const result = await caller.timeline.forCampaign({ year: 1570, region: "Omi" });

    expect(result.boundary).toContain("never mutate rolls");
    expect(result.records).toEqual(expect.arrayContaining([expect.objectContaining({ id: "1570-anegawa", relevance: "regional", source: expect.objectContaining({ url: expect.stringContaining("ufirst.jp") }) })]));
    expect(result.ledger).toMatchObject({ year: 1570, status: "reviewed-events" });
  });

  it("publishes finite offline range and distinguishes 66 provinces from the two island provinces", async () => {
    const result = buildTimelineOperationsFacts();
    expect(result.ledgerRange).toEqual({ first: 1467, last: 1615, count: 149 });
    expect(result.coverageSet.provinces).toHaveLength(66);
    expect(result.coverageSet.islandProvinces).toEqual(["iki", "tsushima"]);
    expect(result.policy).toContain("unreviewed years");
  });
});

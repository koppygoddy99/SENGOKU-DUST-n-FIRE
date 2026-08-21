import { describe, expect, it } from "vitest";
import { campaignRewardContext } from "./Home";
import type { GameState } from "@/lib/game";

const gameWithReward = {
  rolls: [{ reward: "A sealed river permit" }],
  missions: [],
} as unknown as GameState;

const gameWithoutReward = {
  rolls: [],
  missions: [],
} as unknown as GameState;

describe("campaign ledger reward context", () => {
  it("returns the latest resolved reward for every view that shares the campaign ledger", () => {
    expect(campaignRewardContext(gameWithReward, "en")).toContain("A sealed river permit");
    expect(campaignRewardContext(gameWithReward, "th")).toContain("รางวัลล่าสุด");
  });

  it("states the honest empty condition instead of inventing a reward", () => {
    expect(campaignRewardContext(gameWithoutReward, "en")).toContain("No reward");
  });
});

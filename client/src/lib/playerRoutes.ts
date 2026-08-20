export type PlayerPageId =
  | "home"
  | "campaigns"
  | "start"
  | "play"
  | "missions"
  | "market"
  | "localmarket"
  | "gear"
  | "services"
  | "obligations"
  | "exchanges"
  | "character"
  | "log"
  | "archive"
  | "save"
  | "load"
  | "settings";

export type ReviewSeedId =
  | "saika-library"
  | "new-campaign-step-one"
  | "saika-command"
  | "saika-pre-roll"
  | "saika-missions"
  | "saika-gear"
  | "saika-market"
  | "saika-services"
  | "saika-obligations"
  | "saika-exchanges"
  | "saika-character"
  | "saika-chronicle"
  | "saika-archive"
  | "saika-safekeeping"
  | "saika-load"
  | "saika-settings";

export type ReviewScreen = {
  page: PlayerPageId;
  reviewQuery: string;
  screenshotFile: string;
  pageTitle: string;
  seed: ReviewSeedId;
  reader?: "library" | "reader";
};

/**
 * Single source of truth for screenshot review. A capture is valid only when
 * the query, rendered heading, seed state, and file name all match this row.
 */
export const REVIEW_SCREEN_MANIFEST: readonly ReviewScreen[] = [
  { page: "campaigns", reviewQuery: "campaigns", screenshotFile: "01-campaign-library.png", pageTitle: "Campaign Library", seed: "saika-library" },
  { page: "start", reviewQuery: "start", screenshotFile: "02-new-campaign.png", pageTitle: "New Campaign", seed: "new-campaign-step-one" },
  { page: "home", reviewQuery: "home", screenshotFile: "03-campaign-command.png", pageTitle: "Campaign Command", seed: "saika-command" },
  { page: "play", reviewQuery: "play", screenshotFile: "04-play-scene.png", pageTitle: "Play Scene", seed: "saika-pre-roll" },
  { page: "missions", reviewQuery: "missions", screenshotFile: "05-missions.png", pageTitle: "Missions", seed: "saika-missions" },
  { page: "gear", reviewQuery: "gear", screenshotFile: "06-gear.png", pageTitle: "Carried Gear", seed: "saika-gear" },
  { page: "market", reviewQuery: "market", screenshotFile: "07-market.png", pageTitle: "This Market", seed: "saika-market" },
  { page: "services", reviewQuery: "services", screenshotFile: "08-services.png", pageTitle: "Services & Hands", seed: "saika-services" },
  { page: "obligations", reviewQuery: "obligations", screenshotFile: "09-debts-favors.png", pageTitle: "Debts & Favors", seed: "saika-obligations" },
  { page: "exchanges", reviewQuery: "exchanges", screenshotFile: "10-exchange-history.png", pageTitle: "Exchange History", seed: "saika-exchanges" },
  { page: "character", reviewQuery: "character", screenshotFile: "11-character.png", pageTitle: "Character Dossier", seed: "saika-character" },
  { page: "log", reviewQuery: "log", screenshotFile: "12-chronicle.png", pageTitle: "Chronicle", seed: "saika-chronicle", reader: "library" },
  { page: "archive", reviewQuery: "archive", screenshotFile: "13-world-archive.png", pageTitle: "World Archive", seed: "saika-archive" },
  { page: "save", reviewQuery: "save", screenshotFile: "14-save-game.png", pageTitle: "Campaign Safekeeping", seed: "saika-safekeeping" },
  { page: "load", reviewQuery: "load", screenshotFile: "15-load-game.png", pageTitle: "Return to a Recorded Leaf", seed: "saika-load" },
  { page: "settings", reviewQuery: "settings", screenshotFile: "16-settings.png", pageTitle: "Arrange Your Reading Room", seed: "saika-settings" },
] as const;

const reviewPageIds = new Set<PlayerPageId>(REVIEW_SCREEN_MANIFEST.map((screen) => screen.page));

export function reviewPageFromSearch(search: string): PlayerPageId {
  const requested = new URLSearchParams(search).get("review") as PlayerPageId | null;
  return requested && reviewPageIds.has(requested) ? requested : "home";
}

export function reviewScreenFor(page: PlayerPageId): ReviewScreen | undefined {
  return REVIEW_SCREEN_MANIFEST.find((screen) => screen.page === page);
}

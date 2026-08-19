/**
 * Curated social-history fact cards for Dust & Fire.
 *
 * These cards describe structural context, not universal rules. The GM must
 * apply their regional and temporal gates before presenting any card as fact.
 * Campaign fiction must never be cited as a historical fact.
 */

export type HistoricalConfidence = "structural" | "contextual" | "requires-local-source";

export type SengokuSocialFact = {
  id: string;
  domains: Array<"household" | "market" | "travel" | "faith" | "war" | "language" | "status" | "season" | "health" | "maritime">;
  era: { start: number; end: number };
  regions: string[];
  confidence: HistoricalConfidence;
  claim: string;
  gmUse: string;
  prohibition: string;
  sourceIds: string[];
};

export const sengokuSocialFacts: SengokuSocialFact[] = [
  {
    id: "market-rights-and-brokers",
    domains: ["market", "travel"],
    era: { start: 1467, end: 1600 },
    regions: ["Tōkai", "adjacent overland and water networks"],
    confidence: "contextual",
    claim: "Markets and lodging places linked rulers, merchants, residents, and land-and-water travel. Changes in political control could require prior rights and arrangements to be reconfirmed.",
    gmUse: "Give a market an identifiable right-holder, toll, guarantor, inspector, or rule; make a route choice affect time, news, cost, and contacts.",
    prohibition: "Do not present all markets as free markets or apply Rakuichi-rakuza as a nationwide default.",
    sourceIds: ["J-01"],
  },
  {
    id: "household-as-social-unit",
    domains: ["household", "status"],
    era: { start: 1450, end: 1600 },
    regions: ["late-medieval Japan; class-specific evidence"],
    confidence: "structural",
    claim: "The ie household functioned as a basic social unit, but labour, representation, property, and care arrangements varied by class and evidence.",
    gmUse: "Treat dependants, work, debt, care, household reputation, and succession as linked stakes when a player describes their background.",
    prohibition: "Do not prescribe a universal household or gender role; do not declare marriage or inheritance law without a regional case.",
    sourceIds: ["E-01", "J-03"],
  },
  {
    id: "war-is-negotiated-labour",
    domains: ["war", "household", "market"],
    era: { start: 1467, end: 1600 },
    regions: ["Japan; local variation is decisive"],
    confidence: "structural",
    claim: "Military mobilisation varied by place and authority. Local communities and leaders could negotiate, delay, avoid, or condition their response to wartime demands.",
    gmUse: "Show war through transport, provisions, labour, taxes, closed routes, and absent hands before a battlefield appears.",
    prohibition: "Do not make every household obey a daimyo command instantly or imply every armed person is a full-time samurai.",
    sourceIds: ["J-06"],
  },
  {
    id: "temples-and-ikki-are-not-monoliths",
    domains: ["faith", "status", "war"],
    era: { start: 1470, end: 1600 },
    regions: ["Ikkō-ikki networks; region-specific application required"],
    confidence: "contextual",
    claim: "Institutional religious interests, local leaders, and followers in Ikkō-ikki networks could align or conflict; they cannot be reduced to one peasant-rebel bloc.",
    gmUse: "Ask who controls land, grain, records, protection, or mediation before writing a temple scene.",
    prohibition: "Do not write temples as uniformly benevolent or Ikkō-ikki as a faceless crowd.",
    sourceIds: ["E-02", "J-05"],
  },
  {
    id: "plural-payment-media",
    domains: ["market", "maritime"],
    era: { start: 1450, end: 1600 },
    regions: ["Japan; local and chronological differences apply"],
    confidence: "structural",
    claim: "Late-medieval exchange could involve imported coins, goods, rice, silver, gold, regional issues, and documentary credit; coin selection and acceptance could be contested.",
    gmUse: "Let payment media, inspection, guarantors, transport, and documentary proof shape an exchange or reward.",
    prohibition: "Do not use one stable currency across the map or treat koku as universal cash.",
    sourceIds: ["J-07"],
  },
  {
    id: "documentary-credit",
    domains: ["market", "language", "travel"],
    era: { start: 1350, end: 1525 },
    regions: ["long-distance exchange networks"],
    confidence: "contextual",
    claim: "The currency museum describes warifu as a documentary mechanism used for long-distance remittance or settlement in the medieval period.",
    gmUse: "Use paired documents, seal checks, guarantors, and duplicate copies as playable evidence rather than generic quest items.",
    prohibition: "Do not invent a modern bank-like system or assign fixed conversion rates without a local source.",
    sourceIds: ["J-07"],
  },
  {
    id: "seasonal-risk-needs-place-and-year",
    domains: ["season", "travel", "market", "health"],
    era: { start: 900, end: 1700 },
    regions: ["Japan; event records are time- and place-bound"],
    confidence: "structural",
    claim: "Medieval records document weather disasters, crop damage, famine, epidemics, and other environmental events with varying dates and geographic scope, but individual records require source criticism.",
    gmUse: "Use season as context for routes, supplies, pricing, and labour. Use a named disaster only when the campaign year and place match a cited fact card.",
    prohibition: "Do not randomise a major real disaster merely for colour or present a fictional event as recorded history.",
    sourceIds: ["J-08"],
  },
  {
    id: "status-is-not-edo-four-classes",
    domains: ["status", "household", "market"],
    era: { start: 1185, end: 1600 },
    regions: ["medieval Japan; political authority varied"],
    confidence: "structural",
    claim: "Medieval status relations were complex and not nationally uniform because courtly, warrior, and religious authorities each maintained their own relations of status and power.",
    gmUse: "Describe a person through protection, duty, work, place, kin, and rights rather than a single social-rank ladder.",
    prohibition: "Do not use the Edo four-class hierarchy as a default Sengoku character menu; do not turn marginalisation into a reward mechanic.",
    sourceIds: ["J-09"],
  },
  {
    id: "historical-language-is-not-modern-japanese",
    domains: ["language", "status"],
    era: { start: 1467, end: 1600 },
    regions: ["Japan; dialect and register vary"],
    confidence: "structural",
    claim: "Vocabulary, grammar, and meanings in the Sengoku period differed from modern Japanese; modern concepts and institutions should not be projected backward without explanation.",
    gmUse: "Write clear Thai or English with an appropriate relationship register, and explain historical terms in UI rather than imitating obsolete Japanese.",
    prohibition: "Do not manufacture archaic Japanese dialogue, or inject later state, class, or technology concepts as period speech.",
    sourceIds: ["J-04"],
  },
  {
    id: "oaths-documents-and-witnesses",
    domains: ["language", "status", "faith"],
    era: { start: 1467, end: 1600 },
    regions: ["Japan; specific documentary practice remains local"],
    confidence: "structural",
    claim: "Sengoku-era documentary culture includes vows, letters, copies, seals, and temple-related records, making authorship, possession, and witnessing socially consequential.",
    gmUse: "Track who issued a document, who holds a copy, who witnessed it, and whose name or seal supports a claim.",
    prohibition: "Do not invent a precise legal effect or seal protocol for a region without a local source.",
    sourceIds: ["J-05"],
  },
  {
    id: "religious-trade-mediators",
    domains: ["maritime", "faith", "language", "market"],
    era: { start: 1450, end: 1600 },
    regions: ["Japanese maritime and external trade networks"],
    confidence: "contextual",
    claim: "Studies of late-medieval foreign trade foreground religious and literate intermediaries, language, institutional sponsorship, and trust as part of commercial exchange.",
    gmUse: "Make translators, scribes, brokers, religious contacts, and guarantors consequential NPCs in port or foreign-trade scenes.",
    prohibition: "Do not place foreign goods, foreign visitors, or firearms in every settlement; gate them by coast, year, and network.",
    sourceIds: ["J-10"],
  },
  {
    id: "health-and-ritual-are-historically-entangled",
    domains: ["health", "faith"],
    era: { start: 1185, end: 1600 },
    regions: ["pre-modern Japan; evidence varies"],
    confidence: "requires-local-source",
    claim: "Research on pre-modern Japan treats healing, religious specialists, ritual, and ideas about illness as historically connected while also emphasising evidentiary gaps.",
    gmUse: "Let an NPC seek a healer, medicine, temple, ritual, or family care as culturally situated choices. Keep the game’s wound and focus tracks clearly abstract.",
    prohibition: "Do not diagnose real disease, guarantee treatment, or present ritual as medically proven.",
    sourceIds: ["J-11", "J-08"],
  },
];

export const historicalSourceCatalog = {
  "J-01": "https://aichiu.repo.nii.ac.jp/record/10855/files/%E5%AD%A6%E4%BD%8D%E8%AB%96%E6%96%87%E5%86%85%E5%AE%B9%E8%A6%81%E6%97%A8%EF%BC%8815DL1602%E3%80%80%E5%B1%B1%E4%B8%8B%E3%80%80%E6%99%BA%E4%B9%9F%EF%BC%89.pdf",
  "E-01": "https://doi.org/10.1017/S1479591406000325",
  "J-03": "https://www.archives.go.jp/exhibition/digital/rekishitomonogatari/contents/category08.html",
  "J-04": "https://kotoba.ninjal.ac.jp/qa/yokuaru/qa-36/",
  "J-05": "https://www.archives.go.jp/exhibition/digital/rekishitomonogatari/contents/category08.html",
  "J-06": "https://omu.repo.nii.ac.jp/record/2003043/files/2025000257.pdf",
  "J-07": "https://www.imes.boj.or.jp/cm/history/content/",
  "J-08": "https://www.hi.u-tokyo.ac.jp/collection/digitalgallery/disaster_events/about",
  "J-09": "https://museum.bunmori.tokushima.jp/hasegawa/manyu/mibun.htm",
  "J-10": "https://hirosaki.repo.nii.ac.jp/record/2676/files/Crossroads_2_9.pdf",
  "J-11": "https://kaken.nii.ac.jp/ja/grant/KAKENHI-PROJECT-16K02217/",
  "E-02": "https://rijs.fas.harvard.edu/publications/war-and-faith-ikko-ikki-late-muromachi-japan",
} as const;

# Gameplay Decisions Registry — SENGOKU-DUST-n-FIRE

This file is shared project knowledge, **not a rule file**. (Normative workflow and
authority rules stay in the sibling `.clinerules/` files.)

## Purpose

Record gameplay rules that are **explicitly established** by one or more
authoritative sources:

- explicit user requirements
- authoritative project documentation
- authoritative tests (those that assert a rule with a concrete value, not
  tests that merely smoke-test implementation behavior)
- clearly approved design decisions

### What counts as authoritative

- `docs/dust-fire-core-game-source-of-truth-th.md` — labeled "คอร์เกมฉบับ Source of
  Truth สำหรับ AI GM, หลังบ้าน และทีมพัฒนา"; Section 14 marks rules as
  `ใช้งานจริง` ("in use / real").
- `README.md` — the player-facing "กติกา 2d12" section and DN tables.
- Tests that assert specific numbers/probabilities as intended balance (e.g.
  `game.difficulty-balance.test.ts`).

### What does NOT count

- "Existing code behavior alone" is not automatically an approved gameplay rule.
  A code constant with no documenting evidence stays **UNDECIDED**.
- Proposal text, staged data, fixtures, and UI/demo surfaces alone do not
  establish a rule.

### Status meanings

- **CONFIRMED** — the intended rule is explicitly supported by an authoritative
  source listed above.
- **UNDECIDED** — evidence is insufficient, ambiguous, or absent; the specific
  gameplay decision is not established and must not be guessed.

---

## Registry

### 1. Core dice resolution

| Decision | Source / Evidence | Status | Notes |
|---|---|---|---|
| Dice are 2d12 (two twelve-sided dice) | README §"กติกา 2d12" ("ทอย 2d12"); source-of-truth §3/§14 | CONFIRMED | |
| Roll total = 2d12 + Trait value + Mastery bonus + Context bonus + Flaw bonus | README §"กติกา 2d12" (`total = baseDice + statValue + masteryBonus + contextBonus + flawBonus`) | CONFIRMED | |
| Dice range 2–24; no Momentum mechanic in state/roll | README table + source-of-truth §14 | CONFIRMED | |

### 2. Stats (Traits)

| Decision | Source / Evidence | Status | Notes |
|---|---|---|---|
| Five stats: body(Strength), hand(Finesse), wit(Instinct), mind(Insight), heart(Grit) | README §"คุณสมบัติตัวละครทั้งห้าแกน" table | CONFIRMED | |
| Stat value range 1–10 | README table; source-of-truth §14 ("Trait อยู่ 1–10") | CONFIRMED | `engine.ts` MIN/MAX_STAT_VALUE=1/10 codify this. |
| Trait Progress thresholds: 3 at Level 1, 4 at 2–4, 5 at 5–6, 6 at 7–8; Level 10 cap | source-of-truth §3; test `game.progression.test.ts` | CONFIRMED | |

### 3. Progression (Trait/Mastery)

| Decision | Source / Evidence | Status | Notes |
|---|---|---|---|
| Progress per roll capped at +2 (decisive success ceiling) | source-of-truth §3 | CONFIRMED | |
| DN 8 and Special-item pass award no Trait/Mastery Progress | source-of-truth §3 | CONFIRMED | |
| Mastery Level range 0–5; Level 5 is the maximum | README update + source-of-truth §14; `engine.ts` MAX_MASTERY_LEVEL=5 | CONFIRMED | |
| One Mastery level costs 5 Progress | source-of-truth §3; test asserts `xpNeededForMasteryLevel(4)=5` | CONFIRMED | |
| Trait level requires accumulating Progress via `traitProgressNeededForLevel` | source-of-truth §3; test `game.progression.test.ts` | CONFIRMED | |
| Mission reward granted once per mission (guarded by `rewardGranted`) | source-of-truth §8; test asserts `rewardGranted: true` | CONFIRMED | |

### 4. Difficulty (DN)

| Decision | Source / Evidence | Status | Notes |
|---|---|---|---|
| Canonical DN table: 8, 12, 16, 20, 24, 28, 32 | README §"DN ที่ใช้งานจริง" table; test asserts ladder | CONFIRMED | |
| DN bucket thresholds: ≤10→8, ≤14→12, ≤18→16, ≤22→20, ≤26→24, ≤30→28, else→32 | test `game.difficulty-balance.test.ts` | CONFIRMED | |
| DN 8 = casual/general (no XP/Practice) | README DN table | CONFIRMED | |
| DN 12 = ordinary/risky (start of XP/Practice) | README DN table | CONFIRMED | |
| DN 16 = challenging | README DN table | CONFIRMED | |
| DN 20 = obstacle/risky act | README DN table | CONFIRMED | |
| Context/Gear total bonus capped at +2 before resolution | source-of-truth §3 + §9.2 | CONFIRMED | |

### 5. Outcome tiers

| Decision | Source / Evidence | Status | Notes |
|---|---|---|---|
| Outcome by margin = total − DN: ≥5 decisive, ≥0 success, ≥−4 partial, else failure | test `game.difficulty-balance.test.ts`; README outcome table | CONFIRMED | |

### 6. Flaw

| Decision | Source / Evidence | Status | Notes |
|---|---|---|---|
| Flaw penalty is −2 when accepted | README table; source-of-truth §3 | CONFIRMED | |

### 7. Time, age, Leaf

| Decision | Source / Evidence | Status | Notes |
|---|---|---|---|
| Leaf advances only after accumulating several days (not every roll) | source-of-truth §6.1 (`daysSinceLeaf >= 4`); test asserts 8 decisive rolls open Leaf 2 | CONFIRMED | |
| Age increments only when calendar crosses character's birth season in a later campaign year | source-of-truth §6.2; test asserts age unchanged on same-year rolls | CONFIRMED | |

### 8. Social record

| Decision | Source / Evidence | Status | Notes |
|---|---|---|---|
| Four social axes: Honor, Influence, Information, Stain | README update; source-of-truth §14 | CONFIRMED | |
| Social caps: Honor 5, Influence 4, Information 5, Stain 5 | source-of-truth §14 + inline comment core.ts §Social Record | CONFIRMED | |
| 0.5 increments (2× difficulty); +0.5 per resolved Main/Side mission; Stain +1 on failure-with-consequence, −0.5 on mission resolved | inline design comment core.ts lines 586–594 | CONFIRMED | |
| "Information" axis removed from mechanism; field retained for future random-event use | core.ts comment ("ข่าวในมือ ... ถูกตัดออกจากกลไกแล้ว") | CONFIRMED | |

### 9. Economy / currency

| Decision | Source / Evidence | Status | Notes |
|---|---|---|---|
| Currency unit `mon`; single wallet (no 3-tier Mon yet) | source-of-truth §9; systems-status §R18 | CONFIRMED | 3-tier wallet explicitly NOT integrated (R37 [NOT FOUND]) |
| Debt/credit modeled as a resource; obligations support non-currency payment (goods/bullets/labor) | README §"สิ่งที่โลกจำ" ("หนี้" debt); source-of-truth §9.1 Credit resource; §8.3 debt as consequence/reward | CONFIRMED | |

### 10. Inventory & equipment

| Decision | Source / Evidence | Status | Notes |
|---|---|---|---|
| Inventory categories: immediate, reserve, equipment, document, status, bond | source-of-truth §9.2 | CONFIRMED | |
| Total bonus from items/context capped at +2 before roll resolution | source-of-truth §3 + §9.2 | CONFIRMED | |
| Special items trigger DN 0 / automatic pass only when action matches item tags | source-of-truth §9.2 | CONFIRMED | |

### 11. Missions

| Decision | Source / Evidence | Status | Notes |
|---|---|---|---|
| Mission states: offered → active → resolved; retired/superseded for replaced thread; history never deleted | source-of-truth §8.1 state table | CONFIRMED | |
| Missions advance automatically from roll/outcome; player does not press accept/complete | source-of-truth §8 | CONFIRMED | |
| Replacing a mission thread raises its daily progress `required` to 3 (elevated challenge) | test `game.mission-threads.test.ts` asserts `progress: { required: 3 }` | CONFIRMED | |
| Mission proposal must pass canon-consistency check; violative proposal rejected, no state change | test `game.mission-threads.test.ts` | CONFIRMED | |
| At most two visible side leads; side leads hidden until revealed | test `game.mission-threads.test.ts` | CONFIRMED | |

### 12. Vitals (Blood / Focus)

| Decision | Source / Evidence | Status | Notes |
|---|---|---|---|
| Player has Blood and Focus (not wounds); default max 6, hard cap 10 | README update + source-of-truth §14; test asserts default 6 then caps at 10 | CONFIRMED | |
| Vital changes clamped to 0..max | test `vitals.progression.test.ts` (±99 → 0 / max) | CONFIRMED | |
| One milestone point spent raises one vital cap by +1 and restores 1 current point | test asserts `levelUpVital("max_focus") → maxFocus 7, focus 4` | CONFIRMED | |
| Milestone reward granted once per milestone_id | test asserts second call with same id does not increment | CONFIRMED | |

### 13. Relationships / faction stance

| Decision | Source / Evidence | Status | Notes |
|---|---|---|---|
| Saved relationship state is public-only: familiarity (0–5), affinity (−3..3); private dossier/internalCore/gmGuidance stripped on save | test `game.relationships.test.ts` | CONFIRMED | |
| Four canonical Saika contacts (gantaro, tokichi, masakichi, genshiro) seed the Saika campaign | test `game.relationships.test.ts` (exact contactId order) | CONFIRMED | |

### 14. Undecided / partially evidenced

These items exist in code but have **insufficient authoritative documentation** to be CONFIRMED
as approved gameplay rules. Recorded as UNDECIDED so they are not guessed.

| System | Gap | Status | Notes |
|---|---|---|---|
| Faction stance score numeric mapping | Only `stanceScore` switch in core.ts gives numbers; no value documented in README or source-of-truth as a rule | UNDECIDED | |
| Local Heat numeric levels and effects | Heat exists in code/data; levels/effects not documented as rules | UNDECIDED | |
| Relationship affinity change rates on roll | Projection code exists; exact +/− per action not documented | UNDECIDED | |
| Random event trigger rate / selection weight | 45 events in `shared/data/random-events.json`; distribution/rate not specified | UNDECIDED | README says "consistent with season/time/place" but not rates |
| Starting character vitals/currency/condition values | Only code defaults visible in fixtures; no documented starting stat block | UNDECIDED | |
| Exact market prices beyond 1–3 mon fixtures | Prices hard-coded in `buildSaikaMarket`/`buildMarket`; README only frames "+1/2/3 mon" | UNDECIDED | |
| Per-offer `debtAllowed` flag governing debt purchases | Only present in code fixtures (`saika-rations`: debtAllowed: false); mechanism not documented as a rule | UNDECIDED | General debt concept is documented (row above); the flag itself is code-only |
| Social Record "Information" axis final behavior | core.ts comment says removed from mechanism; README lists it as an axis — ambiguous | UNDECIDED | See row above re: removed-from-mechanics with residual ambiguity |







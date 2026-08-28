# Power & Rumor Network — Phase 0 Audit Report

**วันที่:** 28 สิงหาคม 2026
**ผู้ทำ audit:** AI technical lead (workflow 8 ทีม)
**สถานะ:** รออนุมัติก่อนเข้า Phase 1
**ฐานโค้ด:** commit `f6cb62d` (Add Sengoku province data and Power Rumor research)

---

## 1. Runtime เดิมเก็บ state อยู่ที่ไหน

State หลักคือ `GameState` (type ใน `client/src/lib/game.ts` บรรทัด 370–387) เก็บแบบ local-first:

| ฟิลด์ | ประเภท | เก็บอะไร | เกี่ยวกับ Power/Rumor |
|---|---|---|---|
| `campaign` | `CampaignContext` | ปี/ฤดูกาล/แคว้น/เมือง/วัน (`warShadow`, `day`) | ใช้เป็น context ภูมิภาค+ฤดูกาล |
| `character` | `Character` | `vitals{wounds,focus}`, `attributes{body,hand,wit,mind,heart}`, `masteries[]`, `social{rank,honor,influence,information,stain}`, `resources` | เป็น source ของ status rail |
| `community` | `Community` | `food, labor, voice, safety, cohesion` | เป็น base ของ seasonal pressure |
| `currentScene` | `Scene` | `location`, `pressure`, `speaker`, `suggestedActions` | ใช้เป็น context สถานที่ |
| `missions` | `Mission[]` | state/progress/role/visibility/challenge | ภารกิจหลัก + side lead |
| `economy` | `EconomyState` | `routeStatus`, `sellerNetwork`, `services[]`, `obligations[]`, `transactions[]` | เป็นฐาน Heat/route/faction ฉบับแรก |
| `memories` | `WorldMemory[]` | `kind`, `title`, `detail`, `tick`, `tone` | ใช้สร้าง rumor board + NPC memory |
| `rolls` | `RollRecord[]` | ผลทอย + witness + consequence | event source สำคัญ |
| `relationships` | `PublicRelationshipContact[]` | faction/NPC สาธารณะ (gantaro/tokichi/...) | ฐาน faction reputation ฉบับแรก |
| `progression?` | `ProgressionState` | leaf/segment (day/night) | ใช้เทียบเวลา |
| `tick` | number | เลขหน้า/เหตุการณ์ | ใช้เป็น event id + ordering |

**สรุป:** ไม่มี `worldSystems` เลย — ต้องเพิ่มเป็น optional ตาม prompt (`GameState.worldSystems?: { schemaVersion: 1; powerRumor?: PowerRumorState }`).

---

## 2. `applyRoll()` เปลี่ยน state อย่างไร

ฟังก์ชัน `applyRoll(state, record)` (`game.ts` 1376–1421):
- รับ `RollRecord` (ที่ `resolveRoll` + UI สร้าง) → คืน `GameState` ใหม่ (immutable spread)
- เปลี่ยน: `character.vitals` (คงเดิมในโค้ดปัจจุบัน — การลดเลือด/สมาธิทำที่อื่น), `character.social.stain` (+1 ถ้า failure), `social.information` (+1 ถ้า partial), `progression`, `campaign` (เดินเวลา), `missions`, `economy.transactions`, `memories` (สร้าง memory ใหม่), `rolls`, `storyRecords`, `relationships`, `tick`
- **จุดเสียบ event adapter:** `applyRoll` สร้าง `memory` + `relationships` + `missionResult` แล้ว — ตรงนี้คือ canonical event source ที่ดีที่สุด ไม่ต้องสร้าง clock ใหม่

---

## 3. Save/Load และ normalization อยู่ที่ใด

- **Storage:** `client/src/pages/Home.tsx` — `STORAGE_KEY = "dust-fire-local-game-v3-saika"` (บรรทัด 67), เก็บ `{ game, saves, campaignLibrary, language, ... }` ใน localStorage (290)
- **Load:** อ่าน raw → ถ้า `schemaVersion === 2` ให้ `normalizeGameState(saved.game)` (266)
- **Normalize:** `normalizeGameState(state)` ใน `game.ts` (1032) — อัปเกรด legacy อย่าง deterministic (เชื่อม economy ถ้าไม่มี, legacy inventory bonus, canonicalDifficulty ของ rolls เก่า)
- **Local Trial:** `saveLocalTrialResult` / `openLocalPreview` ใน `client/src/features/shared/gameplayHelpers.ts`
- **จุด migration:** เพิ่มใน `normalizeGameState` — ถ้าไม่มี `worldSystems` ให้แต่งเป็น `{ schemaVersion: 1 }` (empty projection) แบบ idempotent

---

## 4. Campaign Command และ Story/Play render จาก state ส่วนใด

### Campaign Command = `Home.tsx` (main shell) + `StoryMap.tsx` (page === "home")
- Sidebar (`Home.tsx` 337–348) แสดง: `character.name/occupation`, `Vital` (wounds/focus), `memories.slice(-3)` เป็น state-pill
- Main แสดง `StoryMap` (แผนที่แคว้น + province brief)
- **จุดแทรก Power & Rumor:** เพิ่ม panel/section หลักใน `Home.tsx` main (ใต้ StoryMap) หรือเป็น card ใน sidebar — ไม่ต้องออกจากหน้า

### Story/Play = `PlayScene.tsx` (page === "play") + `ChronicleView.tsx` (page === "log" = เรื่องราว)
- `PlayScene.tsx` 40KB — มี two-column layout (prose ซ้าย, decision/ledger ขวา)
- `ChronicleView.tsx` (50 บรรทัด) — **ไม่มี status rail เลย** ตอนนี้ แสดงแค่ folio/time/place/active thread
- **จุดแทรก compact status:** `ChronicleView` เหมาะทำ persistent rail มากที่สุด (เพราะคือ "หน้าเล่นค่า") ส่วน PlayScene อาจเพิ่ม sidebar ขวาแบบยุบได้

---

## 5. AI GM รับ context จากที่ใด

- **Client → Server:** `toGMContext(game)` ใน `Home.tsx` (97–120) สร้าง object `{ campaign, character, currentScene, activeMission, ... }` ส่งเข้า `trpc`
- **Server:** `server/gm.ts` รับ context → เรียก `invokeLLM` ด้วย system prompt (108) ที่บังคับ DN bands + historical fence
- **Schema:** `shared/ai-gm.ts` กำหนด `roll` shape (`difficulty`, `summary`, ...)
- **จุดเสียบ AI retrieval:** เพิ่ม `powerRumorProjection` เข้า `toGMContext` แบบ filtered (player-visible เท่านั้น) — ไม่ส่ง world state ทั้งก้อน

---

## 6. จุดใดเหมาะกับ event adapter

1. **`applyRoll`** (game.ts 1376) — จุดสร้าง memory/relationship/mission → เสียบ `emitEvent("roll_resolved", ...)` แบบ read-only ก่อน
2. **`buyMarketOffer`** (game.ts 1423) — สร้าง transaction/obligation → `market_exchanged` / `debt_created`
3. **`normalizeGameState`** (game.ts 1032) — จุด migration ปลอดภัย
4. **`toGMContext`** (Home.tsx 97) — จุดส่ง projection ให้ AI
5. **`Home.tsx` sidebar/main** — จุด render Campaign Command เต็ม
6. **`ChronicleView.tsx`** — จุด render Story/Play compact status

---

## 7. จุดใดต้องเพิ่ม test ก่อน

- `normalizeGameState` ต้องมี test case: legacy save (ไม่มี `worldSystems`) → migrate → load → save → reload (ตาม prompt Accepts)
- `applyRoll` determinism ต้องไม่เปลี่ยน (มี `game.difficulty-balance.test.ts` แล้ว — ต้องรันผ่าน)
- projection builder ต้องมี unit test แยก (read-only จาก state)
- visibility filter ต้องมี test (ห้ามแสดง hidden truth)
- regression เดิม (`pnpm test` 35 files) ต้องผ่าน

---

## ข้อเสนอPhase 0 → รออนุมัติ

ผมเสนอเข้า **Phase 1 (Read-only adapter)** เป็นอันดับแรก:
1. เพิ่ม types `PowerRumorState`, `WorldSystemsFlags` ใน `game.ts` (ไม่เปลี่ยน GameState เดิม — ใส่ `worldSystems?` optional)
2. สร้าง `client/src/lib/powerRumor.ts` — projection builder อ่านจาก state ที่มีจริง (memories→rumors, social+relationships→faction stance, community+economy→seasonal/route, campaign→province/heat placeholder)
3. เพิ่ม migration ใน `normalizeGameState` (idempotent, legacy-safe)
4. เพิ่ม UI shell: panel ใน Campaign Command + compact rail ใน ChronicleView (ใช้ projection read-only)
5. เพิ่ม test: projection + migration + visibility

**ไม่เปิด feature flag ใดๆ ใน Phase 1** — แค่แสดง projection ที่คำนวณจากข้อมูลที่มีอยู่จริง

กรุณาอนุมัติ Phase 0 นี้และให้ไฟเขียวเข้า Phase 1 ครับ

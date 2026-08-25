# คู่มือทีม 3: Game Development — Dust & Fire: Sengoku Stories

## 1. พันธกิจของทีม

ทีม Game Development รับผิดชอบทำให้กติกาที่ทีมออกแบบกลายเป็น state transition ที่เชื่อถือได้ เล่นซ้ำได้ เซฟกลับมาได้ และไม่ขึ้นกับการตอบของ AI บทบาทของทีมไม่ใช่เพียงทำหน้าจอให้ “กดได้” แต่ต้องคุ้มครองความยุติธรรมของเกม: เต๋าต้อง deterministic, โบนัสต้องมีที่มา, รางวัลต้องให้ครั้งเดียว, เวลาไม่กระโดดผิดกติกา และ Local Save เก่าต้องไม่พังเมื่อ schema ขยาย

สถาปัตยกรรมปัจจุบันใช้ React และ TypeScript ฝั่ง client, Express กับ tRPC ฝั่ง server, Drizzle/MySQL สำหรับข้อมูล platform ที่จำเป็น, Manus OAuth สำหรับ identity และ built-in LLM สำหรับ AI GM แต่ **กติกา core ของการเล่นอยู่ฝั่ง client** เพื่อให้ Local Trial และ Local Save ทำงานต่อได้เมื่อ provider ไม่พร้อม

| ชั้น | Owner หลัก | หน้าที่ | ห้ามทำ |
|---|---|---|---|
| Game engine | `client/src/lib/game.ts` | parse, roll, outcome, progression, time, mission, reward | พึ่ง AI เพื่อให้ roll ถูกต้อง |
| Player state | Home + feature modules | เก็บ GameState, render, Local Save, campaign snapshots | สร้าง reward ลับใน UI |
| AI GM service | `server/gm.ts` และ router | วิเคราะห์/เขียนฉากตาม schema | เปลี่ยน total/outcome หรือ resource โดยตรง |
| Auth and admin | OAuth, `server/admin.ts` | identity, role gate, admin read-only data | เปิดข้อมูล admin ให้ผู้เล่นทั่วไป |
| Persistence | browser Local Save + optional server platform data | continuity และ migration | ลบ save เก่าเงียบ ๆ |

## 2. Source of Truth และโครงสร้างไฟล์

ก่อนแก้ระบบให้ค้นหา owner ของกติกาเสมอ การเปลี่ยนสูตรใน component เป็น bug design เพราะจะทำให้ Local Trial, AI GM และ test เห็นคนละโลก

| ความรับผิดชอบ | ไฟล์/โมดูลหลัก | กฎ |
|---|---|---|
| GameState และกติกา | `client/src/lib/game.ts` | ทุก state transition ผ่าน helper canonical |
| Shared player helpers | `client/src/features/shared/gameplayHelpers.ts` | ห้ามซ้ำ logic ของ fallback หรือ narrative split |
| Play UI | `client/src/features/play/PlayScene.tsx` | แสดง/เรียก engine; ไม่ตัดสิน outcome เอง |
| Campaign map | `client/src/features/story/StoryMap.tsx` | derive จาก GameState จริง |
| Chronicle | `client/src/features/chronicle/ChronicleView.tsx` | อ่าน Memory/Roll/Progression โดยไม่สร้าง record ใหม่ |
| Market | `client/src/pages/MarketHub.tsx` | เรียก economy helpers; ทุก exchange มี record |
| Player shell | `client/src/pages/Home.tsx` | route wiring, local persistence, feature composition |
| AI contracts | `server/gm.ts`, `server/routers.ts` | validate input/output และ fallback on failure |
| Admin | `server/admin.ts`, `client/src/pages/AdminConsole.tsx` | role gate ทั้ง server และ client |

## 3. GameState Contract

`GameState` เป็นหน่วย atomic ของแคมเปญ ทุกหน้าผู้เล่น derive จาก state เดียวกัน ไม่อนุญาตให้หน้าใดเก็บสำเนาของ mission, mastery หรือ economy แล้วแก้แยกจาก state กลาง

```ts
type GameState = {
  schemaVersion: number;
  credits: number;
  campaign: CampaignContext;
  character: Character;
  currentScene: Scene;
  missions: Mission[];
  memories: WorldMemory[];
  rolls: RollRecord[];
  economy: EconomyState;
  progression: ProgressionState;
  community: CommunityState;
  historicalBoundary?: HistoricalBoundary;
  tick: number;
};
```

ทุก field ที่เปลี่ยนต้องมีคำตอบว่าใครเป็น owner, เปลี่ยนเมื่อใด, save อย่างไร, migrate อย่างไร และ test อะไรคุ้มครอง ตัวอย่าง `character.masteries` เป็น owner ของ Step/XP; `progression` เป็น owner ของเวลา อายุ และ Leaf; `missions` เป็น owner ของ state/progress/rewardGranted; `rolls`, `memories`, `economy.exchanges` เป็นหลักฐาน provenance

### 3.1 Schema evolution and migration

ห้ามแก้ shape ของ state โดยเพิ่ม optional field แล้วหวังว่า UI จะ handle เอง ทุก migration ต้องเข้า `normalizeGameState()` และต้องไม่มีข้อมูลสำคัญหาย เช่น roll, inventory, mission, economy, manual save หรือโบนัส mastery เดิม

แนวทาง migration มีดังนี้: เพิ่ม `schemaVersion` เมื่อ shape เปลี่ยน, สร้าง default ที่มีความหมาย, normalize ชุดย่อยอย่าง defensive, preserve value เก่าหาก value ใหม่ยังไม่รู้, และเขียน regression ให้โหลด save เก่าจริงหรือ fixture ที่ใกล้เคียง กรณี mastery เก่าเคยเก็บโบนัส +1 ถึง +5 ให้ map เป็น Step 4/8/12/16/20 โดยไม่ลดโบนัส และเริ่ม XP 0 ของ step ที่ map ได้

## 4. Deterministic Resolution Engine

### 4.1 Canonical flow

`parseAction()` สร้าง preview จาก intent และ state; `resolveRoll()` สร้าง RollRecord; `applyRoll()` เป็นจุดเดียวที่ commit ผล การข้าม `applyRoll()` เพื่อแก้ UI เป็นข้อห้าม เพราะลำดับ progression, time, mission และ reward ต้อง atomic

```text
preview = parseAction(intent, game)
roll = resolveRoll(preview, game)
next = applyRoll(game, roll)
persist(next)
render(next)
```

สูตรที่ทุก implementation ต้องใช้คือ `d12 + d12 + traitValue + masteryLevel + context + flaw` โดย Trait เป็น Level 1–10 และบวกค่าจริง, `context` ถูก clamp 0..2, `flaw` เป็น 0/−2. `applyRoll()` ให้ Trait Progress เมื่อ DN ตั้งแต่ 12 และ action ใช้ Trait ตรง โดย decisive success ได้ +2; client canonicalizes DN ปกติเป็น 8/12/16/20/24/28/32. DN 0 เกิดได้เฉพาะจาก item `special` ที่ usable, action มี document/pass cue และ tags ตรงกัน. ทุก RollRecord final ต้องเก็บ dice, total, difficulty, margin, outcome, stat, mastery, reason และ timestamps/trace ที่จำเป็นต่อ Chronicle

### 4.2 applyRoll atomic sequence

ลำดับต่อไปนี้ห้ามสลับตามสะดวกของหน้าจอ: เพิ่ม roll/tick; ปรับ social/vitals/scene; คำนวณ Trait และ Mastery Progress (เฉพาะ DN ตั้งแต่ 12 ที่ไม่ใช่ special pass); เพิ่ม Trait Level ตาม threshold 3/4/5/6 และ Mastery Level เมื่อ Progress ครบ 5; สร้าง lastStatPractice/lastPractice; เดิน time/age; ตรวจ mission; ให้ reward และ agreement เฉพาะครั้งแรก; เพิ่ม memory; normalize; คืน state ใหม่ หากขั้นใด error ระหว่างพัฒนา ต้องไม่ persist state ครึ่งเดียว โดยเฉพาะ reward duplication และ mission resolve ซ้ำเป็น risk ระดับสูง

| Invariant | เหตุผล | Regression ที่ต้องมี |
|---|---|---|
| Mastery Level อยู่ 0–5 | ป้องกันโบนัสเกิน design | normalize/level-up test |
| Level 5 รับ Progress 0 | ป้องกัน farm ตอนเพดาน | practice test |
| Progress ต่อ roll ไม่เกิน 2 | รักษาจังหวะ progression | positive/negative outcome test |
| DN 8 และ special pass ไม่ได้ Progress | กัน routine/item bypass farm | low-DN and special-item test |
| Trait อยู่ 1–10 | ป้องกันโบนัสเกิน design | threshold/cap/migration test |
| ไม่มี Momentum ใน RollRecord | ป้องกันผลหลังทอยถูกแก้ | formula/state-shape test |
| Leaf ไม่เพิ่มทุก roll | รักษาจังหวะเรื่อง | multi-day test |
| age ไม่เพิ่มจาก roll | calendar semantics | birth-season crossing test |
| reward ได้ครั้งเดียว | ป้องกัน economy corruption | resolved-mission repeat test |
| Agreement มีข้อมูลครบ | ทำ provenance | counterpart/payment/witness/consequence test |

## 5. Progression, Time and Mission Implementation

`Mastery` ต้องเก็บ `level`, `xp`, `totalXp` และ metadata เดิม เช่น origin/tags/legacy `rank` ที่ compatibility ต้องรักษา. `masteryLevelDetails()` และ `xpNeededForMasteryLevel()` เป็น owner ของชื่อระดับ โบนัส และ Progress threshold; ห้าม hardcode label อีกชุดใน CharacterView หรือ PlayScene; component ต้อง import helper เดียวกัน

`ProgressionState` เก็บ `leaf`, `segment`, `timeMarksSinceLeaf`, `daysSinceLeaf`, `ageAtCampaignStart`, `currentAge`, `birthSeason`, `campaignStartYear` `advanceTime()` หรือ helper ที่เทียบเท่าต้องเป็น owner ของการข้าม dawn/day/dusk/night, day/season/year และ age transition

Mission matching ต้องใช้ action/roll context ที่ trace ได้ หากใช้ trigger phrase แบบ simple matching ให้ถือว่าเป็น vertical slice และต้องไม่อ้างว่าเป็น semantic mission graph เต็มรูปแบบ เมื่อ mission resolved ให้ `rewardGranted` lock ก่อนสร้าง reward/memory/agreement หาก reward build ล้มเหลวต้องไม่ set resolved แบบครึ่งเดียว

## 6. AI GM Integration and Local Trial

AI GM มีสอง operation: analyze และ resolve ทั้งสองต้องมี schema ชัด, server-side validation, timeout และ error normalization วิเคราะห์คืน axis, suggestedMastery, difficulty, contextBonus, risk, confirmation และ Historical Fence; resolve คืน sceneTitle, narration สามย่อหน้า, nextChoices สามข้อ, memory, missionNote และ fence

AI output เป็น **ข้อเสนอทางภาษา** ไม่ใช่ state authority client ต้อง canonicalize difficulty/context และใช้ RollRecord final ของตัวเอง ก่อน commit state ให้ build deterministic result เมื่อ AI resolve สำเร็จให้ใช้ prose มาประกอบ scene/memory แต่ห้ามยอมให้ AI reward หรือแปลง outcome เอง

Timeout มาตรฐานคือ 45 วินาที เมื่อ provider error, timeout, credit exhausted หรือ UI preview: เปลี่ยนเป็น Local Trial, ประกาศ fallback แบบซื่อสัตย์, ไม่หักเครดิต, บันทึก Local Save และเดินเกมต่อ Local Trial ต้องผ่าน engine ชุดเดียว ไม่ใช่ mock path ที่ละเมิด XP/time/mission rules

## 7. Local Save and Campaign Library

Local Save key ปัจจุบันคือ `dust-fire-local-game-v3-saika` และ legacy key ถูกล้าง/ย้ายด้วย migration อย่างระมัดระวัง Auto Save คือ state ล่าสุด, Manual Save คือ snapshot ที่ผู้เล่นตั้งใจเก็บ, Leaf II/III คือ checkpoint ในเครื่อง และ Campaign Library คือ index ของ campaign snapshots เพื่อให้ผู้เล่นสลับกลับเข้าแคมเปญที่เคยเล่น UI ต้องเรียกเพียง **Save Game** และ **Load Game** ไม่ใช้คำว่า Campaign Safekeeping

ก่อนเขียน save ให้ serialize state ที่ normalize แล้ว การอ่าน save ต้อง catch JSON corruption และ fallback เป็น demo ที่แจ้งผู้เล่น ไม่ overwrite manual save เมื่อ auto save update ห้ามเก็บ binary asset ใน Local Save และต้องคำนึง localStorage quota เมื่อเพิ่ม narrative history ในอนาคต

## 8. Security, Auth and Admin

Player route ต้องไม่พึ่ง client role เป็น security boundary Admin route ใช้ protected procedure/server-side role check และ client-side guard เพื่อ UX เท่านั้น `server/admin.ts` ส่งข้อมูล read-only เท่าที่จำเป็น; ไม่ส่ง raw secret, token, full user data หรือ private Local Save ของผู้เล่นผ่าน admin overview

สำหรับ procedure ใหม่: validate input ด้วย schema, เลือก public/protected/admin procedure ถูกต้อง, จำกัด field ที่คืน, log error โดยไม่ log secret, และเขียน test ทั้ง authorized/unauthorized path การเปลี่ยน Admin action จาก read-only เป็น mutating ต้องผ่าน Game Director, QA และ Release review ก่อน

## 9. Development Workflow

ทุกงานเริ่มจาก: อ่าน source of truth, อัปเดต TODO, ระบุ owner ของ state, เขียน/แก้ test ก่อนหรือพร้อม implementation, รัน `pnpm check && pnpm test`, ตรวจ screenshot เมื่อ UI เปลี่ยน, แล้วบันทึก checkpoint งานที่เปลี่ยน schema/เกมเพลย์หรือ flow สำคัญต้องมี test migration และ rollback plan

อย่าแก้ไฟล์ framework ภายใต้ `server/_core` โดยไม่จำเป็น อย่า hardcode port, secret หรือ API key อย่าใช้ command line tool เป็น dependency ของ production application เมื่อเพิ่ม asset ให้เก็บผ่าน asset/storage workflow ที่ project กำหนด ไม่ใส่ large asset ใน client source tree

## 10. Definition of Done สำหรับทีม Game Development

feature เสร็จเมื่อ TypeScript ผ่าน, regression ครอบคลุม happy path และ invariant เสี่ยง, Local Trial กับ AI path ไม่แยกกติกา, save เก่าไม่พัง, error path ไม่สูญ state, และ UI สามารถ derive state ใหม่ได้จริง งานที่เพียง render state แต่ไม่มี migration/test/provenance ยังไม่เสร็จ

## References

1. `client/src/lib/game.ts` — GameState, engine, economy, progression และ migration.
2. `server/gm.ts` และ `server/routers.ts` — AI GM contracts และ tRPC routing.
3. `server/admin.ts` และ `client/src/pages/AdminConsole.tsx` — role-gated admin surface.
4. `client/src/lib/game.progression.test.ts` — progression/time/mission regression examples.
5. `docs/dust-fire-core-game-source-of-truth-th.md` — canonical product rules.

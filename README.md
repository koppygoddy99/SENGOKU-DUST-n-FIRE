# Dust & Fire: Sengoku Stories

> **Tabletop role-playing game เชิงนิยายประวัติศาสตร์ต้นฉบับ** ในบริบทญี่ปุ่นยุคเซ็นโกคุ ผู้เล่นประกาศเจตนาเพียงหนึ่งประโยค ระบบจึงอ่านวิธีการ ทอย `2d12` บันทึกรอยของผล และให้โลกตอบกลับเป็นฉากที่เล่นต่อได้

Repository: <https://github.com/koppygoddy99/SENGOKU-DUST-n-FIRE>

Dust & Fire ไม่ใช่เกมจำลองประวัติศาสตร์ที่อ้างว่า NPC หรือเหตุการณ์สมมติเป็นข้อเท็จจริง เกมใช้บริบทสังคมและช่วงเวลาเป็น **กรอบความน่าเชื่อถือ** โดยแยกข้อเท็จจริงทางประวัติศาสตร์ออกจาก content ในแคมเปญอย่างชัดเจน

## ภาพรวม

แก่นของเกมคือ **Agency before procedure**: ผู้เล่นพูดสิ่งที่ตัวละครจะทำและเหตุผลที่ทำ ไม่ต้องกรอกค่า Stat, Skill หรือ DN เอง ระบบจะเลือกแกนการกระทำ ความชำนาญ โบนัสจากบริบท และ DN ที่เหมาะสม แล้วเปิดรายละเอียดให้ตรวจดูก่อนทอย

| สิ่งที่ผู้เล่นทำ | สิ่งที่ระบบรับผิดชอบ | สิ่งที่โลกต้องจดจำ |
|---|---|---|
| ประกาศเจตนาหนึ่งประโยค | เลือก Axis, Mastery, context และ DN | ผลลัพธ์ต้องเปลี่ยน state ที่ตามรอยได้อย่างน้อยหนึ่งอย่าง |
| ยืนยันการทอย | ทอย 2d12 และรวมค่าตามกติกา | พยาน หนี้ ข่าว บาดแผล หรือทางเลือกใหม่ |
| เลือกใช้ Momentum หลังเห็นเต๋า | เพิ่มผลรวม `+2` เมื่อยังมี Momentum | ราคาเชิงเรื่องยังคงอยู่ แม้ผลรวมจะผ่าน |
| อ่านผลและเล่นต่อ | อัปเดต XP, เวลา, ภารกิจ, รางวัล, Memory และ Local Save | Chronicle ของแคมเปญนั้นเท่านั้น |

## วงจรการเล่น

```text
Declare Intent
  → Analyze the method
  → Reveal Axis / Mastery / Context / DN
  → Roll 2d12
  → Optional Momentum (+2 after seeing the dice)
  → Record Result
  → Narrative draft writes the consequence
  → Open full outcome and declare the next intent
  → Persist Local Save
```

หน้า Play ใช้ลำดับภาพสามช่วงอย่างชัดเจน: ลูกเต๋าสองลูกหมุนและหยุด, หน้าผลทอย/ช่วงตัดสินใจที่แสดงสูตรเต็ม, และ Narrative Outcome ที่มีร้อยแก้วพร้อมทางเลือกต่อไป หลังบันทึกผล เกมจะร้อยเรียงข้อความเป็นกลุ่มคำก่อนเปิดปุ่มอ่านผลเต็ม เพื่อให้ยังมีจังหวะการเล่นระหว่างรอการสร้างฉากจาก AI GM

## กติกา 2d12

สูตร canonical ของผลทอยคือ:

```text
baseDice = d12 + d12
total = baseDice + axisValue + masteryBonus + contextBonus + momentumBonus
margin = total - DN
```

| องค์ประกอบ | แหล่งข้อมูล | ช่วงปัจจุบัน |
|---|---|---:|
| `d12 + d12` | deterministic client engine | 2–24 |
| `axisValue` | ค่าแกนตัวละคร | 0–6 |
| `masteryBonus` | Step ของความชำนาญ | +1 ถึง +5 |
| `contextBonus` | ของ เอกสาร คนกลาง หรือสถานการณ์ที่ตรงบริบท | 0 ถึง +2 |
| `momentumBonus` | การเลือกผู้เล่นหลังเห็นผล | 0 หรือ +2 |

### แกนห้าแบบ

| ID | English | ไทย | ใช้เมื่อตัวละครสำเร็จด้วย… |
|---|---|---|---|
| `body` | Prowess | พละกำลัง | ฝ่า ต้าน ปีน แบก วิ่ง หรือยื้อแรง |
| `hand` | Craft | ฝีมือ | อาวุธ ซ่อม แกะ ยิง จับ หรืองานละเอียด |
| `wit` | Instinct | ไหวพริบ | หลบ ลอบ หนี ลวง สังเกต หรืออ่านจังหวะ |
| `mind` | Judgment | ปัญญา | บัญชี เอกสาร แผน หลักฐาน หรือเหตุผล |
| `heart` | Resolve | พลังใจ | ยืนหยัด สาบาน ขอร้อง ชักจูง หรือรับผิดชอบ |

ระบบเลือก **วิธีหลักที่ทำให้การกระทำสำเร็จ** ไม่ใช่คำกริยาที่ฟังดูรุนแรงที่สุด ตัวละครถือปืนอาจใช้ `mind` เมื่อต้องอาศัยบัญชีและคำสั่งผ่านด่าน หรือใช้ `wit` เมื่อต้องอ่านจังหวะยาม

## DN ที่ใช้งานจริง

DN คือระดับแรงกดดันของฉาก ไม่ใช่โทษทางศีลธรรมหรือการบอกว่าผู้เล่น “เล่นเก่ง/ไม่เก่ง” กติกาปัจจุบันตั้งใจไม่ให้การประกาศ action ที่ถึงขั้นทอยกลายเป็น DN10 อัตโนมัติ และไม่ยก DN22 ให้เพียงเพราะมีคำเสี่ยงคำเดียว

| DN | ใช้เมื่อ | เป้าหมายเชิงเกม |
|---:|---|---|
| **14** | เดิมพันปกติที่มีผลต่อฉาก | การสำเร็จและพลาดต่างก็ทำให้เรื่องขยับ |
| **18** | มีด่าน ผู้คุม อุปสรรคจริง หรือการกระทำที่ทิ้งร่องรอย | ต้องใช้ฝีมือ การเตรียมตัว หรือยอมรับผลตามมา |
| **22** | วิกฤตซ้อน: การผิดกฎหมายปะทะอุปสรรคที่คุมอยู่ โดยไม่มีวิชาหรือเครื่องมือช่วย | งานเสี่ยงสูงที่ควรต้องคิดวิธี เปลี่ยนเงื่อนไข หรือใช้ทรัพยากร |

Context และ Mastery ไม่ลด DN แบบลบล้างเดิมพัน แต่เพิ่มแต้มในสูตรอย่างตรวจสอบได้ ตัวอย่างเช่น เอกสารที่ตรงบริบทอาจให้ `+1` หรือ `+2` และผู้เล่นจะเห็นต้นทางของแต้มใน Roll Formula ก่อนบันทึกผล

### Margin และผลตอบกลับของโลก

| Margin | Outcome | ความหมาย |
|---:|---|---|
| `≥ +5` | Decisive Success | เปิดทางชัด แต่โลกยังจำว่าใครช่วย ใครเสียหน้า และอะไรเปลี่ยนมือ |
| `0..+4` | Success with Cost | ได้สิ่งที่ต้องการพร้อมพยาน หนี้ ข่าว หรือเงื่อนไข |
| `-4..-1` | Partial Success | ได้บางส่วน เช่น เวลา ข้อมูล หรือทางเลือก แต่แรงกดดันยังอยู่ |
| `≤ -5` | Failure with Consequence | ทางเดิมพังและต้องมีต้นทุนใหม่ แต่ไม่มี dead end |

## Momentum, ความชำนาญ และ XP

`Momentum` มีค่า 0–2 ใช้ได้หนึ่งหน่วยหลังผู้เล่นเห็นผลเต๋าเพื่อเพิ่ม Total `+2` มันไม่ลบพยาน รักษาบาดแผล หรือทำให้ผลตามเรื่องหายไป

ความชำนาญเติบโตแยกวิชาใน Step 1–20 ไม่ใช่เลเวลรวมของตัวละคร งานที่ไม่มีแรงกดดันพอตาม Step จะไม่ให้ XP เพื่อป้องกันการทอยวนฟาร์มแต้ม

| Step | โบนัส | DN ขั้นต่ำเพื่อการฝึกมีน้ำหนัก | XP สู่ขั้นถัดไป |
|---:|---:|---:|---:|
| 1–4 | +1 | 10 | 5 |
| 5–8 | +2 | 10 | 7 |
| 9–12 | +3 | 14 | 10 |
| 13–16 | +4 | 18 | 14 |
| 17–19 | +5 | 22 | 18 |
| 20 | +5 | — | 0 |

ความชำนาญที่ใช้ใน action ซึ่งมีผลจริงต่อโลกได้ `+1 XP`; หากเป็นวิธีหลักที่ทำให้เรื่องขยับสามารถได้เพิ่มอีก `+1 XP` โดยเพดานคือ `+2 XP` ต่อ roll

## สถานะแคมเปญและการบันทึก

เกมใช้ **Local Save-first**: GameState, Roll records, Leaf, progression, missions, rewards, memories และ campaign snapshots เก็บใน browser เป็นหลัก คีย์หลักปัจจุบันคือ `dust-fire-local-game-v3-saika`.

Manual Save, Auto Save, Load Game และ Chronicle ต้องอ้างอิงแคมเปญที่เลือกอยู่ ไม่ปนประวัติของแคมเปญอื่น การเล่น Local Trial จึงดำเนินต่อได้แม้บริการ AI หรือเซิร์ฟเวอร์ไม่ตอบ

## AI GM และ historical guardrails

AI GM เป็นส่วนเสริม ไม่ใช่ผู้ตัดสินเต๋า หน้าที่คือวิเคราะห์เจตนา เขียนผลเชิงนิยาย สร้างตัวเลือกถัดไป และเลือก fact cards ทางสังคมประวัติศาสตร์ที่ตรงกับฉาก กฎที่ไม่เปลี่ยนคือ:

1. AI ห้ามสุ่มเต๋า แก้ Total, Margin หรือ Outcome ที่ deterministic engine ตัดสินแล้ว
2. AI ห้ามให้ context bonus เกิน `+2` และ DN ต้องผ่าน canonical rule ของ client
3. หาก AI timeout, credit ใช้ไม่ได้ หรือเป็น UI Preview เกมต้อง fallback เป็น Local Trial โดยไม่หัก AI credit
4. NPC และเหตุการณ์ในแคมเปญเป็นเรื่องสมมติ เว้นแต่ระบบติด historical status ที่มีหลักฐานตรงจุด

## เทคโนโลยีและโครงสร้าง

| ชั้นระบบ | เทคโนโลยี/ที่ตั้ง | หน้าที่ |
|---|---|---|
| Client | React 19, TypeScript, Tailwind/shadcn | Player shell, Play Scene, map, Chronicle, market และ Local Save UI |
| Game rules | `client/src/lib/game.ts` | GameState, parse action, 2d12, DN, progression, mission, economy |
| Feature UI | `client/src/features/**` | Play, Chronicle, Story Map และ player-facing flows |
| Server | Express 4 + tRPC 11 | Auth, AI GM, timeline และ admin operations |
| Persistence | Browser Local Save เป็นหลัก; Drizzle/MySQL สำหรับ user/auth service | ความต่อเนื่องของแคมเปญและบริบทผู้ใช้ |
| Historical boundary | `client/src/lib/historicalTimeline.ts`, server fact cards และ docs | แยก fact-supported / contextual-play / campaign-fiction / insufficient-evidence |

```text
client/src/lib/game.ts                deterministic game contract
client/src/features/play/             intention, dice, formula, outcome flow
client/src/features/chronicle/        campaign-scoped records
client/src/features/story/            National Map and province context
client/src/pages/                     Home shell, Market Hub, Admin Console
server/gm.ts                          AI GM analysis and narrative contract
server/timeline.ts                    historical timeline boundary
docs/                                 source-of-truth rules, UI research, QA evidence
tests/                                Playwright browser regressions
```

## เริ่มพัฒนาในเครื่อง

### ข้อกำหนดเบื้องต้น

- Node.js 22 หรือใหม่กว่า
- pnpm 10
- ตัวแปรระบบ Manus สำหรับ OAuth, database และ built-in services เมื่อต้องทดสอบ auth/AI GM จริง

```bash
pnpm install
pnpm dev
```

Development server เริ่มจาก `server/_core/index.ts` และให้ Vite ส่งหน้า React ผ่าน Express. ห้าม commit ไฟล์ `.env` หรือ token ใด ๆ ลง repository.

### คำสั่งสำคัญ

| คำสั่ง | หน้าที่ |
|---|---|
| `pnpm check` | ตรวจ TypeScript |
| `pnpm test` | รัน Vitest ทั้งชุด |
| `pnpm test:play-dice-flow` | ตรวจ browser flow ลูกเต๋าหมุน → สูตรผล → Narrative Outcome |
| `pnpm test:mobile-keyboard` | ตรวจ keyboard flow บนมือถือ |
| `pnpm test:campaign-layout` | ตรวจ Campaign Command ไม่เกิด horizontal overflow |
| `pnpm test:market-mobile-layout` | ตรวจ Market Hub บน 375px |
| `pnpm db:push` | generate และ apply Drizzle migrations เมื่อมี schema change |

ก่อนแก้ schema ให้ตรวจ `drizzle/schema.ts`, สร้าง migration, อ่าน SQL ที่สร้าง และ apply ผ่าน workflow ที่เหมาะสม หลีกเลี่ยงการทำลายข้อมูลโดยไม่จำเป็น

## การทดสอบและเกณฑ์ส่งมอบ

งานที่เปลี่ยนกติกา UI หรือ flow ต้องเพิ่ม regression ที่ใกล้กับพฤติกรรมจริงที่สุด และตรวจอย่างน้อย:

```bash
pnpm check
pnpm test
pnpm test:play-dice-flow
pnpm test:mobile-keyboard
pnpm test:campaign-layout
pnpm test:market-mobile-layout
```

ผลที่เกี่ยวกับ layout หรือจังหวะ Play ต้องมี visual review เพิ่มเติมบน desktop และ mobile. Screenshot ไม่ทดแทน unit/browser tests แต่ช่วยยืนยันสิ่งที่ผู้เล่นเห็นจริง

## GitHub และกติกาการส่งมอบ

Repository นี้ใช้ `main` เป็น branch หลัก และ remote ชื่อ `github` ชี้ไปยัง repository ส่วนตัว `koppygoddy99/SENGOKU-DUST-n-FIRE`.

> **นโยบายการซิงก์:** ทุก milestone ที่ส่งมอบให้ผู้ใช้ต้องผ่านการตรวจที่เกี่ยวข้อง, สร้าง checkpoint และถูก commit/push ไป `github main` ก่อนรายงานผล. งานระหว่างทำสามารถอยู่ใน working tree ได้ชั่วคราว แต่จะไม่ถูกอ้างว่าส่งมอบหรือเสร็จจนกว่าจะซิงก์สำเร็จ.

ลำดับมาตรฐานคือ: ตรวจ `todo.md` → รัน tests ที่เกี่ยวข้อง → สร้าง checkpoint → ตรวจ `git status` → commit/push → รายงาน commit/checkpoint ที่ส่งมอบ.

## เอกสารสำคัญ

| เอกสาร | ใช้เมื่อ |
|---|---|
| [`docs/dust-fire-core-game-source-of-truth-th.md`](docs/dust-fire-core-game-source-of-truth-th.md) | ต้องการ contract กติกาและ state transition เชิง implementation |
| [`docs/dust-fire-rules-and-character-summary-th.md`](docs/dust-fire-rules-and-character-summary-th.md) | ต้องการคู่มือผู้เล่นอ่านง่าย |
| [`docs/dust-fire-deep-game-guide-th.md`](docs/dust-fire-deep-game-guide-th.md) | ต้องการคู่มือเชิงลึกสำหรับผู้เล่นและนักพัฒนา |
| [`docs/dust-fire-lore-narrative-art-bible-th.md`](docs/dust-fire-lore-narrative-art-bible-th.md) | ต้องการขอบเขตเรื่อง ภาษา ฉาก และอาร์ต |
| [`docs/play-outcome-flow-review-2026-08-22-th.md`](docs/play-outcome-flow-review-2026-08-22-th.md) | ต้องการหลักฐาน QA ของ flow ลูกเต๋า/ผลเชิงเรื่องเล่า/DN ล่าสุด |
| [`docs/team-work-status-2026-08-21-th.md`](docs/team-work-status-2026-08-21-th.md) | ต้องการสถานะตาม workflow 7 ทีม |

## สถานะปัจจุบันและงานที่ยังไม่ปิด

ผู้เล่นสามารถทดลองเกม, สร้าง/โหลดแคมเปญ Local Save, เล่นฉาก, ดูผลทอยและ Narrative Outcome, เปิด National Map, Chronicle, Market/Prepare และหน้าผู้ดูแลตามสิทธิ์ได้. สิ่งที่ยังอยู่ในขอบเขตพัฒนาคือการรับ feedback เพื่อปรับหน้าถัดไปทีละหน้า และการทบทวนชุดเอกสารกลาง/คู่มือทีมตามความเห็นของผู้ใช้

## License และทรัพย์สิน

โค้ดและเอกสารของ repository นี้เป็นของโครงการ Dust & Fire ตามสิทธิ์ที่เจ้าของโครงการกำหนด. ห้ามนำ PDF, แผนที่, illustration หรือทรัพย์สินภายนอกที่มีลิขสิทธิ์มา commit หรือใช้งานโดยไม่มีสิทธิ์ชัดเจน. ทรัพย์สินรูปภาพที่ผู้ใช้อนุญาตให้ใช้ต้องถูกบันทึกที่มาและใช้ตามขอบเขตอนุญาตเท่านั้น.

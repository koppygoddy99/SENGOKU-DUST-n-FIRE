# AI Narrative Contract: คุมเวลา ฉาก และ LOG ของ Dust & Fire

> สถานะ: **ข้อเสนอเพื่ออนุมัติเท่านั้น**. เอกสารนี้ยังไม่แก้ `server/gm.ts`, schema, prompt, UI หรือ Local Save.

## ข้อสรุปก่อน

ถ้าต้องการให้ AI ไม่หลุดจาก Scene Clock และเขียน LOG ดีต่อเนื่อง **prompt อย่างเดียวไม่พอ**. ตัว engine ต้องเป็นคนตัดสินเวลา วัน สถานที่ Page ผลเต๋า และ state; AI มีหน้าที่เขียนว่า “ผลของสิ่งที่ engine ตัดสินแล้วรู้สึกและเปลี่ยนโลกอย่างไร” เท่านั้น

> **Engine owns facts. AI owns prose. UI owns reading rhythm.**

เมื่อแยกอำนาจแบบนี้ AI จะไม่ควรกระโดดจากพลบไปเช้าวันใหม่เอง, ไม่ทำตัวละครเดินทางข้ามแคว้นเอง, ไม่เปลี่ยนผลทอย, และไม่สรุป LOG แบบรายงานแห้ง ๆ.

## 1. ปัญหาใน contract ปัจจุบัน

`server/gm.ts` มี JSON Schema และ Zod validation แล้ว ซึ่งดีมากในด้านรูปแบบผลลัพธ์ แต่ context ที่ส่งให้ AI มีเพียงปี ฤดู และวัน. ยังไม่มีข้อมูลที่ “ล็อกแล้ว” สำหรับยามก่อน/หลัง action, เวลาที่ action นี้ใช้, เหตุผลของเวลา, Page trigger, หรือรายการปมค้างที่ต้องนำไปเล่าต่อ

ผลคือ AI อาจผ่าน JSON validation แต่ยังเขียนผิดโลกได้ เช่น เปลี่ยนยามเอง, ทำเหมือนวันผ่านทั้งที่ถามคำถามเดียว, ลืมแรงกดดันเดิม, หรือโยนเหตุการณ์ใหม่เข้ามาแทนผลของการกระทำผู้เล่น.

## 2. สัญญาอำนาจสามชั้น

| ชั้น | เจ้าของ | สิ่งที่ตัดสินได้ | สิ่งที่ห้ามทำ |
|---|---|---|---|
| **Rules Engine** | deterministic client/server rules | ผลเต๋า, DN, โบนัส, เวลา, วัน, ฤดู, Page, item, mission, rewards, state | เขียนร้อยแก้วยาวแทน AI |
| **AI GM** | prompt + structured response | ภาพประสาทสัมผัส, ปฏิกิริยา NPC, น้ำหนักอารมณ์, บทสนทนาสั้น, แรงกดดันถัดไป | เปลี่ยน fact/state/time/ผลทอยหรือสร้าง resource ใหม่ |
| **LOG UI** | frontend | ลำดับการอ่าน, แยก prose/ledger/choice, progressive reveal | สร้างเรื่องหรือแก้ state |

## 3. Time Ledger ที่ engine ต้องสร้างก่อนเรียก AI

AI ไม่ควรเดาเวลา. ก่อน `resolveWithGM()` engine ต้องคำนวณและส่ง object ที่เปลี่ยนไม่ได้ดังนี้:

```ts
type TimeLedger = {
  clockVersion: "scene-clock-v1";
  before: { year: 1569; season: "Spring"; day: 7; watch: "dusk" };
  actionCost: { watches: 0 | 1 | 2; class: "brief" | "scene" | "extended" | "montage"; rationale: string };
  after: { year: 1569; season: "Spring"; day: 7; watch: "night" };
  transition: "same-watch" | "next-watch" | "new-day" | "montage";
  page: { id: "page-03"; transition: "stay" | "open"; cause?: "mission-turn" | "location-change" | "meaningful-elapse" | "montage" };
};
```

**กฎสำคัญ:** `watches` มาจาก engine ตามชนิด action และการเลือกพัก/รอ/เดินทางของผู้เล่น ไม่มาจากคุณภาพผลทอย. AI เห็น ledger นี้เพื่อเขียนบรรยากาศ แต่ไม่มี field ใดให้ AI เลือกเวลาใหม่.

## 4. Story Ledger ที่ส่งเข้า AI แทนการยัด LOG เก่าทั้งหมด

การส่ง LOG ยาว ๆ ทุกครั้งทำให้ model จับประเด็นไม่ดีและเริ่มเล่าย้ำ. ให้ engine สร้าง Story Ledger ขนาดเล็กแทน:

```ts
type StoryLedger = {
  sceneFrame: { location: string; visiblePeople: string[]; immediatePressure: string };
  unresolvedThreads: Array<{ id: string; statement: string; urgency: "now" | "today" | "later" }>;
  recentConsequences: Array<{ id: string; statement: string }>;
  socialFacts: Array<{ subject: string; currentStance: string }>;
  chapterMemory: string; // 120–240 คำ: สิ่งที่เรื่องไปถึงแล้ว, ไม่ใช่ LOG เต็ม
  forbiddenInventions: string[];
};
```

กฎการตัด context:

| ส่งเข้า AI ทุกครั้ง | ส่งเฉพาะเมื่อเกี่ยวข้อง | ไม่ส่งเข้า AI เต็มก้อน |
|---|---|---|
| Time Ledger, roll result, current scene, action, immediate pressure, active mission | 3 ปมค้าง, 3 memory ล่าสุด, NPC ที่อยู่ในฉาก, Historical Brief | LOG ทุกหน้า, inventory ทั้งหมด, old dialogue ทั้งหมด, timeline ทั้งหมด |

## 5. Resolve Schema ที่ควรเพิ่ม

เนื้อเรื่องยังคงมี 3 ย่อหน้า แต่เพิ่ม “ราง” ที่ engine ตรวจได้:

```ts
type GMResolution = {
  sceneTitle: string;
  timeAnchor: "same-watch" | "next-watch" | "new-day" | "montage";
  continuity: {
    carriedThreadId: string | null;
    newPressure: string;
    locationUnchanged: boolean;
  };
  narration: [string, string, string];
  nextChoices: [string, string, string];
  memory: { title: string; detail: string; tone: "navy" | "teal" | "vermilion" | "ochre" };
  missionNote: string;
  historicalFence: string;
  historicalStatus: "fact-supported" | "contextual-play" | "campaign-fiction" | "insufficient-evidence";
};
```

Validator ฝั่ง server ต้องเปรียบเทียบ `timeAnchor` กับ `TimeLedger.transition`; ถ้าไม่ตรง ให้ reject ผล AI และใช้ fallback ไม่ใช่เปลี่ยน state ตาม AI. `locationUnchanged` ต้องเป็น `true` เว้นแต่ engine ระบุการเดินทางสำเร็จไว้แล้ว. `carriedThreadId` ต้องเป็นหนึ่งใน Story Ledger หรือ `null`.

## 6. Prompt ที่แนะนำ

ให้วาง prompt เป็น 5 ส่วนเสมอ โดย hard rule มาก่อน prose:

```text
[NON-NEGOTIABLE RULES]
The Rules Engine has already decided the roll, consequence, time transition,
location, and Page. They are immutable. Never advance, rewind, skip, or name
any other time than the Time Ledger. Never move the character to another
location unless the ledger says location changed.

[FROZEN TIME LEDGER]
Before: Spring 1569, Day 7, Dusk.
Action cost: 1 watch, scene action, “the bargain takes an evening.”
After: Spring 1569, Day 7, Night.
Transition: next-watch. Page: stay.

[FROZEN STORY LEDGER]
Scene, visible people, immediate pressure, three unresolved threads,
recent consequences, and chapter memory.

[NARRATIVE JOB]
Write exactly three Thai prose paragraphs.
P1: immediate physical/sensory aftermath anchored in the given time and place.
P2: one NPC reaction or one earned line of dialogue shaped by obligation/status.
P3: one tangible consequence plus one specific unresolved pressure.
Carry exactly one relevant unresolved thread forward when possible.

[FORBIDDEN MOVES]
No dice, DN, stats, rules, AI, credits, generic “the story moves on”,
unearned travel, unlisted NPC knowledge, historical claims outside the brief,
or direct question to the player inside narration.
```

ให้มี **few-shot examples 4–6 ชุด** ไม่ต้องมากกว่านั้น ได้แก่: จังหวะสั้น 0 ยาม, scene action 1 ยาม, ข้ามวัน, montage 3 วัน, พลาดแต่เรื่องยังเดิน, และ deadline ขยับ. ตัวอย่างต้องใช้ schema เดียวกับ production และถูกทดสอบใน fixture.

## 7. จังหวะ prose ที่ไม่ทำให้ LOG แข็ง

| Block | หน้าที่ | สิ่งที่ห้าม |
|---|---|---|
| ย่อหน้า 1 — **ภาพที่เปลี่ยน** | เริ่มจากสิ่งที่ผู้เล่นเพิ่งทำและผลทางกายภาพ/ประสาทสัมผัส | เปิดด้วยสรุปผลทอยหรือคำเล่าแบบทั่วไป |
| ย่อหน้า 2 — **คนที่ต้องรับผล** | ปฏิกิริยา คนพูด ท่าที ความสัมพันธ์ หนี้ หรือศักดิ์ศรี | NPC อธิบาย lore ยาว ๆ เพื่อข้อมูลผู้เล่น |
| ย่อหน้า 3 — **สิ่งที่ค้างอยู่** | สิ่งที่เปลี่ยนมือ, พยาน, บาดแผล, deadline, ร่องรอย, หรือทางเปิด | จบด้วย “เจ้าจะทำอย่างไร?” เพราะ UI composer ทำหน้าที่นี้ |

ขนาดที่แนะนำคือรวมราว **700–1,300 อักษรไทย**. ยาวพอให้อ่านเป็นฉาก แต่ไม่ยาวจนซ่อนการตัดสินใจครั้งถัดไป. `nextChoices` เป็นเพียงข้อเสนอใต้ narrative ไม่ใช่บังคับเส้นทาง.

## 8. วิธีอ่าน LOG ที่ควรแสดงใน UI

ให้หน้า LOG อ่านเหมือนบันทึกนิยาย ไม่ใช่ debug console:

```text
1569 · วสันต์ · วันที่ 7 · พลบ → ราตรี
PAGE 03 · คำตอบใต้ห้องขัง

[ร้อยแก้ว 3 ย่อหน้า]

โลกจดจำ: มาซาคิจิติดหนี้คำสัญญา / ผู้คุมเริ่มสงสัย
เวลาที่ใช้: 1 ยาม · ผล: สำเร็จแต่มีราคา

สิ่งที่ยังไม่จบ: ต้องหาไม้ ชาด และทางผ่านเวรยาม
```

**Reader Mode:** ซ่อน “ผล/สูตร/เวลาใช้” ได้ เหลือหัววันและร้อยแก้ว เพื่อให้อ่านต่อเป็นนิยาย. **Game Mode:** แสดง ledger แบบกะทัดรัดใต้ฉากสำหรับคนที่อยากตรวจผลกติกา.

## 9. การป้องกัน AI หลุด: validation ladder

| ชั้น | ตรวจอะไร | เมื่อไม่ผ่าน |
|---|---|---|
| 1. JSON Schema | field ครบ, enum ถูก, ย่อหน้าครบ 3 | ปฏิเสธ response |
| 2. Zod/semantic validator | timeAnchor, location, thread ID, length และคำต้องห้าม | ปฏิเสธ response |
| 3. one-shot repair (ไม่เกิน 1 ครั้ง) | ส่งเฉพาะ error ที่แก้ได้ เช่น “timeAnchor must be next-watch” | ถ้ายังผิด ให้ fallback |
| 4. Local Trial fallback | ใช้ Time Ledger + RollRecord เขียนฉาก deterministic ที่รักษาความจริง | เซฟและเล่นต่อโดยไม่ติด |

ไม่มีชั้นใดยอมให้ AI เขียน state แทน engine. การ retry ไม่ควรเกินหนึ่งครั้งเพื่อไม่ให้ latency/credit พุ่งโดยไร้ขอบเขต.

## 10. ชุดทดสอบที่ต้องมี

สร้าง golden fixtures อย่างน้อย 6 เคส แล้วรันกับ prompt version ทุกครั้ง:

1. **0 ยาม:** ถามคำถามต่อในห้องเดิม; AI ห้ามพูดว่าเย็นลง/กลางคืนแล้ว.
2. **1 ยาม:** ต่อรองในยามพลบ → ราตรี; narration ต้องสะท้อนกลางคืน ไม่ข้ามวัน.
3. **ข้ามวัน:** รอตลอดคืน; day +1 และย่อหน้าแรกต้องเป็นเช้าวันใหม่.
4. **Montage 3 วัน:** หลบซ่อน/ติดตามข่าว; ต้องมี chapter summary และปมใหม่ที่จำกัด.
5. **Failure with consequence:** พลาดแต่ยังมีทางเลือก; ห้าม game over หรือบังคับ outcome นอก roll.
6. **Deadline crossing:** engine ระบุ deadline เปลี่ยน; AI แสดงแรงกดดัน แต่ห้ามแต่งผลภารกิจเอง.

สำหรับแต่ละ fixture ให้ตรวจ schema, semantic fields, forbidden language, continuity ID และ human review ของ prose. Pin model snapshot และเก็บ prompt version ไว้ใน output metadata เพื่อเทียบคุณภาพเมื่อเปลี่ยน model/prompt.[1] [2]

## 11. ลำดับ implementation ที่ปลอดภัยเมื่ออนุมัติ

1. Team 3/8 เพิ่ม Time Ledger และ Story Ledger ใน GameState/server input โดยยังคง fallback เดิม.
2. Team 2 ยืนยัน action-time taxonomy: 0/1/2 ยาม, rest, wait และ montage.
3. Team 4 แสดงเวลาโดยประมาณก่อนทอย และอ่าน LOG แบบ Game/Reader Mode.
4. Team 6 เพิ่ม semantic validator + golden fixtures + browser regression.
5. Team 7 เก็บ prompt version, latency, fallback rate และ response-validation failure โดยไม่บันทึก secret/ข้อความผู้เล่นเกินจำเป็น.

## คำตอบตรงคำถาม

ทำให้ AI ไม่หลุดได้ด้วยการ **ไม่ขอให้ AI จำกฎทั้งหมดจากข้อความ**. ให้ engine ส่งความจริงที่ล็อกแล้วเป็น ledger, บังคับ AI คืน structured prose ที่อ้าง ledger นั้น, validate อีกชั้น, และมี fallback ที่เล่าต่อจากความจริงเดียวกัน. ส่วน LOG ที่อ่านสนุกมาจากการให้ AI ทำงานเล็กและชัด: “ภาพที่เปลี่ยน → คนที่รับผล → สิ่งที่ค้างอยู่” ทุกครั้ง.

## References

[1]: https://developers.openai.com/api/docs/guides/structured-outputs "Structured model outputs — OpenAI API"
[2]: https://developers.openai.com/api/docs/guides/prompt-engineering "Prompt engineering — OpenAI API"


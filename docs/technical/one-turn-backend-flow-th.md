# Dust & Fire: หลังบ้านของหนึ่งตาการเล่น

เอกสารนี้อธิบาย **สิ่งที่ระบบทำจริงในเวอร์ชันปัจจุบัน** ตั้งแต่ผู้เล่นยืนยันเจตนา กด `ROLL 2D12` เห็นผล กด `RECORD THIS RESULT` แล้วจบด้วยการบันทึก Local Save. คำว่า “หลังบ้าน” ในเกมนี้มีสองชั้น: กติกาและ State หลักทำงานใน client เพื่อให้เล่นต่อได้แม้ AI ใช้ไม่ได้ ส่วน AI GM เป็น server-side layer ที่ช่วยตีความเจตนาและเขียนผลเชิงเรื่องเท่านั้น

> **หลักตายตัว:** ลูกเต๋า, ผลรวม, margin, XP, เวลา, ภารกิจ, รางวัล และ Local Save ต้องถูกตัดสินจาก state ของเกม ไม่ปล่อยให้ AI เปลี่ยนกติกาเอง

## ผังหนึ่งตา

```text
พิมพ์เจตนา
  → ยืนยันเจตนา
  → Local rules หรือ AI วิเคราะห์ Roll Preview
  → กด ROLL 2D12
  → สุ่มเต๋า + คำนวณผลทันที
  → แสดง animation 4 วินาที
  → RECORD THIS RESULT
  → applyRoll: Trait/Mastery Progress + เวลา + ภารกิจ + รางวัล + สถานะ + ความทรงจำ + ฉากถัดไป
  → [AI mode] เขียนผลเชิงเรื่องและตรวจประวัติศาสตร์ หรือ fallback Local Trial
  → Home state เปลี่ยน
  → localStorage เขียน Local Save ทั้งก้อน
```

## 0. ก่อนกดทอย: สร้าง Roll Preview

ผู้เล่นพิมพ์การกระทำหนึ่งประโยค แล้วกด **Set This Intention**. ระบบต้องสร้าง `RollPreview` ก่อนจึงจะเปิดปุ่มทอยได้ เพื่อให้ผู้เล่นตรวจเหตุผลของการตัดสินก่อนเสี่ยงจริง

| โหมด | ผู้ตัดสิน Preview | ข้อมูลที่ใช้ | สิ่งที่ได้ |
|---|---|---|---|
| **Local Trial** | `parseAction()` ใน client | คำกริยา/คำสำคัญ, Stat, Mastery tags, ไอเทมที่ใช้ได้, คำเสี่ยง | Stat, Mastery, Context โบนัส, DN, ความเสี่ยง, พยาน |
| **AI-assisted** | `gm.analyze` บน server | Campaign, ตัวละคร, Mastery, ภูมิหลัง, ฉาก, ภารกิจ, สถานะสังคม, ความทรงจำล่าสุด | คำสรุปเจตนา, Stat, Mastery ที่มีอยู่จริง, Context, DN, ความเสี่ยง, historical fence |

Local Trial ใช้ heuristic ที่ตรวจสอบได้: คำอย่าง “เอกสาร/แผน/คำนวณ” มักชี้ไปทางปัญญา, “ขอ/สาบาน/เกลี้ยกล่อม” ไปทางใจสู้, แล้วหา Mastery/ไอเทมที่ tag ตรงกับวิธีทำ. DN ปัจจุบันของ local rule คือ **8 / 12 / 16 / 20 / 24 / 28 / 32** ตามความปลอดภัย เดิมพัน ด่าน/ผู้คุม แรงกดดันซ้อน วิกฤต และจุดตัดสินชะตา

ใน AI mode, model ทำหน้าที่เสนอคำวินิจฉัยใน schema ที่ตรวจรูปแบบแล้ว. แต่จะให้ชื่อ Mastery ใหม่ไม่ได้: ต้องเลือกจาก Mastery ที่ state ส่งไปเท่านั้น. หาก AI วิเคราะห์ไม่สำเร็จ ระบบกลับไป `parseAction()` โดยอัตโนมัติและไม่หักเครดิต

## 1. เมื่อกด ROLL 2D12: อะไรเกิดก่อน animation

การกดปุ่มเรียก `resolveRoll(preview, game)` **ทันที** แล้วสุ่ม d12 สองลูก. Animation สี่วินาทีเป็นเพียงการเปิดเผยผล ไม่ใช่ช่วงที่กติกากำลังรอคำนวณ ดังนั้นผลเดียวกันจะถูกเก็บไว้ตลอดหน้าลูกเต๋าหมุน

```text
d12 ลูกที่ 1 + d12 ลูกที่ 2
+ Trait Level ที่ Preview เลือก
+ Mastery Level ที่ตรง
+ Context/Gear จากไอเทม/บริบท
+ Flaw (0 หรือ −2 เมื่อ trigger)
= Total

Margin = Total - DN
```

| Margin | Outcome ที่บันทึกใน RollRecord |
|---:|---|
| `+5` หรือมากกว่า | `decisive_success` |
| `0` ถึง `+4` | `success_with_cost` |
| `-1` ถึง `-4` | `partial_success` |
| `-5` หรือต่ำกว่า | `failure_with_consequence` |

`RollRecord` ที่สร้างแล้วเก็บ dice, Stat, Mastery, Context, DN, Total, Margin, outcome, consequence, narrative draft และ `tick` ถัดไป. แต่มันยัง **ไม่ถูก commit เข้า GameState** จนกว่าผู้เล่นกด Record This Result.

## 2. กด RECORD THIS RESULT: applyRoll คือจุด commit เดียว

`applyRoll(game, record)` คือธุรกรรมหลักของหนึ่งตา. มันสร้าง GameState ใหม่ ไม่แก้ state เดิมตรง ๆ และบันทึกผลเหล่านี้พร้อมกัน

| หมวด | สิ่งที่เปลี่ยนเมื่อ commit |
|---|---|
| **Roll ledger** | เพิ่ม `RollRecord` ที่มี practice, time mark และ mission update |
| **Trait / Mastery Progress** | งานปกติที่ DN ตั้งแต่ 12 ให้ Trait และ Mastery ที่ตรง +1 Progress; decisive success ได้ +2. Trait ใช้ threshold 3/4/5/6 ถึง Level 10, Mastery ใช้ 5 Progress ถึง Level 5 |
| **เวลา** | decisive success ขยับ 2 ยาม; ผลอื่นขยับ 1 ยาม. ลำดับคือ dawn → day → dusk → night; ข้าม night จึงเพิ่มวัน |
| **Page / Leaf** | เมื่อสะสมวันเคลื่อนไหวครบ 4 วัน ระบบเปิด Page ใหม่และรีเซ็ตตัวนับ leaf |
| **ปฏิทิน / อายุ** | วันเกิน 30 เลื่อนไปฤดูถัดไป; ข้าม Winter ไป Spring เพิ่มปี; อายุเพิ่มเมื่อผ่านฤดูเกิดในปีใหม่ |
| **ภารกิจแรก/ภารกิจที่ active** | ไม่ขยับเมื่อ failure; decisive +2 progress, ผลอื่นที่ไม่ fail +1. ครบ requirement แล้ว state เป็น resolved |
| **รางวัล** | ภารกิจที่ resolved เพิ่ม reward item ใน inventory และบันทึก transaction ใน economy ledger |
| **Vitals / social** | failure เพิ่ม Stain +1; partial เพิ่ม Information +1 |
| **ความทรงจำ** | เพิ่ม WorldMemory ของผลลัพธ์ |
| **ฉากถัดไป** | สร้าง Scene ใหม่พร้อม title, pressure, prompt และ suggested actions เพื่อให้พิมพ์เจตนาถัดไปได้ |

### เวลาปัจจุบันกับข้อเสนอ Scene Clock

โค้ดปัจจุบันใช้ **time marks**: decisive success = 2 marks, outcome อื่น = 1 mark. นี่เป็น implementation ปัจจุบัน ไม่ใช่ข้อเสนอ Scene Clock แบบประเมิน 0/1/2 ยามตามน้ำหนักของเจตนา. ข้อเสนอใหม่ยังเป็นเอกสารรออนุมัติและยังไม่ได้แทนกติกา `applyRoll()`.

## 4. ใครเขียนผลเชิงเรื่อง

### Local Trial

`localOutcomeNarration()` ร้อยข้อความ 3 ย่อหน้าจากเจตนา, สถานที่, pressure, speaker, strength/weakness และ outcome. เป้าคือให้ผลล้มเหลวไม่ตัน: ความผิดพลาดเปลี่ยนราคาของฉาก, ไม่ปิดเกม. หลัง `applyRoll()` ระบบสร้าง next scene และทางเลือกถัดไปจากผลที่ commit แล้ว

### AI-assisted

หลังผู้เล่นกด Record ระบบแสดง narrative draft เพื่อไม่ให้หน้าจอดูค้าง แล้วเรียก `gm.resolve` พร้อม context ล่าสุดและ **ผลทอยที่ตัดสินไปแล้ว**. AI ต้องคืน schema ที่มี narration 3 ย่อหน้า, scene title, next choices 3 ข้อ, memory, mission note และ historical boundary/status

AI GM รับ **ภูมิหลังตัวละคร 2 ข้อ** ไปด้วย แต่ server prompt กำหนดชัดว่าเป็นบริบทเชิงเรื่อง: อาจกลับมาเป็นข่าวลือ, คน, สถานที่, แรงกดดัน หรือทางเลือกยากเมื่อฉากเหมาะสมเท่านั้น. มันห้ามเปลี่ยน Stat, Mastery, DN, dice หรือ outcome และห้ามยัดกลับมาทุกฉากหรือรับประกันการพบใคร

เมื่อ AI ตอบสำเร็จ client จะ `applyRoll()` ก่อน แล้วจึงแทน narration/ชื่อฉาก/ทางเลือกด้วยข้อความที่ AI คืนมา, เพิ่ม memory ของ AI และ historical boundary ลง state. เครดิต AI ถูกหัก **หลัง** AI resolve สำเร็จ. หาก AI timeout, schema fail หรือหักเครดิตไม่สำเร็จ ระบบเซฟผลเดิมผ่าน Local Trial โดยไม่ทิ้งตาเล่น

## 5. Local Save: อะไรลง disk หลังจบตา

`PlayScene` ส่ง GameState ใหม่ผ่าน `onUpdate()` ไปยัง Home. Home ทำสองอย่างพร้อมกัน: อัปเดต `game` ที่กำลังเล่น และอัปเดตสำเนาแคมเปญนั้นใน `campaignLibrary`. จากนั้น effect ของ Home เขียน envelope ทั้งก้อนไปที่ `localStorage` key `dust-fire-local-game-v3-saika`.

```json
{
  "game": "แคมเปญที่กำลังเล่นหลัง commit",
  "saves": { "manual": "อาจเป็น null", "leaf2": "อาจเป็น null", "leaf3": "อาจเป็น null" },
  "campaignLibrary": "แคมเปญ Local Save ทั้งหมด",
  "language": "en หรือ th",
  "readerMode": true,
  "darkMode": false,
  "fontSize": "normal",
  "accent": "vermilion"
}
```

`game` ภายใน envelope ถือ Roll ledger, current scene, missions, inventory, economy transactions, memories, progression, background, historical boundary และ tick ล่าสุด. จึงปิดแท็บแล้วกลับมาได้โดยไม่จำเป็นต้องเรียก AI ซ้ำ. Manual Save/Leaf II/Leaf III เป็น snapshot แยกที่ผู้เล่นสร้างเอง; ลบได้เฉพาะหลังกด `DELETE` แล้ว `CONFIRM DELETE`, ขณะที่ Auto Save เป็น active game จึงไม่มีปุ่มลบ

## จุดที่ต้องจำเมื่อพัฒนาต่อ

1. **ห้ามให้ AI เป็นคนเขียนกติกา:** AI เขียนความหมายและผลเชิงเรื่อง; engine เป็นคน commit ตัวเลขและ state.
2. **ไม่ commit ก่อน Record:** RollRecord เป็น pending record จนกด Record This Result.
3. **บันทึกทุกผล แม้พลาด:** failure ยังเพิ่ม tick, เวลา, memory, scene ใหม่ และอาจได้ Trait/Mastery Progress หากเป็นงานที่ระดับ DN สูงพอ; แต่ไม่ทำภารกิจสำเร็จและไม่ให้รางวัล.
4. **Background ต้องเป็น optional hook:** เก็บไว้ใน state และ context, แต่ห้ามนำมาคิดโบนัสหรือบังคับ plot.
5. **AI failure ต้องไม่หยุดเกม:** ทุกเส้นทาง AI ต้องกลับ Local Trial ได้พร้อม Local Save ที่สมบูรณ์.

## Source pointers

| ส่วน | ไฟล์หลัก |
|---|---|
| คำนวณ preview, dice, Trait/Mastery Progress, เวลา, ภารกิจ, state commit | `client/src/lib/game.ts` |
| UI flow, animation, AI analyze/resolve, fallback | `client/src/features/play/PlayScene.tsx` |
| persistence envelope และ Local Save | `client/src/pages/Home.tsx` |
| AI schema, prompt และ timeout/structured-output guardrails | `server/gm.ts` |

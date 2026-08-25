# Dust & Fire: Sengoku Stories
## คอร์เกมฉบับ Source of Truth สำหรับ AI GM, หลังบ้าน และทีมพัฒนา

**สถานะเอกสาร:** กติกาใช้งานจริงและสัญญาระบบ (implementation-oriented)  
**ขอบเขต:** กติกาเกม, ลำดับการ resolve, โมเดลข้อมูล, การบันทึก, การทำงานของ AI GM, และ guardrails ทางประวัติศาสตร์  
**ไม่ครอบคลุม:** รายละเอียดตำแหน่งปุ่มหรือ CSS รายหน้า ยกเว้นเมื่อ UI เป็นส่วนหนึ่งของสัญญาการเล่น  
**ชื่อเกม:** **Dust & Fire: Sengoku Stories**

> **คำสัญญาหลักของเกม:** ผู้เล่นบอกว่าตัวละครทำอะไรเพียงหนึ่งประโยค ระบบตีความวิธีการ แล้วทอย 2d12 หรือยืนยันการผ่านด้วยไอเทมเฉพาะทาง บันทึกรอยของผลนั้น แล้วให้โลกตอบกลับเป็นฉากนิยายที่เล่นต่อได้

---

## 1. ขอบเขตเรื่องและหลักการห้ามละเมิด

Dust & Fire เป็น tabletop role-playing game เชิงนิยายประวัติศาสตร์ต้นฉบับในบริบทญี่ปุ่นยุคเซ็นโกกุ เกมสนใจการอยู่รอด อำนาจ เกียรติ หนี้ บุญคุณ ชุมชน และราคาของการเลือกข้าง ตัวละคร ผู้มอบงาน และผลลัพธ์ของแคมเปญเป็น **เรื่องสมมติ** เว้นแต่เกมจะมีหลักฐานอ้างอิงประวัติศาสตร์ที่ตรงจุดและระบุสถานะไว้ชัดเจน

| หลัก | กฎสำหรับผู้เล่น | สัญญาสำหรับระบบ |
|---|---|---|
| **Agency before procedure** | ผู้เล่นพูดเจตนา ไม่ต้องเลือก stat หรือคำนวณโบนัส | ระบบเป็นผู้เลือกแกน ความชำนาญ โบนัส และ DN แล้วอธิบายหลังยืนยัน |
| **Consequence before reward** | สำเร็จได้ แต่ต้องมีสิ่งเปลี่ยน | ทุกผลทอยต้องเปลี่ยนอย่างน้อยหนึ่ง state ที่ตามรอยได้ |
| **History is a boundary** | ประวัติศาสตร์ช่วยให้โลกน่าเชื่อ ไม่ใช่คำตอบสำเร็จรูป | ห้าม AI แต่งข้อเท็จจริง เหตุการณ์จริง ตำแหน่ง หรือธรรมเนียมเฉพาะขึ้นเอง |
| **Local-first continuity** | เกมต้องเล่นและบันทึกต่อได้แม้ AI ไม่ตอบ | 2d12, Local Save, Log, progression และผลพื้นฐานอยู่ฝั่ง deterministic client |
| **Status creates pressure** | เกียรติหรือความชำนาญไม่ใช่เกราะกันผลเสีย | โบนัสห้ามลบ DN, ลบพยาน, หรือบังคับ NPC ให้ยอมตามอัตโนมัติ |
| **Every gain has provenance** | ของ รางวัล สิทธิ์ และชื่อเสียงต้องมีที่มา | การเปลี่ยนทรัพยากรสำคัญต้องโยง `Mission`, `Memory`, `Agreement`, หรือ `RollRecord` |

### 1.1 สิ่งที่ห้ามทำ

AI GM และหลังบ้านต้องไม่ทอยแทนผู้เล่น, แก้ total ที่ deterministic engine ตัดสินแล้ว, เพิ่มโบนัสบริบทเกิน `+2`, เปลี่ยนทรัพยากรโดยไม่มี state transition ที่ตรวจได้, สร้างเงินจริง/คะแนนเครดิตเป็นรางวัลมาตรฐาน, หรือกล่าวว่า NPC สมมติมีตัวตนจริงในประวัติศาสตร์

---

## 2. วงจรการเล่นหลัก

การเล่นหนึ่งรอบไม่ใช่ลำดับ UI แต่เป็นสัญญา state transition ต่อไปนี้

```text
Declare Intent
  → Assess or Analyze
  → Deterministic 2d12 Roll or Specialized-Item Pass
  → Optional Momentum
  → Resolve Consequences
  → Apply Practice / Time / Mission / Reward
  → Record Memory / Agreement / Chronicle
  → Persist Auto Save
  → Present next playable scene
```

| ขั้น | อินพุตที่เชื่อถือได้ | ผลที่ต้องเกิด | สิ่งที่ห้ามเกิด |
|---|---|---|---|
| 1. Declare Intent | ประโยค action ของผู้เล่น | มีเป้าหมายหรือวิธีพอให้ parse ได้ | บังคับให้กรอก stat, skill หรือ DN |
| 2. Assess / Analyze | action + `GameState` | ความเสี่ยง; วิเคราะห์เต็มจึงเปิดแกน/วิชาที่ระบบเลือก | เฉลย skill ในโหมด assess risk |
| 3. Roll / Pass | `RollPreview` ที่ canonical | 2d12, total, DN, margin, outcome หรือผ่านด้วยไอเทมเฉพาะทางที่ตรงเงื่อนไข | AI สุ่มเต๋า แก้ outcome หรืออนุมัติไอเทมเอง |
| 4. Momentum | การเลือกผู้เล่นหลังเห็น roll | ลด Momentum 1 และเพิ่ม total `+2` ถ้าใช้ได้ | ใช้เมื่อ Momentum = 0 |
| 5. Consequence | `RollRecord` ที่ finalize | ฉาก/ความทรงจำ/สถานะทางสังคมหรือทรัพยากรเปลี่ยน | จบเพียงคำว่า success/fail |
| 6. Progression | mastery, outcome, difficulty, mission state | Mastery Progress, Level, time mark, อายุ, mission/reward ตามกฎ | แจก Progress จากการวนทอยไร้ผลหรือการผ่านด้วยไอเทม |
| 7. Persist | `GameState` ใหม่ | Auto Save และ Campaign snapshot อัปเดต | ทำให้ manual save เดิมหาย |

### 2.1 ภาษาของผู้เล่น

ผู้เล่นควรพูดเพียงหนึ่งประโยค เช่น

> “ข้าจะยื่นบัญชีข้าวของหมู่บ้านต่อหน้าผู้คุม เพื่อซื้อเวลาให้คนเก็บเกี่ยวกลับมา”

ระบบสามารถตีความได้ว่างานนี้เกี่ยวกับเอกสาร การต่อรอง พยาน และความเสี่ยงทางอำนาจ โดยผู้เล่นไม่ต้องพิมพ์ว่าใช้ `mind + Accounting` เอง

---

## 3. แกนการทอย 2d12

### 3.1 สูตร canonical

```text
baseDice = d12 + d12
total = baseDice + traitValue + masteryLevel + contextBonus + flawBonus + momentumBonus
margin = total - difficulty
```

| ส่วน | แหล่ง | ขอบเขต |
|---|---|---|
| `d12 + d12` | deterministic roll engine | 2–24 |
| `traitValue` | ค่า Trait จริงที่ระบบเลือก 1–10 | +1 ถึง +10 |
| `masteryLevel` | ระดับความชำนาญเฉพาะทาง | 0 ถึง +5 |
| `contextBonus` | ของ, เอกสาร, สถานที่, คนกลาง หรือบริบทที่ตรงแท็ก | 0 ถึง +2 |
| `flawBonus` | AI GM trigger จุดอ่อนที่เกี่ยวข้องโดยตรง | 0 หรือ −2 |
| `momentumBonus` | เลือกใช้หลังเห็นผล | 0 หรือ +2 |

### 3.2 ห้าแกน

| ID | English | ไทย | ใช้เมื่อ |
|---|---|---|---|
| `body` | Prowess | พละกำลัง | ฝ่า ต้าน ปีน แบก วิ่ง หรือยื้อแรง |
| `hand` | Craft | ฝีมือ | ใช้อาวุธ ซ่อม แกะ ยิง จับ หรือทำงานละเอียด |
| `wit` | Instinct | ไหวพริบ | หลบ ลอบ หนี หลอก สังเกต หรืออ่านจังหวะ |
| `mind` | Judgment | ปัญญา | อ่านบัญชี แผน เอกสาร หลักฐาน หรือวางเหตุผล |
| `heart` | Resolve | พลังใจ | ยืนหยัด สาบาน ขอร้อง ชักจูง หรือรับผิดชอบต่อหน้าใคร |

ระบบเลือก **วิธีหลัก** ไม่ใช่คำกริยาที่ดังที่สุด ตัวอย่าง การยื่นตราเพื่อให้ผ่านด่านคือ `mind` เมื่ออำนาจของเอกสารเป็นแกน; หากผู้เล่นแบกคนเจ็บปีนกำแพงจึงเป็น `body`. Trait มีค่า 1–10 และ engine บวก **ค่าจริง** เข้าผลทอยโดยตรง เช่น `mind = 3` จึงให้ `+3`; ไม่มี bonus tier และ Traits ไม่รับ XP แยก การเติบโตเชิงตัวเลขอยู่ที่ Mastery เท่านั้น

### 3.3 ระดับความยาก

AI อาจประเมินความยากเป็นตัวเลข แต่ client ต้อง canonicalize เป็น tier ที่มี guardrail. DN ต่ำใช้กับงานคุ้นมือหรือปลอดภัยจริง ไม่ใช่เพียงเพราะประโยคสั้น และคำเสี่ยงคำเดียวต้องไม่กระโดดเป็น DN22 หรือ 26 โดยไม่ดูวิชา/การเตรียมตัว.

| DN | ระดับ | ใช้กับ |
|---:|---|---|
| 0 | Specialized pass / ผ่านเฉพาะทาง | item ที่มีสิทธิ์ตรงตามเอกสาร/สถานการณ์เปิดทางให้ผ่านโดยไม่ทอย |
| 8 | Very easy / ง่ายมาก | พักฟื้น งานคุ้นมือที่ปลอดภัย หรือคุยกับคนที่ไว้ใจ |
| 10 | Easy / ง่าย | งานคุ้นเคยหรือการลาดตระเวนปลอดภัยที่มี mastery ตรง |
| 14 | Standard / มาตรฐาน | งานกลาง ๆ ที่ยังมีเดิมพันและต้องระวัง |
| 18 | Challenging / ท้าทาย | ด่าน ผู้คุม การตรวจ การปะทะ หรืองานเสี่ยงที่มีพยาน/ข้อครหา |
| 22 | Obstacle / อุปสรรค | แรงกดดันซ้อนที่ยังมีแผน เครื่องมือ หรือ mastery เป็นทางออก |
| 26 | Critical / วิกฤต | ฉากชี้ชะตาเกือบเป็นไปไม่ได้: การเสี่ยงผิดกฎหมายปะทะด่าน/ผู้คุม โดยไม่มี mastery หรือเครื่องมือช่วย |

ความชำนาญและ context ให้โบนัสที่ตรวจได้ในสูตร แต่ไม่ลบ DN เพื่อทำให้เดิมพันหายไป ยกเว้น **ไอเทมเฉพาะทาง** ที่ state ระบุ mode และ tags ชัดเจน เช่นหนังสือผ่านทางของแท้: deterministic engine ตรวจว่า item usable และ tags ตรงกับ action ก่อนตั้ง DN เป็น 0/ผ่านโดยไม่ทอย; AI GM ไม่มีสิทธิ์ให้สิทธินี้เอง

### 3.4 Outcome จาก margin

| Margin | Outcome ID | ความหมาย | ข้อกำหนดผลตามมา |
|---:|---|---|---|
| `≥ +5` | `decisive_success` | สำเร็จเด็ดขาด | เปิดทางชัด; ทิ้งรอยที่ถูกทวงได้ภายหลัง |
| `0..+4` | `success_with_cost` | สำเร็จแต่มีราคา | เพิ่มพยาน หนี้ ข่าว หรือเงื่อนไข |
| `-4..-1` | `partial_success` | ได้บางส่วน | ให้เวลา/ข้อมูล/ทางเลือก แต่แรงกดดันยังอยู่ |
| `≤ -5` | `failure_with_consequence` | ทางเดิมพัง | เพิ่ม stain, suspicion, cost หรือเปลี่ยนเส้นเรื่อง; ห้าม dead end |

### 3.5 Momentum

`Momentum` คือแรงฮึด ใช้ได้หนึ่งหน่วยหลังเห็นผลทอย เพิ่ม `+2` จาก **ผลเต๋าเดิมและ breakdown เดิม** แล้วลดค่า Momentum 1. มันไม่ทอยใหม่ ไม่ลบพยาน ไม่ทำให้บาดแผลหาย และไม่ลบผลตามมาทั้งก้อน. การผ่านด้วยไอเทมเฉพาะทางไม่มีผลเต๋า จึงใช้ Momentum ไม่ได้

ก่อนกดใช้ ผู้เล่นต้องเลือกแหล่งแรงฮึดที่ระบบตรวจได้จาก `GameState` และค่าใช้จ่ายจะถูกบันทึกพร้อม `RollRecord` และ `WorldMemory` เมื่อบันทึกผลแล้ว

| แหล่ง | เงื่อนไขใช้งาน | ค่าใช้จ่ายเมื่อบันทึกผล | ร่องรอยที่เก็บ |
|---|---|---|---|
| ใจมั่นที่ยังเหลือ | Momentum > 0, Focus > 0 และ Wounds < 6 | Focus −1 | ระบุว่าใช้ใจมั่นฝืนแรงกดดัน |
| เสบียงพกพา | มี `reserve` ที่ condition เป็น `usable` | item เปลี่ยนเป็น `used` | ระบุชื่อเสบียงและการใช้ของ 1 ชิ้น |
| คำค้ำ/บุญคุณเปิดอยู่ | มี obligation ชนิด `favor` สถานะ `open` | ผูกบุญคุณเพิ่มในบันทึกเรื่อง | ระบุผู้ค้ำและเงื่อนไขของเขา |

แหล่งเหล่านี้ให้โบนัส **เท่ากันคือ +2** เพื่อให้ระบบไม่กลายเป็นการกองโบนัส ความต่างอยู่ที่ราคาทางกาย สัมภาระ หรือความสัมพันธ์ที่เรื่องจะจำต่อไป

---

## 4. ตัวละครและค่าสถานะ

### 4.1 Character record

| กลุ่ม | ฟิลด์หลัก | ผลต่อเกม |
|---|---|---|
| Identity | name, identity, occupation, origin | ภาษาและสถานะของฉาก |
| Personal stakes | strength, weakness, flaws, pulls | จุดอ่อน 1–2 ข้อและแรงดึงที่ AI GM/Mission นำกลับมาตามบริบท |
| Resolution | attributes, masteries | Traits ใช้บวกผลทอยตรง; Mastery เป็น Progress/Level เดียวของการเติบโต |
| Vitals | wounds, focus, momentum | ความเปราะบางและการฝืนผล |
| Social | rank, honor, influence, information, stain | สิทธิ์เข้าถึงและแรงกดดันทางสังคม |
| Resources | property, supplies, credit, inventory | การเตรียมตัว การแลกเปลี่ยน และรางวัล |

### 4.2 Vitals

| ค่า | ขอบเขตปัจจุบัน | ความหมาย |
|---|---|---|
| Wounds / บาดแผล | 0–6 | บันทึกภาวะกายและต้นทุนเรื่อง; penalty/recovery เต็มรูปแบบเป็นงานอนาคต |
| Focus / ค่าสติ | 0–6 | ความมั่นคงท่ามกลางแรงกดดัน; stress loop เต็มรูปแบบเป็นงานอนาคต |
| Momentum / แรงฮึด | 0–2 | ใช้พลิก total หลัง roll ได้จริง |

### 4.3 สถานะทางสังคม

`Rank`, `Honor`, `Influence`, `Information`, และ `Stain` ไม่เป็นสิทธิ์บังคับ NPC. ผลที่ควรเกิดคือคนยอมฟัง, เอกสารถูกตรวจ, ข่าวแพร่, ความช่วยเหลือมีเงื่อนไข หรือความพลาดถูกจดจำ ปัจจุบัน Local Trial เพิ่ม `Information` เมื่อ partial success และเพิ่ม `Stain` เมื่อ failure with consequence.

### 4.4 แรงดึงหกข้อ

คำตอบ `first_survivor`, `stance`, `never_surrender`, `debts`, `hidden_knowledge`, และ `sacrifice` เป็น tag ทางเรื่อง ไม่ใช่ค่า stat. AI GM ต้องนำกลับมาเป็น NPC, คำขอ, ราคา, memory หรือการตัดสินใจที่ไม่สะดวกในภายหลัง

### 4.5 จุดอ่อนและ Flaw Trigger

ตัวละครสร้างใหม่เลือก Mastery 3–5 อย่างที่เริ่ม Level 1 และจุดอ่อน 1–2 อย่าง `flaws[]`. จุดอ่อนไม่เป็น penalty ถาวรและผู้เล่นไม่เป็นผู้ตัดสิน trigger. AI GM ต้องตรวจ action กับบริบทฉากก่อนทอย: หากจุดอ่อนหนึ่งข้อเกี่ยวข้องโดยตรง จึงส่ง `flawTriggered = true`, `triggeredFlaw`, เหตุผล และ `flawBonus = -2`; มิฉะนั้นส่ง `false`, `null`, และ `0` โดยไม่มีสถานะให้แสดง. deterministic engine เป็นผู้หัก −2 ก่อนเปรียบเทียบ DN และบันทึก breakdown ที่ตรวจได้.

---

## 5. Mastery Level และ Progress 0–5

### 5.1 หลักการ

ความชำนาญเป็นรายวิชา ไม่ใช่เลเวลรวม ตัวละครอาจเก่งบัญชีแต่ยังไม่เก่งปืนไฟ ทุก mastery มี `level` 0–5, `xp` (Progress ปัจจุบัน) และ `totalXp`. Level คือโบนัสตัวเลขของวิชานั้นโดยตรง และ Level 5 เป็นเพดาน

| Level | Bonus | ชื่อ | ความหมาย |
|---:|---:|---|---|
| 0 | +0 | ยังไม่ชำนาญ | ทำได้ด้วยเหตุผลในเรื่อง แต่ไม่มีการฝึกเฉพาะทาง |
| 1 | +1 | คุ้นมือ | เริ่มทำสิ่งนี้ได้เป็นระบบ |
| 2 | +2 | ชำนาญ | เป็นคนที่ทีมพึ่งพาได้ในงานนี้ |
| 3 | +3 | เชี่ยวชาญ | รับมือกับความกดดันและงานยากได้ |
| 4 | +4 | อาจารย์ | ความเชี่ยวชาญหายาก มีชื่อในสายงานนั้น |
| 5 | +5 | หาตัวจับไม่ได้ | ในแผ่นดินหาคนฝีมือใกล้กันแทบไม่ได้ |

### 5.2 Mastery Progress

Mastery ที่ใช้จริงใน roll ที่บันทึกแล้วและมี DN ตั้งแต่ 10 ได้ `+1 Progress`; หากผลเป็น decisive success ได้ `+2 Progress`. ทุกระดับ 0–4 ใช้ 5 Progress เพื่อขึ้นหนึ่ง Level. งาน DN 8 และการผ่านด้วยไอเทมเฉพาะทางไม่เพิ่ม Progress เพราะไม่มีการทดสอบวิชาจริง. Level 5 ไม่รับ Progress เพิ่ม

### 5.3 Migration ของเซฟเก่า

| โบนัสเดิม | Level ที่ย้ายไป | โบนัสหลัง migration |
|---:|---:|---:|
| +0 | 0 | +0 |
| +1 | 1 | +1 |
| +2 | 2 | +2 |
| +3 | 3 | +3 |
| +4 | 4 | +4 |
| +5 หรือ +6 | 5 | +5 |

`xp` เริ่มต้นเป็น 0 ของ Level ที่ mapped และ `totalXp` เริ่ม 0 หากไม่มีข้อมูลเก่า. โบนัสเก่า +6 ถูก normalize เป็นเพดานใหม่ +5 ตามกติกาใหม่

---

## 6. เวลา อายุ และ Leaf

### 6.1 เวลาไม่ใช่นาฬิกาเทียม

เวลาแบ่งเป็น `dawn`, `day`, `dusk`, `night`; แคมเปญมี `year`, `season`, `day`; progression เก็บ `timeMarksSinceLeaf` และ `daysSinceLeaf`.

| ลักษณะ action/result | การเดินเวลา |
|---|---|
| ตอบโต้ทันทีในที่เดิม | อาจไม่เปลี่ยนเวลา |
| ต่อรอง เฝ้าดู เตรียมของ ค้นหา | หนึ่ง time mark |
| เดินทาง ซ่อมยืดเยื้อ หลบซ่อน หรือผลใหญ่ | สอง time marks หรือปิดวัน |
| หลายวันสะสม | เปลี่ยน Leaf เมื่อ `daysSinceLeaf >= 4` |

Leaf จึงไม่เพิ่มทุก roll. การทดสอบต้องยืนยันว่าเวลาเคลื่อนหลายครั้งจนข้ามสี่วันจึงเปิด Leaf ใหม่ และ `daysSinceLeaf` รีเซ็ตหลังเปิด Leaf.

### 6.2 อายุ

`ProgressionState` เก็บ `ageAtCampaignStart`, `currentAge`, `birthSeason`, และ `campaignStartYear`. อายุเพิ่มต่อเมื่อปีแคมเปญผ่านปีเริ่มต้นและปฏิทินข้ามฤดูเกิด; ไม่เพิ่มจากจำนวน roll หรือจำนวน Leaf.

---

## 7. ฉาก Chronicle และความทรงจำโลก

### 7.1 Scene contract

```ts
type Scene = {
  id: string;
  chapter: string;
  title: string;
  location: string;
  publicContext: string;
  body: string[];
  speaker: string;
  prompt: string;
  pressure: string;
  suggestedActions: string[];
};
```

ฉากต้องมีสถานที่, สิ่งที่สาธารณะเห็น, แรงกดดัน, บุคคล/เสียงที่มีน้ำหนัก, และทางเลือกที่ทำได้จริง. หลัง resolve แบบ AI GM, narration ต้องมี **3 ย่อหน้า**; แต่ละย่อหน้า 120–1100 ตัวอักษร และความยาวรวมควรเป็นฉากอ่านได้ ไม่ใช่ summary สั้น.

### 7.2 World memory

`Memory` คือหลักฐานของสิ่งที่โลกจำ ไม่ใช่ log ตกแต่ง. ชนิดสำคัญคือ `news`, `witness`, `debt`, `favor`, `oath`, `stain`, `injury`, `market_change`, `community_change`, และ `actor_relation`.

ทุก memory ต้องมี title, detail, tone และ tick/leaf ที่ตามได้. Memory สำคัญต้องสะท้อนกลับเป็นความเสี่ยง โอกาส หรือปฏิกิริยาต่อ action ในอนาคต.

---

## 8. ภารกิจอัตโนมัติและรางวัล

### 8.1 Mission เป็นเส้นเรื่อง ไม่ใช่ปุ่มรับเควส

หน้า Missions เป็น **Mission Dossier** แบบอ่านอย่างเดียว. ผู้เล่นไม่กด accept หรือ complete. ระบบดูว่าผล action และ outcome ขยับ thread ที่เกี่ยวข้องหรือไม่.

| State | ความหมาย | พฤติกรรมระบบ |
|---|---|---|
| `offered` | เรื่องเข้ามาในระยะ | เริ่มจับ progress เมื่อ action แตะ trigger |
| `active` | แรงกดดันกำลังเคลื่อน | progression เปลี่ยนตาม roll ที่เกี่ยวข้อง |
| `resolved` | จุดงานคลี่คลาย | grant reward หนึ่งครั้ง, เขียน agreement, เก็บหลักฐานใน Chronicle |
| `lost` / changed | ทางเดิมปิดหรือแปรสภาพ | เก็บเหตุผล, ห้ามลบประวัติ |

### 8.2 Mission contract

```ts
type Mission = {
  id: string;
  issuer: string;
  issuerType: "commoner" | "merchant" | "samurai" | "temple" | "ruler";
  title: string;
  request: string;
  pressure: string;
  deadline: string;
  reward: string;
  risk: string;
  options: string[];
  state: MissionState;
  progress?: {
    current: number;
    required: number;
    triggerPhrases: string[];
    rewardGranted?: boolean;
  };
};
```

### 8.3 รางวัลตามฐานะผู้มอบงาน

| ผู้มอบ | รางวัลที่เหมาะ | ร่องรอยที่ควรเกิด |
|---|---|---|
| ชาวบ้าน | เสบียง แรงงาน ที่พัก ความคุ้มครอง | หนี้ชุมชนหรือความคาดหวังใหม่ |
| พ่อค้า | เครดิต ข่าว เส้นทาง สินค้าหายาก | คู่แข่ง พยานบัญชี หรือภาระชำระ |
| ซามูไร/บ้านใหญ่ | ใบผ่าน คำค้ำ สิทธิ์เข้าถึง | ชื่อถูกผูกกับบ้านนั้น |
| วัด/ศาลเจ้า | คนกลาง เอกสารรับรอง ที่พักพิง | การเมืองของความเป็นกลาง |
| ผู้ปกครอง | ทรัพยากร คำรับรอง สิทธิ์ผ่าน | ใกล้อำนาจและความเสี่ยงถูกโยง |

การ resolve mission ต้องเพิ่ม reward เพียงครั้งเดียวเมื่อ `rewardGranted !== true`, สร้าง `Agreement`/transaction, และเพิ่ม memory ที่อธิบายผล. ห้ามให้เงินสดเป็น default reward ทุกงาน.

---

## 9. ทรัพยากร ตลาด และสมุดสัญญา

### 9.1 Resources

| ทรัพยากร | ความหมาย |
|---|---|
| Property | สิ่งที่ยอมจ่ายหรือแลกเป็นมูลค่าได้ |
| Supplies | สิ่งยังชีพ ยา อาหาร ของเตรียมตัว |
| Credit | สิทธิ์ที่เครือข่ายยอมให้ใช้ก่อน |

### 9.2 Inventory

ประเภทหลักคือ `immediate`, `reserve`, `equipment`, `document`, `status`, และ `bond`. Item อาจมี condition, location, ownership, slots, context bonus และ tags. Bonus ใช้ได้เมื่อ item usable และ tag ตรง action/mastery โดยรวมไม่เกิน `+2`. Item เฉพาะทางต้องมี `special` mode และ tags ที่แคบพอจะยืนยันเงื่อนไขได้; เมื่อ item usable และ action ตรง tags deterministic engine เท่านั้นที่ตั้ง DN 0/ผ่านโดยไม่ทอยได้

### 9.3 Market

Market offer ต้องมีชนิด ราคา ราคาเหตุผล และความพร้อม. การรับ offer ที่ทำงานจริงต้องลด resource ที่ถูกต้อง, เพิ่ม item/service result, ปิด offer เมื่อใช้แล้ว, สร้าง market memory และลง `Agreement` หากมีผู้เกี่ยวข้อง/ราคาทางสังคม.

### 9.4 Agreements & Consequences

ชื่อเดิม **Exchange History** ถูกเลิกใช้ เพราะข้อมูลไม่ได้เป็นใบเสร็จอย่างเดียว. แต่ละ record ต้องตอบสี่คำถาม:

1. ใครเกี่ยวข้อง (`counterpart`)
2. สิ่งใดเปลี่ยนมือ (`payment`)
3. ใครจดจำ (`witness`)
4. ผลนี้เปิดหรือปิดทางใด (`consequence`)

```ts
type ExchangeRecord = {
  id: string;
  kind: "credit" | "debt" | "favor" | "purchase" | "reward";
  title: string;
  counterpart: string;
  payment: string;
  witness: string;
  consequence: string;
  tick: number;
};
```

---

## 10. AI GM และ Local Trial

### 10.1 อำนาจหน้าที่แยกกัน

| ส่วน | รับผิดชอบ | ห้ามทำ |
|---|---|---|
| Deterministic game engine | parse action, roll/pass, total, outcome, state mutation, Progress/time/mission/reward | แต่งร้อยแก้วแทน AI ในกรณีปกติ |
| AI GM analysis | intent, axis, suggested mastery, contextual risk, proposed ordinary difficulty, historical fence | ทอยเต๋า, เปลี่ยนทรัพยากร, โบนัสเกิน +2 หรือสร้าง/override DN 0 จาก item |
| AI GM resolution | ฉาก 3 ย่อหน้า, choices, memory prose, mission note, historical fence | แก้ total/outcome, สร้าง reward/state mutation เอง |
| Local Trial | fallback ที่ deterministic และบันทึก Local Save | หัก AI credit หรืออ้างว่า AI ตัดสิน |

### 10.2 Analyze response contract

```ts
type GMAnalysis = {
  intentSummary: string;
  axis: "body" | "hand" | "wit" | "mind" | "heart";
  suggestedMastery: string | null;
  difficulty: number;       // client canonicalizes DN ธรรมดา; DN 0 เป็นสิทธิ์ของ item engine เท่านั้น
  contextBonus: number;     // clamped 0..2
  contextReason: string;
  risk: string;
  confirmation: string;
  historicalFence: string;
  historicalStatus: HistoricalStatus;
};
```

### 10.3 Resolve response contract

```ts
type GMResolution = {
  sceneTitle: string;
  narration: [string, string, string];
  nextChoices: [string, string, string];
  memory: { title: string; detail: string; tone: "navy" | "teal" | "vermilion" | "ochre" };
  missionNote: string;
  historicalFence: string;
  historicalStatus: HistoricalStatus;
};
```

AI response timeout คือ 45 วินาที. เมื่อ timeout, error, credit ไม่พอ หรือ UI preview mode: ระบบต้อง fallback ไป Local Trial, ไม่หักเครดิต, บอกสถานะให้ผู้เล่นเข้าใจ และบันทึกผลต่อได้.

### 10.4 Historical status

| Status | ใช้เมื่อ |
|---|---|
| `fact-supported` | มี fact card ตรงกับข้อความเฉพาะที่กล่าว |
| `contextual-play` | ข้อเท็จจริงเชิงโครงสร้างช่วยกำกับฉากสมมติ |
| `campaign-fiction` | ตัวละคร เหตุการณ์ หรือรายละเอียดเป็นเรื่องของแคมเปญ |
| `insufficient-evidence` | ไม่มีหลักฐานพอสำหรับรายละเอียดที่ผู้เล่นถาม |

Fact card เลือกจากปี, domain ของ action/scene, ภูมิภาคเมื่อมี และ confidence. AI ต้องใช้ brief ที่คัดมาเท่านั้น และต้องบอก fence เมื่อคำขอเกินหลักฐาน.

---

## 11. GameState และ Local Save

### 11.1 โมเดลหลัก

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

`schemaVersion` ต้องเพิ่มเมื่อ migration เปลี่ยน shape. `normalizeGameState()` เป็นจุดเดียวที่รับ Local Save เก่าและต้องเติม default โดยไม่ลบ roll, inventory, mission, economy, save leaves หรือ bonus เดิม.

### 11.2 Save semantics

| ประเภท | ความหมาย | กฎ |
|---|---|---|
| Auto Save | สถานะล่าสุดหลัง campaign change | เขียนทับอัตโนมัติใน browser |
| Manual Save | snapshot ที่ผู้เล่นเลือกเก็บ | เขียนทับ slot เดิมได้ |
| Saved Leaf II/III | checkpoint ในเครื่องเพิ่มเติม | ไม่ใช่ campaign copy หรือระบบ Safekeeping แยก |
| Campaign Library snapshot | รายการแคมเปญ Local Save | ใช้เลือกกลับเข้าแคมเปญที่เคยเล่น |

คำใน UI ที่อนุญาตคือ **Save Game** และ **Load Game**. ห้ามกลับไปสร้างความเข้าใจว่ามีระบบ `Campaign Safekeeping` แยกต่างหาก.

---

## 12. ลำดับ applyRoll ที่เป็นสัญญา

ให้ถือลำดับต่อไปนี้เป็น canonical sequence ของ deterministic outcome:

1. รับ `RollRecord` ที่ total/outcome final แล้ว
2. เพิ่ม roll ลง history และเพิ่ม tick
3. ปรับ social/vitals/scene consequence ตาม outcome
4. เลือก Mastery ที่ใช้จริง และคำนวณ Progress เฉพาะ roll ที่ DN ตั้งแต่ 10 และไม่ใช่ specialized-item pass
5. เพิ่ม Level เมื่อ Progress ครบ 5 จนถึงเพดาน Level 5
6. สร้าง `lastPractice` record ซึ่งระบุ mastery, gained, level ก่อน/หลัง และ note
7. คำนวณ time marks, segment/day/season/year และ age transition
8. ตรวจ mission trigger/progress; resolve ได้เพียงครั้งเดียว
9. เมื่อ resolve: grant contextual reward, create agreement, create memory, set `rewardGranted`
10. อัปเดต scene/current pressure และ Chronicle-facing records
11. normalize ก่อน persist เพื่อรักษา invariant

**Atomicity rule:** ถ้าขั้นหนึ่งล้มเหลว ต้องไม่ commit บางส่วนของ reward หรือ mission completion. State ที่ส่งคืนจาก `applyRoll()` ต้องสมบูรณ์ในตัวเอง.

---

## 13. Invariants ที่ต้องทดสอบ

| Invariant | การตรวจ |
|---|---|
| Trait ใช้ค่าจริง | Trait 1/7/10 ให้ +1/+7/+10 โดยไม่มี bonus tier |
| Mastery อยู่ 0–5 | normalize ทุก mastery และ Level 5 เป็นเพดาน |
| Progress ของ Level 5 เป็น 0 | ห้ามรับ Progress ซ้ำ |
| Progress ใช้เกณฑ์เดียว | ทุก Level 0–4 ต้องใช้ 5 Progress เพื่อขึ้นระดับ |
| Progress ต่อ roll ไม่เกิน 2 | decisive success เป็นเพดาน +2 |
| DN 8 และ item pass ไม่เพิ่ม Progress | ไม่มีการทดสอบ Mastery ที่มีน้ำหนัก |
| Context/Gear ไม่เกิน +2 | item/context ทั้งหมดถูก clamp ก่อน resolve |
| Special item ต้องตรงเงื่อนไข | action ไม่ตรง tags ต้องกลับสู่ DN ปกติ |
| Momentum ไม่ติดลบ | ใช้ได้เฉพาะ > 0 |
| Leaf ไม่เพิ่มทุก roll | ต้องสะสมหลายวันจึงเปิด Leaf |
| อายุไม่เพิ่มตามจำนวน roll | เพิ่มเมื่อข้ามฤดูเกิดในปีหลังเริ่ม |
| Mission reward ให้ครั้งเดียว | `rewardGranted` ป้องกัน duplication |
| Agreement มี counterpart/payment/witness/consequence | reward และ transaction ทุกอันตามรอยได้ |
| AI ไม่เปลี่ยน roll final | total/outcome จาก deterministic engine เท่านั้น |
| AI failure ไม่หยุดการเล่น | Local Trial save โดยไม่หักเครดิต |
| เซฟเก่าโหลดได้ | normalize เติม progression/economy defaults |

---

## 14. สถานะการพัฒนาและช่องว่างที่ต้องไม่แอบอ้าง

| ระบบ | สถานะ | หมายเหตุ |
|---|---|---|
| 2d12, canonical DN, Momentum | ใช้งานจริง | deterministic client rules |
| Mastery Level 0–5, Progress 5 หน่วย, migration | ใช้งานจริง | Traits ไม่รับ XP แยก; regression ครอบคลุมกติกาหลัก |
| เวลา/อายุ/Leaf หลายวัน | ใช้งานจริง | Leaf เปลี่ยนหลังหลายวันสะสม |
| Mission dossier, auto progression, contextual reward | ใช้งานจริงใน vertical slice | ยังไม่ใช่ mission graph หลายเส้นเต็มรูปแบบ |
| Agreements & Consequences | ใช้งานจริง | บันทึกการแลกเปลี่ยน/รางวัล/ผลตามมา |
| Local Save + Auto Save | ใช้งานจริง | browser-first |
| AI GM + Local Trial fallback | ใช้งานจริง | provider timeout/failure ต้อง fallback |
| Wound, Focus, social thresholds | เก็บ state แล้ว | penalty, healing, faction access เต็มระบบยังไม่ครบ |
| Consumption, equipment wear, service resolution | โครงข้อมูลพร้อม | action loop เต็มระบบยังไม่ครบ |
| Multi-mission graph / expiry engine | ยังไม่ครบ | ห้ามสรุปว่าเป็น quest engine เต็มรูปแบบ |

---

## 15. คู่มือสั้นสำหรับระบบที่เรียกใช้เอกสารนี้

### สำหรับ AI GM

อ่านหัวข้อ 1, 2, 3, 7, 8, 10 และ 12. ใช้ action/context ที่ระบบส่งมา, คืน JSON ตาม schema เท่านั้น, รักษา outcome ที่ส่งเข้ามา, และเขียนฉากสามย่อหน้าที่มีรายละเอียดสัมผัส ปฏิกิริยา NPC และผลจับต้องได้.

### สำหรับหลังบ้าน

อ่านหัวข้อ 10, 11, 12 และ 13. หลังบ้านเป็น provider ของ AI/identity/credit เท่านั้น; ไม่ใช่ owner ของกติกา deterministic. ทุก procedure ต้อง validate input/output, จำกัดเวลา, ป้องกันสิทธิ์ และปล่อย client fallback ทำงานเมื่อ provider ใช้ไม่ได้.

### สำหรับการขยาย client

อ่านหัวข้อ 3–9, 11–14. การเพิ่มหน้าหรือ action ใหม่ต้องใช้ state transition เดิม, ไม่สร้าง hidden reward, แสดง provenance ของผลสำคัญ, และเพิ่ม regression ก่อนส่งมอบ.

---

## References

เอกสารฉบับนี้สังเคราะห์จาก source ภายในโครงการต่อไปนี้:

1. `client/src/lib/game.ts` — deterministic rules, progression, Local Save migration, economy และ mission transitions.
2. `server/gm.ts` — AI GM input/output schema, historical guardrail, timeout และ canonicalization.
3. `docs/dust-fire-deep-game-guide-th.md` — กติกาแกนเดิมและข้อกำหนดเชิงเรื่อง.
4. `docs/progression-time-mission-design-th.md` — การรีเซ็ต Step/XP, เวลา/อายุ, mission dossier, agreements และ Save/Load.
5. `client/src/lib/game.progression.test.ts` — regression ของ migration, Mastery Level/Progress, age, mission reward และ Leaf หลายวัน.

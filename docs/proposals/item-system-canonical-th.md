ITEM SYSTEM — CANONICAL DESIGN SPEC v1
0. หลักใหญ่ของระบบ
Item System ต้องแยกคำถาม 4 อย่างออกจากกัน:
1. ITEM คืออะไร?
        ↓
   category

2. ITEM อยู่ใน lifecycle แบบไหน?
        ↓
   kind

3. ITEM ใช้ทำอะไร?
        ↓
   functions / approved rules

4. ITEM ถูกใช้แล้วเกิดอะไร?
        ↓
   deterministic engine
ห้ามเอา 4 เรื่องนี้ไปรวมเป็น field เดียว
1. CATEGORY
category ตอบคำถาม:
“สิ่งนี้คืออะไรในโลกของเกม?”

ปัจจุบัน taxonomy มี 6 หมวด:
weapon
food
medicine
story
tool
status
PROJECT_ROADMAP.mdMD1.1 WEAPON
ความหมาย
สิ่งของที่มีหน้าที่เป็นอาวุธ
ตัวอย่าง:
- Katana
- Wakizashi
- Yari
- Tanto
- ธนู
ตัวอย่าง
label:
"ดาบเก่าจากช่างตีเหล็กแห่งซาไก"

category:
weapon

kind:
equipment

functions:
["bonus"]
บริบท
AI สามารถสร้าง:
“ดาบเก่าจากช่างตีเหล็กแห่งซาไก”

AI ห้ามตัดสินเองว่า
Combat +5

ถ้า rule อนุญาตเพียง +1/+2 ก็ต้องอยู่ในขอบเขตนั้น 
2. FOOD
ความหมาย
สิ่งที่เป็นอาหารหรือเสบียงสำหรับตัวละคร
ตัวอย่าง:
- ข้าว
- ข้าวแห้ง
- ปลาแห้ง
- อาหารเดินทาง
FOOD + IMMEDIATE
นี่คือ:
ได้รับแล้วกิน/ใช้ทันที

ตัวอย่าง:
NPC:
"รับข้าวนี่ไป กินเสีย"

        ↓

Item Generator

category = food
kind = immediate

        ↓

Engine

รับ Item
→ ใช้ทันที
→ Effect
→ ไม่เข้า Inventory
Narrative สามารถเป็น:
“ชายชรายื่นห่อข้าวให้เจ้า เจ้าเปิดห่อและกินมันตรงนั้น”

สำคัญ:
immediate ไม่ได้แปลว่า “มี effect”
มันแปลว่า:
ไม่เข้าสู่ inventory เพราะถูกใช้ทันที

3. FOOD + RESERVE
นี่คือข้าวแบบที่มึงเพิ่งกำหนดชัดเจนที่สุด
ซื้อข้าว 5 ห่อ
        ↓
category = food
kind = reserve
        ↓
Inventory
        ↓
ข้าว × 5
ต่อมา:
Player:
"กินข้าว"

        ↓

Engine
เลือก reserve item
        ↓
ใช้ 1
        ↓
Effect
        ↓
Inventory เหลือ 4
ดังนั้น:
🍚 ข้าว Immediate
ได้รับ
 ↓
กินทันที
 ↓
Effect
 ↓
จบ
🍚 ข้าว Reserve
ได้รับ
 ↓
เก็บ
 ↓
Inventory
 ↓
ผู้เล่นเลือกใช้
 ↓
Effect
Effect ของทั้งสองแบบสามารถเหมือนกันได้
สิ่งที่ต่างคือ lifecycle
4. MEDICINE
ความหมาย
สิ่งที่เกี่ยวข้องกับการรักษา/การแพทย์
ตัวอย่าง:
- ยาจีน
- สมุนไพร
- ยาทา
- ยารักษาแผล
MEDICINE + IMMEDIATE
ตัวอย่าง:
หมอรักษาแล้วให้ยากินตรงหน้า

category = medicine
kind = immediate
Flow:
ได้รับยา
 ↓
ใช้ทันที
 ↓
Engine
 ↓
ผลการรักษา
 ↓
ไม่เก็บ
Narrative:
“หมอยื่นยาถ้วยเล็กให้เจ้า เจ้ายกมันขึ้นดื่มทันที”

MEDICINE + RESERVE
ตัวอย่าง:
ซื้อยาจีนไว้ 3 ห่อ

category = medicine
kind = reserve
ซื้อ
 ↓
Inventory
ยา × 3
 ↓
ภายหลัง:
"ใช้ยา"
 ↓
Engine
 ↓
Effect
 ↓
ยาเหลือ 2
5. STORY
ความหมาย
สิ่งของที่มีคุณค่าทางเรื่องราว ข้อมูล หลักฐาน หรือ narrative context
ตัวอย่าง:
- จดหมาย
- บันทึก
- หลักฐาน
- ของที่มี provenance สำคัญ
- สิ่งของที่เชื่อมกับเหตุการณ์
STORY + DOCUMENT
category = story
kind = document
ตัวอย่าง:
“จดหมายประทับตราจากพ่อค้าในซาไก”

มันไม่ได้แปลว่า “ใช้แล้ว +HP”
มันอาจทำหน้าที่:
unlock information
unlock dialogue
unlock mission
เป็น evidence
แต่ ผลจริงต้องถูกกำหนดโดย rule/engine
STORY + BOND
อันนี้ ยังไม่ควรล็อก gameplay effect
เพราะ bond มีอยู่ใน ItemKind แต่ semantic ที่ใช้จริงใน repo ยังต้อง audit เพิ่ม
ตัวอย่างที่อาจเกิดขึ้นในอนาคต:
“ป้ายผ้าที่สหายมอบให้”

แต่เรายังไม่ควรเขียนว่า:
bond → +relationship 10
จนกว่า relationship rule จะถูกกำหนดจริง
6. TOOL
อันนี้สำคัญ เพราะ tool ไม่ใช่ lifecycle
tool ตอบว่า:
“มันเป็นเครื่องมือประเภทอะไร?”

ดังนั้น Tool สามารถมีหลาย kind
เชือก
category = tool
kind = reserve
เพราะถือไว้ก่อน แล้วค่อยใช้
ตะเกียง
category = tool
kind = equipment
เพราะต้องติดตั้ง/ถือเป็นอุปกรณ์ที่พร้อมใช้งาน
กุญแจที่ NPC ให้แล้วเปิดประตูทันที
category = tool
kind = immediate
รับกุญแจ
 ↓
เปิดประตู
 ↓
กุญแจไม่จำเป็นต้องเข้า Inventory
แผนที่
category = tool
kind = document
ถ้า design ของเกมถือว่า map เป็น document/tool
7. STATUS
นี่ต้องแยกให้ชัดมาก
category = status
หมายถึง:
สิ่งของที่ใช้แสดง/พิสูจน์สถานะ สิทธิ์ หรือสังกัดของตัวละคร

ไม่ใช่:
HP
Poison
Bleeding
Fatigue
พวกนั้นเป็น Character/Game State
ตัวอย่าง
label:
"ป้ายผ้าของบ้าน"

category:
status

kind:
status

functions:
["unlock"]
แนวคิดนี้สอดคล้องกับ item ที่มีอยู่จริงในข้อมูลเดิม ซึ่งมีป้ายบ้านที่คำอธิบายระบุว่าสามารถช่วยให้ผ่านบางประตูและเปิดเผยสังกัดได้
STATUS ITEM FLOW
ได้รับป้ายบ้าน
       ↓
status item
       ↓
เก็บไว้
       ↓
เจอด่านตรวจ
       ↓
Engine ตรวจสิทธิ์
       ↓
มี status item ที่ตรงเงื่อนไข?
       ↓
YES
       ↓
Unlock
แต่ตรงนี้ต้องแยก:
AI:
"ทหารเห็นป้ายของบ้านแล้วลังเลก่อนเปิดทาง"

Engine:
ตัดสินว่า unlock ได้หรือไม่ได้
AI เล่า
Engine ตัดสิน
นี่ตรงกับ architecture หลักของเกม ด้ คราวนี้กูรับบท บอสสถาปนิกหลัก เอ.txtTXT
8. KIND
ตอนนี้ให้จำง่าย ๆ:
CATEGORY = มันคืออะไร
KIND = มันเข้ามา/ถูกใช้งานใน lifecycle แบบไหน

IMMEDIATE
Definition
ได้รับแล้วใช้ทันที

receive
 ↓
use
 ↓
effect
 ↓
done
ไม่เข้า Inventory
ตัวอย่าง:
Category	ตัวอย่าง
food	NPC ให้ข้าวแล้วกิน
medicine	หมอให้ยาแล้วกิน
tool	ได้กุญแจแล้วเปิดประตูทันที


9. RESERVE
Definition
ได้รับแล้วเก็บไว้ใน Inventory เพื่อใช้ภายหลัง

receive
 ↓
inventory
 ↓
wait
 ↓
player uses
 ↓
effect
ตัวอย่าง:
Category	ตัวอย่าง
food	ข้าว 5 ห่อ
medicine	ยา 3 ห่อ
tool	เชือก
weapon	อาวุธสำรอง


10. EQUIPMENT
Definition
Item ที่ต้องถูก equip ก่อนจึงจะทำหน้าที่ในฐานะอุปกรณ์

ตัวอย่าง:
weapon + equipment
Inventory
 ↓
Equip
 ↓
Equipment Slot
 ↓
Engine ตรวจ equipped item
 ↓
effect/bonus
ระบบ Equipment ปัจจุบันรองรับ slot หลัก outfit และ weapon และการคำนวณ bonus ของ equipped item ถูกนำมาใช้ใน action resolution แล้วจากงานก่อนหน้า
11. DOCUMENT
Definition
Item ที่ทำหน้าที่เป็นเอกสาร/หลักฐาน/ข้อมูลที่ตัวละครถือครอง

ตัวอย่าง:
story + document
หรือบางกรณี:
tool + document
เช่น map/manual ถ้า design ของ item นั้นจัดเป็นเครื่องมือเชิงข้อมูล
12. STATUS KIND
Definition
Item ที่ตัวมันเองเป็นตัวแทนของสถานะ/สิทธิ์/สังกัด

ตัวอย่าง:
status + status
เช่น:
ป้ายบ้าน
ตราผ่านทาง
เครื่องหมายสังกัด

แต่ combination อื่นของ status ยังไม่ควรเปิดเอง
13. BOND KIND
Definition ปัจจุบัน
ยังเป็น reserved semantic
มี enum อยู่:
bond
แต่ก่อน implement gameplay ต้อง audit ว่าในเกมต้องการให้ bond item ทำหน้าที่อะไรจริง ๆ
ห้ามสรุปเองว่า:
bond = relationship +10
เพราะ relationship เป็น Game State แยกจาก Item
14. MASTER MATRIX
นี่คือตารางที่ AI ควรอ่านแล้วเข้าใจระบบ:
Category	Immediate	Reserve	Equipment	Document	Status	Bond
Weapon	⚪	🟡	🟢	—	—	—
Food	🟢	🟢	—	—	—	—
Medicine	🟢	🟢	—	—	—	—
Story	⚪	⚪	—	🟢	—	🟡
Tool	🟢	🟢	🟢	🟡	—	—
Status	—	—	🟡	🟡	🟢	🟡


Legend:
🟢 = semantic ชัด / ใช้เป็น design หลักได้
🟡 = เป็นไปได้ แต่ต้องมี rule รองรับก่อน
⚪ = เป็นไปได้ตามโครงสร้าง แต่ไม่ใช่ combination หลัก
— = ไม่ควรใช้
นี่เป็น Design Matrix ไม่ใช่การประกาศว่าทุกช่องมี implementation อยู่แล้ว
15. ITEM DATA STRUCTURE
แนวคิดของ Item ใน repo ปัจจุบันมีข้อมูลประมาณนี้:
InventoryItem {
    id
    label
    kind
    category
    slots
    description
    functions
    bonus
    special
    condition
    location
    ownership
}
โดย category เป็น player-facing classification และ legacy save บางส่วนอาจไม่มี category แล้วถูก classify ตอน normalization PROJECT_ROADMAP.mdMD
16. หน้าที่ของแต่ละ FIELD
Field	หน้าที่
id	ระบุ Item Instance ใน Save
label	ชื่อที่ผู้เล่นเห็น
kind	lifecycle / gameplay role
category	สิ่งของประเภทอะไร
slots	descriptor ของ item; ห้ามตีความเป็นจำนวน inventory slot ใหม่โดยพลการ
description	flavor/context สั้น ๆ
functions	ความสามารถที่ item ได้รับอนุญาตให้มี
bonus	deterministic modifier ที่ rule อนุญาต
special	special rule ที่ engine รองรับ
condition	usable/damaged/etc.
location	carried/safehouse/etc.
ownership	owned/borrowed/etc.


17. DESCRIPTION
อันนี้กูอยากล็อกให้ชัดมาก:
description = STATIC FLAVOR / CONTEXT
ตัวอย่าง:
label:
"ยาจีนเก่าจากร้านในซาไก"

description:
"ยาจีนเก่าที่ซื้อระหว่างทางผ่านซาไก"
AI ใช้ description เพื่อ:
- ทำให้ item มีบริบท
- เล่า provenance
- ทำให้ narrative สมจริง
- อ้างถึงสถานที่/คน/เหตุการณ์
ห้ามทำ
อย่าเอา description ไป parse แบบ:
description:
"ยาจีนเก่า + รักษา 20 HP"
แล้วให้ engine อ่าน 20 HP
ไม่เอา
เพราะนั่นเท่ากับเอา gameplay rule ไปซ่อนใน prose
18. AI GENERATION CONTRACT
AI ได้ input:
WORLD
├── year
├── era
├── season
├── location
├── region
└── occupation

STATE
├── character
├── faction
├── relationship
├── resources
└── current situation

ITEM RULES
├── allowed categories
├── allowed kinds
├── historical constraints
└── effect budget
จากนั้น AI สร้าง:
ITEM CONTENT
├── label
├── description
└── provenance/context
หลักนี้ตรงกับเอกสาร Procedural Generation ที่กำหนดว่า Item ให้ Data/Rules กำหนด category และ effect budget ส่วน AI สร้างชื่อ รูปลักษณ์ และ provenance 
19. AI ห้ามสร้างอะไร
AI ห้ามตัดสินเอง:
❌ HP +20
❌ Combat +5
❌ DN -4
❌ เพิ่มเงิน 100
❌ เพิ่ม reputation 20
❌ เพิ่ม mastery
❌ เปลี่ยน faction
❌ เปลี่ยน relationship
❌ กำหนดผล dice
AI ทำได้:
✅ ชื่อ
✅ description
✅ provenance
✅ รูปลักษณ์
✅ narrative
✅ context
แล้วส่งเข้าระบบ classification/validation
20. ITEM GENERATION PIPELINE
นี่คือหัวใจของระบบ:
WORLD
   ↓
STATE
   ↓
ITEM RULES
   ↓
AI GENERATOR
   ↓
Generated Item Content
   ↓
CLASSIFIER
   ↓
category + kind
   ↓
VALIDATOR
   ↓
Approved Item
   ↓
GAME ENGINE
   ↓
GAME STATE
   ↓
SAVE
หรือภาษาคน:
AI คิดว่า “ของชิ้นนี้ควรหน้าตา/ชื่อ/เรื่องราวเป็นยังไง”

Classifier บอกว่า “มันจัดอยู่หมวดอะไร”

Validator บอกว่า “จัดแบบนี้ได้ไหม”

Engine บอกว่า “มันมีผลอะไรจริง”

นี่ตรงกับ architecture ที่เอกสารวางไว้ว่า AI เป็น creative/narrative layer ส่วน deterministic engine เป็น authority PROJECT_ROADMAP.mdMD
21. ตัวอย่างเต็ม — ยาจีน
Context:
Year: 1585
Location: Sakai
Season: Autumn
Occupation: Merchant
Situation: Preparing to travel
AI:
{
  "label": "ยาจีนเก่าจากร้านในซาไก",
  "description": "ยาจีนเก่าที่ซื้อระหว่างทางผ่านซาไก",
  "provenance": "Purchased in Sakai"
}
Classifier:
{
  "category": "medicine",
  "kind": "reserve"
}
Validator:
medicine + reserve
→ ALLOWED
Engine:
สร้าง Item Instance
→ Inventory
ผู้เล่นภายหลัง:
"ใช้ยา"
Engine:
ตรวจ item
 ↓
ตรวจ rule
 ↓
คำนวณ effect
 ↓
แก้ GameState
 ↓
ลบ/เปลี่ยน condition ของ item
AI จึงค่อยเล่า:
“เจ้าหยิบยาจีนเก่าที่ซื้อจากซาไกออกมา…”

22. ตัวอย่าง Immediate
Context:
NPC:
หมอชราในหมู่บ้าน
AI:
{
  "label": "ยาสมุนไพรขม",
  "description": "ยาสมุนไพรต้มสดที่หมอเตรียมให้"
}
Classifier:
category = medicine
kind = immediate
Engine:
receive
 ↓
use immediately
 ↓
effect
 ↓
do not add inventory
AI narration:
“หมอยื่นถ้วยยาร้อนให้เจ้า เจ้ากลั้นใจดื่มมันจนหมดในคราวเดียว”

23. Save A / Save B
เรื่อง ID ต้องจำให้ชัด:
SAVE A
001 = ยาจีน

SAVE B
001 = ยาไทย
ไม่ใช่ปัญหา
เพราะ Item ID เป็น Save-local Item Instance ID
ไม่ต้องทำ global registry แบบ:
001 = ยาจีนตลอดทั้งเกม
เพราะ procedural generation ต้องสร้าง item ตามโลก/บริบทของแต่ละ save ได้
Architecture หลักของโปรเจกต์ก็วาง Game State เป็น save-specific อยู่แล้ว ด้ คราวนี้กูรับบท บอสสถาปนิกหลัก เอ.txtTXT
24. Context ไม่ใช่ Category
อันนี้สำคัญกับ AI มาก
เช่น:
“ยาจีนที่ซื้อระหว่างทางผ่านซาไก”

คำว่า:
"ระหว่างทางผ่านซาไก"
ไม่ใช่ category
ไม่ต้องสร้าง:
category = travel
มันคือ:
context / provenance
ดังนั้น:
category = medicine
kind = reserve

description =
"ยาจีนเก่าที่ซื้อระหว่างทางผ่านซาไก"
พอแล้ว
25. ITEM INSTANCE vs ITEM TYPE
เราควรคิด 2 ชั้น:
ITEM TYPE
    ↓
medicine + reserve

ITEM INSTANCE
    ↓
id = save-local-001
label = "ยาจีนเก่าจากร้านในซาไก"
description = "..."
Type = กฎ
Instance = ของจริงที่ตัวละครถือ
นี่จะสำคัญมากเวลา AI สร้างของ procedural จำนวนมาก
26. Communication Contract กับ AI
เวลาส่งข้อมูลให้ AI ควรสื่อแบบนี้:
ITEM GENERATION CONTEXT

World:
- Era: Sengoku
- Year: 1585
- Location: Sakai
- Season: Autumn

Character:
- Occupation: Merchant
- Current situation: Preparing to travel

Allowed Item Categories:
- weapon
- food
- medicine
- story
- tool
- status

Allowed Item Kinds:
- immediate
- reserve
- equipment
- document
- status
- bond

Rules:
- Item must be historically plausible.
- Do not invent gameplay effects.
- Do not assign stat bonuses.
- Do not modify game state.
- Generate only label, description and provenance.
AI response:
{
  "label": "...",
  "description": "...",
  "provenance": "..."
}
จากนั้น Backend เป็นคน classify
ไม่ใช่:
AI:
category = medicine
kind = reserve
effect = +10 HP
แล้วเชื่อทั้งหมด
27. Backend Classifier
Classifier ควรตอบประมาณ:
{
  "category": "medicine",
  "kind": "reserve"
}
ถ้าต้องการ effect:
{
  "effect_rule_id": "medicine.reserve.standard"
}
แทนการให้ AI เขียน:
heal = 10
เพราะ effect ต้องมาจาก rule table / engine
28. Validator
Validator ตรวจ:
1. category ถูกต้องไหม?
2. kind ถูกต้องไหม?
3. combination อนุญาตไหม?
4. อยู่ในยุคไหม?
5. อยู่ใน location/context ได้ไหม?
6. function ที่ขอมี rule รองรับไหม?
7. bonus อยู่ใน budget ไหม?
8. special อยู่ใน whitelist ไหม?
ถ้าไม่ผ่าน:
REJECT
หรือ
RECLASSIFY
ไม่ใช่ปล่อย AI ผ่านเพราะ “ดูสมจริง”
29. สิ่งที่ AI ควรพูดกับ Engine
ไม่ควร:
"ยานี้เพิ่มเลือด 15"
ควร:
"ผู้เล่นได้รับยาจีนจากหมอในซาไก"
แล้วระบบแปลง:
Generated Content
       ↓
Classifier
       ↓
medicine / reserve
       ↓
Rule
       ↓
Engine Effect
30. สิ่งที่ Engine ส่งกลับให้ AI
Engine ควรส่ง fact ที่เกิดขึ้นจริง
เช่น:
{
  "item_received": true,
  "item_label": "ยาจีนเก่าจากร้านในซาไก",
  "item_category": "medicine",
  "item_kind": "reserve",
  "inventory_changed": true
}
AI จึงเอา fact นี้ไปเล่า:
“เจ้าจัดห่อยาจีนเก็บไว้ในสัมภาระ ก่อนออกเดินทางจากซาไก”

ถ้า Engine บอก:
immediate
effect applied
inventory unchanged
AI ก็ต้องเล่าตามนั้น
31. Golden Rule
เอาอันนี้ไปไว้บนสุดของ prompt AI ได้เลย:
AI may generate the story of an item, but AI does not define the game's rules for that item.

ภาษาไทย:
AI มีอิสระในการสร้าง “เรื่องราวของไอเท็ม” แต่ไม่มีอิสระในการกำหนด “กฎของไอเท็ม”

เพราะนี่คือหลักเดียวกับระบบ Procedural Generation ทั้งเกม:
โครงสร้าง + กฎ เรากำหนดเอง / รายละเอียดในบริบท ให้ AI สร้าง Rule-based Procedural Generation.txtTXT
32. สรุปทั้งหมดในภาพเดียว
                    WORLD
          ┌──────────┼──────────┐
          ↓          ↓          ↓
        Year      Location    Season
          │
          ↓
        STATE
          │
          ↓
      ITEM RULES
          │
          ↓
     ┌─────────────┐
     │ AI GENERATOR│
     └─────────────┘
          │
          │ สร้าง
          ↓
    label / description
    provenance / context
          │
          ↓
      CLASSIFIER
          │
       ┌──┴──┐
       ↓     ↓
   category  kind
       │     │
       └──┬──┘
          ↓
       VALIDATOR
          │
          ↓
     APPROVED ITEM
          │
          ↓
     GAME ENGINE
          │
          ├── inventory
          ├── equipment
          ├── effect
          ├── unlock
          └── state mutation
          │
          ↓
       GAME STATE
          │
          ↓
          SAVE
และ immediate / reserve ที่เราล็อกใหม่
IMMEDIATE
"ได้แล้วใช้เลย"

NPC ให้ข้าว
    ↓
กินทันที
    ↓
Effect
    ↓
ไม่เก็บ


RESERVE
"ได้แล้วเก็บ"

ซื้อข้าว 5 ห่อ
    ↓
Inventory ×5
    ↓
ผู้เล่นเลือกกิน
    ↓
ใช้ 1
    ↓
Effect
    ↓
เหลือ 4
นี่แหละ semantic ที่กูว่าเราควรใช้เป็นฐานต่อไป



description จะไม่ได้มีไว้แค่สวยงามแล้ว แต่เป็น บริบทที่ Engine ใช้ตรวจความเหมาะสมตอนผู้เล่น “มอบสิ่งของ” ก่อนทอย
ข้อ: Item Description & Context Provenance
description ต้องให้ AI เจนจาก ข้อเท็จจริงของที่มาและบริบท ไม่ใช่คำบรรยายลอย ๆ โดยควรระบุให้ได้ว่า:
- ใครเป็นผู้ให้/มอบ/ซื้อ/พบ
- มาจากเมือง/พื้นที่ไหน
- ได้มาในเหตุการณ์อะไร
- เกี่ยวข้องกับใครหรือฝ่ายใด
- มีคุณค่าทางความสัมพันธ์/เรื่องราวหรือไม่
- มีความหมายต่อสถานการณ์ปัจจุบันหรือไม่
แต่ AI ห้ามสร้างคุณค่าทาง Gameplay เอง เช่น +2 Relationship — AI เพียงบันทึก ข้อเท็จจริง/บริบท แล้ว Engine เป็นคนประเมิน
AI
↓
"ดาบเล่มนี้เคยได้รับจากกันทาโร่
ระหว่างเดินทางผ่านซาไก"
↓
Context / Provenance
↓
Player กด "+"
"มอบดาบคืนให้กันทาโร่
เพื่อสร้างความไว้วางใจ"
↓
Engine ตรวจ
├─ Item มาจากกันทาโร่จริง? ✓
├─ ผู้รับคือกันทาโร่? ✓
├─ สถานการณ์ = เจรจา/ซื้อใจ? ✓
└─ Item มี Relationship Value? ✓
↓
Context Bonus / Auto-pass / Relationship Effect
↓
ค่อยทอย หรือผ่านตาม Rule
ตัวอย่าง
Description
“ดาบเล่มนี้เป็นของที่กันทาโร่มอบให้เจ้าเมื่อครั้งพบกันที่ซาไก”

ผู้เล่น:
มอบดาบคืนให้กันทาโร่ เพื่อแสดงว่าเจ้ายังจำบุญคุณของเขาได้

Engine พบว่า:
ผู้ให้เดิม = กันทาโร่
ผู้รับ = กันทาโร่
บริบท = สร้างความไว้วางใจ
Item = มีคุณค่าทางความสัมพันธ์
จึงอาจได้:
Context Bonus +2
Relationship +X
หรือ
Auto-pass
แต่ตัวเลขและเงื่อนไขทั้งหมดต้องมาจาก Rule ของเกม ไม่ใช่จาก AI
สรุปสั้น ๆ:
Description = Provenance + Context + Meaning
AI เจน “ความจริงและเรื่องราวของสิ่งของ” → Engine อ่านบริบทเพื่อพิจารณาคุณค่าต่อ Action → Rule ตัดสินโบนัส/ผลลัพธ์

อันนี้จะทำให้ระบบ + มอบสิ่งของก่อนทอย โคตรมีประโยชน์ เพราะไอเท็มไม่ได้เป็นแค่ “ของในกระเป๋า” แต่มี ประวัติและความหมายที่ผูกกับโลกของเกม.
# TIME SYSTEM — CORE ARCHITECTURE

## Three-Layer Time + Dynamic Activity Duration + Historical Timeline + Seasonal Pressure

ระบบเวลาของ **SENGOKU DUST n FIRE** ไม่ได้มีหน้าที่เพียงแสดงว่า “ตอนนี้กี่โมง” หรือ “ผ่านมาแล้วกี่วัน”

เวลาเป็นส่วนหนึ่งของ Gameplay และเป็นกลไกที่ทำให้โลกดำเนินต่อไปโดยไม่หยุดรอผู้เล่น

ผู้เล่นควบคุมว่า **ตัวละครจะทำอะไร**

แต่ผู้เล่นไม่ได้ควบคุมว่า **สิ่งที่ทำจะใช้เวลานานเท่าไร**

กิจกรรมแต่ละอย่างมี Duration ที่เหมาะสม และ Duration นั้นจะทำให้เวลาใน Campaign เดินหน้าโดยอัตโนมัติ

หลักการใหญ่:

> \*\*Action → Activity → Duration → Time Advance → World Consequence\*\*

ระบบเวลาประกอบด้วย 4 ระบบหลัก:

1. **Three-Layer Time Architecture** — โครงสร้างเวลา
2. **Dynamic Activity Duration System** — เครื่องเดินเวลา
3. **Historical Timeline** — แรงกดดันจากโลกภายนอก
4. **Seasonal Pressure** — ตัวปรับ Duration และ Consequence

ทั้ง 4 ระบบต้องทำงานร่วมกัน แต่ต้องไม่ถูกปนกันเป็นระบบเดียว

\---

# 1\. Three-Layer Time Architecture

## โครงสร้างเวลา 3 ชั้น

เวลาใน Campaign แบ่งเป็น 3 ระดับ

```text
Season / Year
      ↓
Day / Leaf
      ↓
Time Segment
```

แต่ละระดับมีหน้าที่แตกต่างกัน

\---

## 1.1 Time Segment

หน่วยเวลาระดับ Micro

ค่าที่ใช้:

```text
dawn
day
dusk
night
```

ใช้สำหรับกำหนดบริบทของฉากและกิจกรรมระยะสั้น

### Dawn

ช่วงก่อนและรอบพระอาทิตย์ขึ้น

ตัวอย่าง:

* เมืองกำลังเริ่มตื่น
* ตลาดบางแห่งยังไม่เปิด
* คนงานกำลังเริ่มงาน
* NPC บางคนยังไม่พร้อมรับแขก
* การเดินทางบางประเภทสามารถเริ่มต้นได้ดี

### Day

ช่วงกลางวันและกิจกรรมหลักของชีวิตประจำวัน

ตัวอย่าง:

* ตลาดเปิด
* การค้าขาย
* งานแรงงาน
* การเดินทาง
* การพบปะ NPC
* ภารกิจทั่วไป

### Dusk

ช่วงเย็น

ตัวอย่าง:

* ตลาดเริ่มปิด
* คนเริ่มกลับบ้าน
* การเดินทางเริ่มมีความเสี่ยง
* NPC บางคนเตรียมตัวกลับ
* แสงและทัศนวิสัยเปลี่ยน

### Night

ช่วงกลางคืน

ตัวอย่าง:

* ตลาดทั่วไปปิด
* NPC ส่วนใหญ่พักผ่อน
* การเดินทางมีความเสี่ยงเพิ่ม
* การลอบเร้นหรือกิจกรรมบางประเภทอาจได้เปรียบ
* เหตุการณ์บางอย่างเกิดขึ้นเฉพาะกลางคืน

**Time Segment ไม่ใช่ Turn**

การเปลี่ยน Segment ไม่ได้หมายความว่าผู้เล่นมี Action Point หมด

Segment เป็นตัวบอกว่า:

> \*\*โลกอยู่ในช่วงเวลาใด\*\*

\---

# 1.2 Day / Leaf

เป็นระดับกลางของเวลา

ใช้ติดตาม:

* วันปัจจุบันของ Campaign
* จำนวนวันที่ผ่านไป
* `daysSinceLeaf`
* การเปลี่ยน Leaf
* เหตุการณ์ที่เกิดขึ้นเมื่อเวลาผ่านไป

ตัวอย่าง:

```text
Day 42
Leaf 7
daysSinceLeaf = 3
```

เมื่อกิจกรรมทำให้เวลาผ่านหลายวัน:

```text
Day 42
↓
Day 43
↓
Day 44
```

ระบบต้องประมวลผล Consequence ของแต่ละวันที่ผ่านไปตามกฎที่กำหนด

เช่น:

* Supplies ถูกใช้
* NPC เปลี่ยนตำแหน่ง
* Mission deadline ขยับเข้าใกล้
* Market state เปลี่ยน
* Faction activity ดำเนินต่อ
* Fatigue / recovery เปลี่ยนตามกิจกรรม

\---

# 1.3 Season / Year

เป็นระดับ Macro ของเวลา

ตัวอย่าง:

```text
Spring 1569
Summer 1569
Autumn 1569
Winter 1569
Spring 1570
```

Season ไม่ใช่เพียง cosmetic

ฤดูกาลสามารถเปลี่ยน:

* การเดินทาง
* สภาพถนน
* การเกษตร
* ราคาอาหาร
* แรงงาน
* การค้า
* เสบียง
* สภาพอากาศ
* Maritime conditions
* ความเสี่ยงของบางเส้นทาง
* กิจกรรมของ NPC

ดังนั้น:

> \*\*Season เป็น Environment Modifier ของโลก\*\*

\---

# 2\. Dynamic Activity Duration System

## เครื่องเดินเวลา

นี่คือระบบหลักที่ทำให้เวลาเดิน

หลักการ:

> \*\*Action → Activity → Duration → Time Advance → World Consequence\*\*

ผู้เล่นไม่ควรต้องกด:

> “End Turn”

เพื่อทำให้เวลาเดิน

และไม่ควรมีระบบหลักที่บังคับให้ผู้เล่นใช้:

> `Time Token`

เพื่อจ่ายค่าเวลา

เวลาเกิดขึ้นเพราะ **กิจกรรมที่ผู้เล่นเลือกทำมีระยะเวลาจริง**

\---

# 2.1 ผู้เล่นเลือก Action แต่ไม่ได้เลือก Duration โดยตรง

ตัวอย่าง:

ผู้เล่น:

> “ฉันไปช่วยชาวบ้านเกี่ยวข้าว”

ผู้เล่นเลือก **Action**

ระบบจำแนกว่า:

```text
Activity Type = Labor
Duration Class = Long
```

จากนั้น Engine คำนวณ Duration

เช่น:

```text
Duration = 2 Segments
```

เวลา:

```text
Day → Dusk → Night
```

ผลลัพธ์:

```text
Fatigue ↑
Harvest Progress ↑
```

ผู้เล่นกลับมาจากกิจกรรมในช่วงกลางคืน

ระบบจึงสามารถบอก:

> “งานเสร็จแล้ว เมื่อยกฟ่อนสุดท้ายขึ้นเกวียน แสงสุดท้ายก็หายไปจากท้องฟ้า”

จากนั้น:

```text
Time = Night
Fatigue = High
```

ผู้เล่นจะเข้าใจเองว่า:

> “วันนี้กูหมดแล้ว ควรนอน”

\---

# 2.2 Duration เป็นส่วนหนึ่งของ Activity

กิจกรรมต้องมี Duration ที่สมเหตุสมผล

ไม่ใช่ทุก Action ใช้เวลาเท่ากัน

แบ่งกว้าง ๆ เป็น:

### Short Activity

กิจกรรมสั้น

ตัวอย่าง:

* เปิดประตู
* ตรวจสินค้า
* ถามคำถามสั้น ๆ
* หยิบของ
* ตรวจบาดแผล
* มองพื้นที่รอบตัว

อาจ:

```text
Duration = 0
```

หรือใช้เวลาเพียงเล็กน้อยโดยไม่เปลี่ยน Segment

\---

### Medium Activity

กิจกรรมที่ใช้เวลาพอสมควร

ตัวอย่าง:

* ต่อรองราคา
* ซ่อมอุปกรณ์
* ฝึกวิชา
* สืบข่าว
* เฝ้ารอคน
* เดินทางระยะใกล้

อาจใช้:

```text
1 Segment
```

เช่น:

```text
Day → Dusk
```

\---

### Long Activity

กิจกรรมที่ต้องใช้เวลาต่อเนื่อง

ตัวอย่าง:

* ทำงานทั้งวัน
* ฝึกหนัก
* เดินทางข้ามพื้นที่
* เฝ้าระวังหลายชั่วโมง
* ซ่อมสิ่งของขนาดใหญ่
* เตรียมเสบียงจำนวนมาก

อาจใช้:

```text
2+ Segments
```

หรือ:

```text
หลายวัน
```

\---

# 2.3 Duration ไม่จำเป็นต้องเป็นตัวเลขชั่วโมง

เกมไม่จำเป็นต้องจำลองเวลาแบบ:

```text
13:42
14:18
15:07
```

เพราะจะทำให้ระบบละเอียดเกินความจำเป็น

ใช้ระดับที่มีความหมายต่อ Gameplay:

```text
Segment
Day
Multiple Days
```

ตัวอย่าง:

```text
Duration = 1 Segment
Duration = 2 Segments
Duration = 1 Day
Duration = 3 Days
```

Engine จึงสามารถเดินเวลาโดยไม่ต้องจำลองนาฬิกาจริงทุกนาที

\---

# 3\. AI กับ Game Engine ต้องแบ่งหน้าที่กันชัดเจน

นี่เป็นกฎสำคัญ

## AI มีหน้าที่:

* เข้าใจสิ่งที่ผู้เล่นต้องการทำ
* จำแนก Activity
* ประเมินประเภทของกิจกรรม
* ประเมิน Duration ที่เหมาะสม
* อธิบายกิจกรรมใน Narrative

## Game Engine มีหน้าที่:

* ยืนยัน Duration
* Advance Campaign Time
* เปลี่ยน Segment
* เพิ่ม Day
* เปลี่ยน Season
* คำนวณ Consequence
* Update World State

ดังนั้น:

> \*\*AI interprets the activity.  
> Engine advances the clock.\*\*

AI ไม่ควรสามารถเปลี่ยนเวลาใน State โดยตรงเพียงเพราะมัน “เล่า” ว่าเวลาผ่านไป

\---

# 4\. Contextual Duration

## กิจกรรมเดียวกันอาจใช้เวลาไม่เท่ากัน

Duration ต้องสามารถเปลี่ยนตามบริบท

ตัวอย่าง:

> “ซ่อมเกวียน”

สถานการณ์ปกติ:

```text
Base Duration = 1 Segment
```

ถ้า:

* เครื่องมือพร้อม
* มีช่างช่วย
* สถานที่เหมาะสม

อาจเป็น:

```text
Final Duration = 1 Segment
```

แต่ถ้า:

* เครื่องมือไม่ครบ
* ฝนตก
* ผู้เล่นบาดเจ็บ
* ต้องทำคนเดียว

อาจเป็น:

```text
Final Duration = 2 Segments
```

หลักการ:

> \*\*Base Duration + Context Modifiers = Final Duration\*\*

\---

# 5\. Travel เป็น Activity

การเดินทางไม่ใช่ Teleport

ตัวอย่าง:

> “เดินทางไปหมู่บ้านถัดไป”

ระบบ:

```text
Activity = Travel
Route = Village A → Village B
Base Duration = 2 Segments
```

เวลา:

```text
Day → Dusk → Night
```

ผล:

```text
Fatigue ↑
```

ผู้เล่นมาถึง:

```text
Night
```

ดังนั้น NPC บางคนอาจไม่สามารถพบได้

```text
NPC Schedule:
Available = Dawn / Day
Unavailable = Night
```

ผลลัพธ์จึงไม่ใช่:

> “NPC ไม่อยู่ เพราะ AI อยากให้ไม่อยู่”

แต่เป็น:

> \*\*NPC ไม่อยู่เพราะ World Clock เดินมาถึง Night\*\*

\---

# 6\. ตัวอย่างกิจกรรมยาวจน "หมดวัน"

ผู้เล่น:

> “วันนี้ฉันจะช่วยชาวบ้านเกี่ยวข้าว”

เริ่ม:

```text
Season = Autumn
Day = 18
Segment = Dawn
```

ระบบ:

```text
Activity = Harvest Work
Duration = Long
```

เวลา:

```text
Dawn
↓
Day
↓
Dusk
↓
Night
```

ระหว่างกิจกรรม:

```text
Harvest Progress ↑
Fatigue ↑
```

เมื่อกิจกรรมเสร็จ:

```text
Segment = Night
Fatigue = High
```

ระบบไม่ต้องถาม:

> “ต้องการจบวันหรือไม่?”

เพราะวันได้จบไปแล้วตามธรรมชาติของกิจกรรม

นี่คือแก่นของระบบ

\---

# 7\. ผู้เล่นสามารถ "วางแผนพลาด" เพราะเวลา

เวลาไม่ควรเป็นแค่ตัวเลข

มันควรสร้าง Consequence

ตัวอย่าง:

ผู้เล่นคิด:

> “ตอนเช้าจะทำงาน แล้วตอนบ่ายไปตลาด”

แต่การทำงานใช้เวลานานกว่าที่คาด:

```text
Dawn
↓
Day
↓
Dusk
```

เมื่องานเสร็จ:

```text
Market = Closed
```

ผู้เล่นไปตลาดไม่ได้

นี่ไม่ใช่การลงโทษแบบสุ่ม

แต่มันคือ:

> \*\*Consequence จากเวลาที่ผู้เล่นเลือกใช้\*\*

\---

# 8\. Long Activity สามารถกินเวลาหลายวัน

กิจกรรมบางอย่างไม่ควรหยุดที่ Night

ตัวอย่าง:

> “เดินทางไปอีกแคว้น”

ระบบ:

```text
Activity = Long Travel
Duration = 3 Days
```

Campaign:

```text
Day 20
↓
Day 21
↓
Day 22
↓
Day 23
```

ระหว่างนั้น:

```text
Supplies ↓
Fatigue ↑
Mission Deadline ↓
World Events Advance
```

เมื่อถึงปลายทาง:

```text
Day 23
```

ผู้เล่นไม่ได้ “กดผ่าน 3 วัน”

แต่:

> \*\*การเดินทางของเขาใช้ชีวิตไป 3 วัน\*\*

\---

# 9\. Activities สามารถถูกขัดจังหวะได้

Long Activity ไม่จำเป็นต้องสำเร็จเสมอ

ตัวอย่าง:

```text
Travel
Duration = 2 Days
```

แต่ระหว่างทางเกิด:

```text
Bandit Encounter
```

หรือ:

```text
Storm
```

หรือ:

```text
Road Block
```

ระบบสามารถ:

```text
Pause Activity
↓
Resolve Event
↓
Continue / Abort / Extend Duration
```

เช่น:

```text
Expected Duration = 2 Days
Actual Duration = 3 Days
```

เพราะเหตุการณ์ระหว่างทางทำให้เสียเวลา

\---

# 10\. Rest เป็น Activity

การนอนต้องถูกมองว่าเป็นกิจกรรม ไม่ใช่ปุ่ม Reset

ตัวอย่าง:

```text
Activity = Sleep
Duration = Overnight
```

ก่อนนอน:

```text
Night
Fatigue = High
```

หลังพัก:

```text
Dawn
Fatigue ↓
Focus ↑
Recovery occurs
Supplies ↓
Day +1
```

ผลลัพธ์ของการพักขึ้นอยู่กับ:

* สภาพร่างกาย
* สถานที่พัก
* ความปลอดภัย
* บาดแผล
* อุปกรณ์
* สภาพอากาศ
* อาหารและเสบียง

ดังนั้น:

> \*\*Sleep advances time and recovers the player according to the world state.\*\*

\---

# 11\. Time Advance ต้องสร้าง World Consequence

ทุกครั้งที่เวลา Advance ระบบต้องตรวจสอบสิ่งที่ได้รับผลจากเวลา

ตัวอย่าง:

```text
Time Advance
      ↓
Player State
      ↓
World State
      ↓
NPC Schedule
      ↓
Market
      ↓
Travel
      ↓
Mission
      ↓
Faction
      ↓
Season
```

ตัวอย่าง:

```text
Day → Night
```

อาจทำให้:

* ตลาดปิด
* NPC กลับบ้าน
* การเดินทางอันตรายขึ้น
* Stealth มีความสำคัญขึ้น
* Encounter บางชนิดเปิดใช้งาน

\---

# 12\. Historical Timeline

## แรงกดดันจากโลกภายนอก

Historical Timeline เป็นข้อมูลประวัติศาสตร์ที่เกิดขึ้นตาม Campaign Year / Region

ตัวอย่าง:

```text
Year = 1570
Region = Omi
Historical Event = Military Conflict
```

เหตุการณ์นี้เกิดขึ้นตาม Timeline

แต่:

> \*\*Historical Timeline ไม่สามารถบังคับ Player State โดยตรง\*\*

ผู้เล่นยังมี Agency

Historical Timeline มีหน้าที่ทำให้โลกมีแรงกดดันและบริบททางประวัติศาสตร์

\---

# 13\. Historical Event ไม่ใช่ Script ที่บังคับผู้เล่น

หากเกิดเหตุการณ์ทางประวัติศาสตร์:

```text
Historical Event
↓
World Pressure
↓
Regional Consequence
```

ไม่ควร:

```text
Historical Event
↓
Force Player
↓
Player must participate
```

ตัวอย่าง:

สงครามเกิดขึ้นใน Omi

ผู้เล่นอยู่ Izumi

ผู้เล่นไม่จำเป็นต้องไปเข้าร่วมสงคราม

แต่สงครามอาจทำให้:

```text
Refugees ↑
Rice Demand ↑
Travel Risk ↑
Information Flow ↑
Trade Route Disruption ↑
```

ผู้เล่นจะสัมผัส “แรงกระเพื่อม” ของประวัติศาสตร์โดยไม่ถูกบังคับให้เป็นตัวละครในเหตุการณ์

\---

# 14\. Historical Timeline กับ Campaign Time ต้องแยกกัน

Campaign Time:

```text
inGameDay
season
segment
```

Historical Timeline:

```text
historicalYear
historicalEvent
region
source
fact
```

Historical Timeline เป็นข้อมูลอ้างอิง

Campaign Time เป็น State ที่เปลี่ยนจากการกระทำของผู้เล่น

ห้ามนำ Historical Event ไปแก้ Campaign State โดยตรงโดยไม่มีระบบ Consequence ที่กำหนดไว้

หลักการ:

> \*\*History informs the world.  
> Player actions determine the player's path.\*\*

\---

# 15\. Seasonal Pressure

## ตัวปรับ Duration + Consequence

ฤดูกาลเป็นตัวแปรระดับโลกที่สามารถเปลี่ยน Duration และ Consequence ของกิจกรรม

ตัวอย่าง:

```text
Season = Rainy / Summer
```

เส้นทาง:

```text
Normal Travel
Duration = 1 Day
```

แต่สภาพฝนทำให้:

```text
Travel Duration = 2 Days
```

และ:

```text
Fatigue ↑
Supplies Consumption ↑
Risk ↑
```

ดังนั้น:

> \*\*Seasonal Pressure ไม่ใช่แค่ข้อความบรรยายว่า “ฝนตก”\*\*

มันต้องมีผลเชิงกลไก

\---

# 16\. Seasonal Pressure สามารถเปลี่ยน Activity Duration

ตัวอย่าง:

### Normal

```text
Travel
Base Duration = 1 Day
```

### Heavy Rain

```text
Base Duration = 1 Day
Weather Modifier = +1 Day
Final Duration = 2 Days
```

ผล:

```text
Fatigue ↑
Supplies ↓
Arrival Later
```

\---

# 17\. Seasonal Pressure สามารถเปลี่ยน Consequence

ไม่จำเป็นต้องเพิ่ม Duration เสมอไป

ตัวอย่าง:

```text
Winter
```

ผู้เล่นเดินทางเท่าเดิม:

```text
Duration = 1 Day
```

แต่:

```text
Fatigue Cost ↑
Supplies Cost ↑
Risk ↑
```

ดังนั้น Seasonal Pressure สามารถทำงานผ่าน:

```text
Duration Modifier
Risk Modifier
Resource Modifier
Availability Modifier
```

\---

# 18\. Time เป็น Terrain

เวลาในเกมควรถูกออกแบบเหมือน “ภูมิประเทศ”

ผู้เล่นไม่ได้เดินอยู่บนแค่:

```text
Road
Mountain
River
Sea
```

แต่กำลังเดินอยู่บน:

```text
Time + Season + Weather + Region
```

ตัวอย่าง:

```text
Same Route
```

ฤดูร้อน:

```text
1 Day
```

ฤดูฝน:

```text
2 Days
```

ฤดูหนาว:

```text
1 Day
Higher Risk
```

ดังนั้นเส้นทางเดียวกันสามารถให้ประสบการณ์ต่างกันตามช่วงเวลาที่เลือกเดินทาง

\---

# 19\. ตัวอย่างเต็ม: การเดินทางไปพบพ่อค้า

สถานการณ์:

```text
Day 32
Summer
Dawn
Player wants to meet Merchant
```

ผู้เล่น:

> “ฉันเดินทางไปตลาดเมืองถัดไป”

ระบบ:

```text
Activity = Travel
Base Duration = 1 Segment
```

แต่ฝนกำลังตก:

```text
Seasonal Modifier = +1 Segment
```

Final:

```text
Duration = 2 Segments
```

เวลา:

```text
Dawn
↓
Day
↓
Dusk
```

เมื่อถึงตลาด:

```text
Segment = Dusk
```

Market Schedule:

```text
Open = Dawn / Day
Closed = Dusk / Night
```

ผล:

> ตลาดกำลังปิด ผู้เล่นพลาดช่วงเวลาซื้อขาย

นี่เป็น Consequence ที่เกิดจาก:

```text
Action
↓
Duration
↓
Seasonal Modifier
↓
Time Advance
↓
Market Schedule
↓
Consequence
```

\---

# 20\. ตัวอย่างเต็ม: ทำงานทั้งวัน

เริ่ม:

```text
Day 45
Autumn
Dawn
Fatigue = Low
```

ผู้เล่น:

> “ฉันรับงานขนเสบียงให้โกดัง”

ระบบ:

```text
Activity = Labor
Base Duration = Long
Duration = 2 Segments
```

เวลา:

```text
Dawn → Day → Dusk
```

ผล:

```text
Fatigue ↑↑
Supplies / Money ↑
```

ผู้เล่นตัดสินใจทำต่อ:

> “ช่วยงานต่อจนเสร็จ”

ระบบ:

```text
Additional Duration = 1 Segment
```

เวลา:

```text
Dusk → Night
```

เมื่อเสร็จ:

```text
Fatigue = Very High
Segment = Night
```

AI Narrative:

> “เมื่อเกวียนคันสุดท้ายถูกเก็บเข้าคลัง ท้องฟ้าก็มืดสนิท แขนทั้งสองข้างแทบไม่มีแรงเหลือ”

ระบบไม่ได้บอก:

> “End Turn”

เพราะ:

> \*\*กิจกรรมทำให้วันหมดไปเอง\*\*

\---

# 21\. ตัวอย่างเต็ม: เดินทางหลายวัน

ผู้เล่น:

> “เดินทางไป Sakai”

Route:

```text
Origin → Destination
```

Base:

```text
Duration = 3 Days
```

Season:

```text
Autumn
```

Weather:

```text
Heavy Rain
```

Modifier:

```text
+1 Day
```

Final:

```text
Duration = 4 Days
```

Campaign:

```text
Day 50
↓
Day 51
↓
Day 52
↓
Day 53
↓
Day 54
```

ระหว่างนั้น:

```text
Supplies ↓
Fatigue ↑
Mission Deadline ↓
Regional Events Advance
```

เมื่อถึง:

```text
Day 54
```

ผู้เล่นอาจพบว่า:

* NPC ที่ต้องการพบออกจากเมืองไปแล้ว
* ราคาสินค้าเปลี่ยน
* ข่าวใหม่แพร่เข้ามา
* Mission state เปลี่ยน

เพราะโลกไม่ได้หยุดรอระหว่างการเดินทาง

\---

# 22\. ตัวอย่างเต็ม: Historical Event ระหว่างเดินทาง

ผู้เล่นเริ่มเดินทาง:

```text
Day 70
Region = Izumi
Destination = Omi
```

Duration:

```text
3 Days
```

ระหว่างนั้น Historical Timeline ระบุว่า:

```text
Military Conflict occurs in Omi
```

Historical Event ไม่ได้บังคับให้ผู้เล่นเข้าร่วม

แต่เมื่อผู้เล่นเข้าใกล้พื้นที่:

```text
Regional Pressure ↑
Travel Risk ↑
Information ↑
Refugee Flow ↑
Market Disruption ↑
```

ผู้เล่นจึงสัมผัสผลของเหตุการณ์โดยไม่ต้องถูกลากเข้า Main Historical Script

\---

# 23\. เวลาไม่ควรเดินจาก Narrative อย่างเดียว

AI ห้ามทำสิ่งต่อไปนี้โดยไม่มี Activity:

> “หลายชั่วโมงผ่านไป”

> “วันรุ่งขึ้น”

> “ผ่านไปหลายวัน”

เพียงเพราะต้องการเปลี่ยนฉาก

ทุกการ Advance Time ต้องมีเหตุผลจาก:

* Activity
* Travel
* Rest
* Waiting
* Event
* World Process

และต้องผ่านระบบ Time Engine

\---

# 24\. Waiting เป็น Activity

การ “รอ” ก็ถือเป็นกิจกรรม

ตัวอย่าง:

> “ฉันรอพ่อค้ากลับมา”

ระบบ:

```text
Activity = Waiting
Duration = 1 Segment
```

เวลา:

```text
Day → Dusk
```

หรือ:

```text
Dusk → Night
```

ผล:

* NPC อาจกลับมา
* ตลาดอาจปิด
* Fatigue อาจเพิ่มเล็กน้อย
* World Event อาจเกิดขึ้น

ดังนั้น:

> \*\*การไม่ทำอะไร ก็สามารถทำให้เวลาเดินได้ หากผู้เล่นกำลัง “รอ”\*\*

\---

# 25\. Player Agency

ระบบนี้ต้องไม่ทำให้ผู้เล่นรู้สึกว่าเกมแย่งการควบคุม

ผู้เล่นยังเป็นคนเลือก:

```text
ทำอะไร
ไปไหน
รอหรือไม่
ทำต่อหรือหยุด
พักหรือเดินทาง
เสี่ยงหรือปลอดภัย
```

แต่เมื่อเลือกแล้ว:

> \*\*เวลาและผลที่ตามมาต้องมีความสมเหตุสมผล\*\*

ตัวอย่าง:

ผู้เล่นเลือก:

> “ทำงานต่อ”

ระบบมีสิทธิ์ทำให้:

```text
Dusk → Night
Fatigue ↑
```

เพราะนั่นคือผลตามธรรมชาติของการตัดสินใจ

\---

# 26\. Core Design Philosophy

ระบบเวลาทั้งหมดต้องรักษาความรู้สึกว่า:

> \*\*ผู้เล่นไม่ได้กำลังเล่นเกมที่มีนาฬิกา\*\*
>
> \*\*ผู้เล่นกำลังใช้ชีวิตอยู่ในโลกที่มีเวลา\*\*

ผู้เล่นควรรู้สึกว่า:

> “ถ้ากูทำสิ่งนี้ มันจะกินเวลา”

ไม่ใช่:

> “กูมี Time Token เหลือกี่แต้ม?”

และเมื่อเวลาผ่าน:

> “โลกก็เดินต่อไปด้วย”

\---

# 27\. Final Architecture

```text
                    ┌─────────────────────┐
                    │   PLAYER ACTION     │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │  ACTIVITY CLASSIFY  │
                    │ Travel / Labor /    │
                    │ Wait / Rest / etc.  │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │   BASE DURATION     │
                    └──────────┬──────────┘
                               ↓
               ┌───────────────┴───────────────┐
               ↓                               ↓
      Seasonal Pressure                 Context / State
      Weather / Route                   Injury / Gear /
      Season                            Assistance / Risk
               ↓                               ↓
               └───────────────┬───────────────┘
                               ↓
                    ┌─────────────────────┐
                    │   FINAL DURATION    │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │   TIME ADVANCE      │
                    │ Segment / Day /     │
                    │ Season / Year       │
                    └──────────┬──────────┘
                               ↓
               ┌───────────────┼────────────────┐
               ↓               ↓                ↓
          Player State     World State     NPC / Market
          Fatigue          Supplies        Schedule
          Focus            Travel          Availability
          Wounds           Factions        Events
               ↓               ↓                ↓
               └───────────────┼────────────────┘
                               ↓
                    ┌─────────────────────┐
                    │  WORLD CONSEQUENCE  │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │    AI NARRATIVE     │
                    │  เล่าผลที่เกิดขึ้น  │
                    └─────────────────────┘
```

\---

# 28\. Source of Truth — กฎสำคัญที่สุด

### Rule 1

> \*\*Time is advanced by activities, not by turns.\*\*

### Rule 2

> \*\*Players choose actions; the system determines how long those actions take.\*\*

### Rule 3

> \*\*AI may interpret and estimate activity duration, but the Game Engine owns the authoritative World Clock.\*\*

### Rule 4

> \*\*Long activities can consume multiple segments or multiple days automatically.\*\*

### Rule 5

> \*\*When an activity naturally reaches Night, the game should not require an artificial End Turn.\*\*

### Rule 6

> \*\*Rest is an activity that advances time and produces recovery consequences.\*\*

### Rule 7

> \*\*Travel is an activity with real time cost and must not behave like teleportation.\*\*

### Rule 8

> \*\*Seasonal Pressure modifies activity duration, risk, resources, and availability where appropriate.\*\*

### Rule 9

> \*\*Historical Timeline influences the world but does not directly control Player Agency.\*\*

### Rule 10

> \*\*Every meaningful Time Advance must produce a corresponding World Consequence when applicable.\*\*

### Rule 11

> \*\*Time should be felt through gameplay consequences, not only displayed as numbers.\*\*

### Rule 12

> \*\*The goal is not to make players manage time as a currency. The goal is to make players experience time as a consequence of living in the world.\*\*

\---

## Core Formula

```text
PLAYER ACTION
      ↓
ACTIVITY
      ↓
BASE DURATION
      ↓
CONTEXT + SEASONAL MODIFIERS
      ↓
FINAL DURATION
      ↓
CAMPAIGN TIME ADVANCE
      ↓
PLAYER / WORLD CONSEQUENCES
      ↓
AI NARRATIVE
```

### Core Principle

> \*\*The player decides what to do.  
> The activity determines how long it takes.  
> Time changes the world.  
> The world changes what happens next.\*\*


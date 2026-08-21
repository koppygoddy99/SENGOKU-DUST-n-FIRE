# Dust & Fire: Sengoku Stories — รายงานปิดรอบ National Map และ Workflow 7 ทีม

**รอบปิดงาน:** National Map จากไฟล์ฐานที่ผู้ใช้ยืนยันสิทธิ์, Campaign Command, การตรวจ responsive และ regression  
**สถานะรวม:** ส่งมอบเชิงเทคนิคแล้ว; ไม่ได้เปิด analytics, การแก้ข้อมูลผ่าน Admin หรือฐานข้อมูล campaign ส่วนกลางเพิ่มในรอบนี้

> หลักการของรอบนี้คือให้แผนที่มีหน้าที่เพียงบอกบริบทการเดินทางและตำแหน่งแคมเปญ ไม่ใช้เป็นแผนที่อำนาจหรือคำอ้างเรื่องการควบคุมดินแดน

## ผลส่งมอบที่ผู้เล่นเห็น

Campaign Command มี **National Map** เพียงชุดเดียว แผนที่ใช้ไฟล์ฐานที่ผู้ใช้ยืนยันสิทธิ์ให้ใช้งาน โดยนำไปตัดกรอบ ป้ายชื่อ ธง เข็มทิศ เรือ สัญลักษณ์ และองค์ประกอบตกแต่งอื่นที่ไม่ใช่ UI เกมออก ก่อนนำไปใช้เป็นพื้นหลังของแผนที่ในระบบ

จุด `火` และชื่อแคว้นเป็นชั้นข้อมูลของเกมที่วางทับจาก `GameState` ผู้เล่นจึงเห็นเพียงตำแหน่งปัจจุบันและแคว้นที่แคมเปญกำลังอยู่เท่านั้น ไม่มีสีเขตอำนาจ ธงตระกูล เส้นทางกองทัพ หรือข้อความอ้างการครอบครองดินแดน

| รายการตรวจรับ | ผล |
|---|---|
| Asset map | ใช้ `/manus-storage/dust-fire-national-map-clean_a1c5c24e.png` ใน `NationalContextMap` |
| ตำแหน่งผู้เล่น | marker `火` และชื่อแคว้นเปลี่ยนตาม GameState; ตรวจทั้ง Izumi และ Kii |
| ภาษา | English/Thai ใช้ label เดิมที่ผูกกับ state เดียวกัน |
| Desktop visual review | ตรวจ Campaign Command ที่ 1280 × 720 ใน review route ของ Izumi และ Kii |
| Mobile visual review | ตรวจที่ 375 × 812 ใน review route ของ Izumi และ Kii; map, marker และ legend ไม่ล้นแนวนอน |
| TypeScript | `pnpm check` ผ่าน |
| Unit regression | Vitest **86 tests / 26 test files** ผ่าน |
| Browser layout regression | Playwright **2 scenarios** ผ่าน: rail เปิด และ rail ย่อที่ viewport 1280px |

## สรุปตามทีม

| ทีม | งานที่เสร็จในรอบนี้ | หลักฐานตรวจรับ | งานถัดไป |
|---|---|---|---|
| **1. Game Director** | ยืนยันขอบเขต map ว่าเป็น orientation ของผู้เล่น ไม่ใช่ระบบอำนาจหรือสงคราม | National Map เหลือจุดปัจจุบันและชื่อแคว้น ไม่มี territorial-control copy | อนุมัติลำดับเครื่องมือ Manage ที่ควรพัฒนาเกิน prototype |
| **2. Game Design** | ตัด Province Map และใช้ National Map เดียว; กำหนดว่าตำแหน่งแคมเปญมาจาก GameState | `StoryMap.tsx` ใช้ `timelineRegionKey` และ class marker รายแคว้นเดิม | เพิ่ม timeline เฉพาะปี/ภูมิภาคเมื่อมีแหล่งตรวจทานเพิ่ม |
| **3. Game Development** | เชื่อม asset storage path เข้ากับ `NationalContextMap`; ไม่แก้ server เพราะไม่จำเป็น | render-level regression ตรวจ `img src` และ marker class; TypeScript ผ่าน | วาง revision/audit model หากในอนาคตย้าย timeline catalog เข้าฐานข้อมูล |
| **4. UI/UX Frontend** | วาง asset แบบ responsive 16:9 และคง legend/overlay ที่อ่านได้ทั้ง desktop กับมือถือ | Visual review ของ Izumi/Kii ที่ 1280 × 720 และ 375 × 812 | ทดสอบ keyboard/motion และอ่าน feedback จากการเล่นจริง |
| **5. Art & Audio** | ทำ asset แผนที่ฉบับสะอาดจากไฟล์ฐานที่ผู้ใช้อนุญาต โดยลบ decoration ที่ไม่เกี่ยวกับ UI เกม | ไฟล์ static ที่อัปโหลดแล้ว และภาพตรวจ Campaign Command | กำหนด sound cues เฉพาะหน้าเมื่อได้รับ direction ด้านเสียง |
| **6. QA & Testing** | เพิ่ม assertion ว่าแผนที่ใช้ asset ใหม่ และอัปเดต browser overflow test จาก Province Map เป็น National Map | `pnpm check`, Vitest 86/26 และ Playwright 2/2 ผ่าน | E2E authenticated admin flow และ mobile keyboard audit |
| **7. Release & Operations** | อัปเดตสถานะทีม, todo และเอกสารปิดรอบ; เก็บ asset นอก project root แล้วอ้างผ่าน storage path | เอกสารนี้, `team-work-status-2026-08-21-th.md`, checkpoint หลังการตรวจ | เลือก analytics ที่ผ่าน privacy review พร้อม incident/audit runbook |

## สิ่งที่จงใจยังไม่เปิด

| ระบบ | สถานะ | เหตุผล |
|---|---|---|
| Visitor analytics | `not-configured` | ไม่แสดงตัวเลขที่ไม่มี telemetry และ privacy policy ที่ตรวจสอบได้ |
| Admin write actions | `read-only` | ยังไม่มี append-only audit log, retention policy และขั้นตอนยืนยันซ้ำ |
| Shared campaign database | ไม่เปิด | Local Save ในเบราว์เซอร์ยังเป็นแหล่งข้อมูลหลักของผู้เล่น |
| Timeline ครบทุกปี 1467–1615 | กำลังขยาย | เติมเฉพาะเหตุการณ์ที่ตรวจทานแหล่งข้อมูลแล้ว เพื่อไม่สร้างประวัติศาสตร์เทียม |

## หมายเหตุด้านแหล่งอ้างอิงประวัติศาสตร์

แผนที่ใน UI ไม่อ้างว่าเป็นหลักฐานอำนาจทางการเมืองหรือขอบเขตการปกครอง ข้อมูล timeline แยกเป็น record ที่มีแหล่งอ้างอิงและระดับความละเอียดของวันที่ แผนที่และไทม์ไลน์จึงทำหน้าที่เป็น **historical context** สำหรับการอ่าน ไม่ตัดสินผลทอยและไม่สร้างภารกิจบังคับ [1] [2]

## References

[1] [Sengoku Shogun Map — 1569](https://ufirst.jp/sengoku-map/en/1569)  
[2] [Sengoku Shogun Map — 1570](https://ufirst.jp/sengoku-map/en/1570#5.26/35.522/138.094/0/30)

# Dust & Fire: สถานะงานแบบ 7 ทีม

**รอบงาน:** เมนูการจัดการ แผนที่ระดับประเทศ ไทม์ไลน์ และ ledger เชื่อมบริบท  
**สถานะรวม:** พร้อมตรวจรับเชิงเทคนิค; ยังไม่ใช่การเปิดระบบ analytics หรือเครื่องมือแก้ไขข้อมูลจริง

> เอกสารนี้แยกชัดระหว่างสิ่งที่ผู้เล่นใช้ได้แล้ว สิ่งที่ผู้ดูแลอ่านได้แล้ว และสิ่งที่จงใจยังไม่เปิดเพื่อไม่สร้างข้อมูลปลอม การเปลี่ยนค่าหลังบ้านยังต้องมี audit storage, policy การเก็บข้อมูล และขั้นตอนยืนยันก่อน

| ทีม | ขอบเขตรอบนี้ | สถานะ | ผลส่งมอบที่ตรวจได้ | งานรอบถัดไป |
|---|---|---|---|---|
| 1. Game Director | แยกเครื่องมือจัดการออกจากการเล่น | เสร็จ | เมนู **Manage** ซ่อนมุมขวาบน; IA แยก Account, Workspace, Resources และ Admin | อนุมัติรายการเครื่องมือที่ควรเปิดจริงตาม MVP |
| 2. Game Design | แผนที่ระดับประเทศและขอบเขต timeline | เสร็จ | ตัด Province Map และข้อมูลอำนาจออกแล้ว; National Map ใช้ไฟล์ฐานที่ผู้ใช้ยืนยันสิทธิ์หลังตัดองค์ประกอบส่วนเกิน มีโหมด overview/province detail, catalog แคว้นประวัติศาสตร์ 68 แคว้น และบริบทปีที่มีแหล่งอ้างอิงเท่านั้น; timeline แยก battle/event และ relevance | ขยาย record timeline เฉพาะปี/แคว้นเมื่อมีการตรวจแหล่งข้อมูลเพิ่ม |
| 3. Game Development | สัญญาข้อมูล timeline หลังบ้าน | เสร็จ | `timeline.forCampaign` แบบ read-only; admin timeline coverage; source URL และ date precision อยู่ใน record | ย้าย catalog ที่ตรวจทานแล้วเข้าสู่ฐานข้อมูลพร้อมระบบ revision และ audit |
| 4. UI/UX Frontend | Ledger ร่วมของ Market, Character, Save/Load และ National Map | เสร็จ | แสดง Leaf, Campaign Day, Age, Highest Step และ Open Agreements ในลำดับเดียวกัน; National Map ใช้ asset ใหม่พร้อม marker จาก GameState, ปุ่ม zoom, hotspot แคว้นที่ใช้เมาส์/คีย์บอร์ด และ province brief | ตรวจ UX มือถือและปรับคำอธิบายตามผลเล่นจริง |
| 5. Art & Audio / Admin UX | การนำเสนอระบบจัดการและแผนที่ | เสร็จ | Drawer ใช้ Ledger of Ash; admin war-office แสดง Timeline และ Operations facts; ตัด asset แผนที่จากไฟล์ฐานที่ผู้ใช้ยืนยันสิทธิ์โดยลบกรอบ ป้าย ธง เข็มทิศ เรือ และเครื่องหมายตกแต่ง | กำหนด sound cue เฉพาะหน้าเมื่อมี direction ด้านเสียง |
| 6. QA & Testing | ตรวจ role gate, data boundary, layout และ regression | เสร็จ | ทดสอบ tRPC admin/timeline, timeline precision, Story Map, Market และ Local Save flow; TypeScript ผ่าน, Vitest 88 tests/28 files ผ่าน, browser overflow 2 scenarios ผ่าน และตรวจภาพ zoom desktop/mobile สำหรับ Izumi และ Kii | เพิ่ม E2E authenticated admin flow และ mobile keyboard audit |
| 7. Release & Operations | เกณฑ์สื่อสารสถานะและข้อจำกัด | เสร็จ | Admin ระบุชัดว่า visitor analytics ยัง `not-configured`, Local Save เป็น browser-only และ controls เป็น read-only | เลือกผู้ให้บริการ analytics ที่ผ่าน privacy review และสร้าง incident/audit runbook |

## สิ่งที่เปิดใช้แล้ว

ผู้เล่นเปิดเมนู **Manage** จากมุมขวาบนและปิดได้โดยไม่ออกจากแคมเปญ เมนูนี้เป็นโครงสร้างทางเลือกสำหรับเรื่องบัญชี พื้นที่ทำงาน ทรัพยากร และการจัดการแอป ส่วนทางเข้า **Admin Console** มีเฉพาะผู้ใช้ที่มี role `admin`; ผู้เล่นทั่วไปไม่เห็นข้อมูลผู้ดูแลและถูกปฏิเสธที่ route เดิม

ในหน้า Campaign Command เหลือ **National Map** เพียงชุดเดียว เพื่อเห็นตำแหน่งแคมเปญในแผนที่หมู่เกาะที่ผู้ใช้ยืนยันสิทธิ์ให้ใช้เป็นไฟล์ฐาน แผนที่ตัดกรอบ ป้าย ธง เข็มทิศ เรือ และเครื่องหมายตกแต่งออกแล้ว ไม่มีการระบายเขตอำนาจ ป้ายเส้นทาง หรือสัญลักษณ์ของฝ่ายใด โหมด **Overview** แสดงเฉพาะตำแหน่งปัจจุบันกับชื่อแคว้นของแคมเปญ ส่วนโหมด **Province Detail** ซูมเพื่อแสดงชื่อแคว้นใกล้เคียงและ hotspot ที่กดดูบริบทภูมิศาสตร์กับ historical note ตามปีได้ โดยหากไม่มี record ที่ตรวจทาน เกมจะระบุความว่างนั้นแทนการแต่งเหตุการณ์หรือผู้ครองอำนาจขึ้นเอง

ไทม์ไลน์แสดงปี ฤดูหรือวันที่เท่าที่แหล่งข้อมูลระบุได้ รายการ 1569 ที่ไม่ระบุเดือนจึงอยู่ในระดับปี ขณะที่ศึกอาเนงาวะมีวันปรากฏตาม record ที่ตรวจทานแล้ว ไทม์ไลน์เป็น **บริบทประกอบการอ่าน** เท่านั้น ไม่หักลบแต้มทอย ไม่บังคับภารกิจ และไม่ทำให้ NPC สมมติกลายเป็นบุคคลจริงโดยอัตโนมัติ [1] [2]

## สิ่งที่จงใจยังไม่เปิด

| เรื่อง | สถานะ | เหตุผล |
|---|---|---|
| ยอดผู้เยี่ยมชมเว็บไซต์ | `not-configured` | ไม่มี telemetry ที่ตรวจสอบได้และผ่าน policy ความเป็นส่วนตัว จึงไม่แสดงตัวเลขแทนการเดา |
| แก้ไขการตั้งค่าผ่าน Admin | `read-only` | ยังไม่มี append-only audit log, การยืนยันซ้ำ และ retention policy |
| ฐานข้อมูล campaign ส่วนกลาง | ไม่เปิด | เกมใช้ Local Save เป็นหลัก; ต้องมีความยินยอมและ policy ก่อนย้ายข้อมูลออกจากเบราว์เซอร์ |
| ไทม์ไลน์ครบทุกปี 1467–1615 | กำลังขยาย | บันทึกเฉพาะรายการที่ผ่านการตรวจทานแล้วก่อน เพื่อไม่สร้างเหตุการณ์เทียม |

## เกณฑ์ตรวจรับรอบนี้

ทีม QA ยอมรับงานเมื่อ TypeScript ผ่าน, regression ทั้งชุดผ่าน, แผนที่ National ไม่มี overflow, menu Manage ไม่กลบเส้นทางเล่น และ admin router ปฏิเสธ role `user` ได้ ผลทดสอบสุดท้ายของรอบนี้ต้องรันทั้ง `pnpm check` และ `pnpm test` ก่อน checkpoint เสมอ

## แหล่งอ้างอิง

[1] [Sengoku Shogun Map — 1569](https://ufirst.jp/sengoku-map/en/1569)  
[2] [Sengoku Shogun Map — 1570](https://ufirst.jp/sengoku-map/en/1570#5.26/35.522/138.094/0/30)  
[3] [Sengoku Shogun Map — Events](https://ufirst.jp/sengoku-map/en/event)  
[4] [Sengoku Shogun Map — Battles](https://ufirst.jp/sengoku-map/en/battle)

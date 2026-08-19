# AI GM live smoke test — 2026-08-19

## บริบทที่ทดสอบ

การทดสอบเรียก AI GM จริงใช้แคมเปญ Mikawa ค.ศ. 1578 ผู้เล่นประกาศว่าจะยื่นบัญชีข้าวต่อเสมียนหน้าด่านเพื่อขอเวลาถ่วงการสอบถามจากทหาร

## ผลจากโมเดลจริง

| ขั้น | historicalStatus | historicalFactIds | ผลกติกา |
|---|---|---|---|
| วิเคราะห์ก่อนทอย | `contextual-play` | `oaths-documents-and-witnesses`, `war-is-negotiated-labour`, `historical-language-is-not-modern-japanese`, `market-rights-and-brokers` | แกน `mind`, DN canonical tier `14` |
| บรรยายหลังทอย | `contextual-play` | `oaths-documents-and-witnesses`, `war-is-negotiated-labour`, `historical-language-is-not-modern-japanese`, `market-rights-and-brokers` | 4 ย่อหน้า, 4 ทางเลือก, memory tone `vermilion` |

> **historicalFence — วิเคราะห์:** อ้างบรีฟ `oaths-documents-and-witnesses` และ `market-rights-and-brokers` ในกรอบปี 1467–1600: ติดตามผู้จัดทำ เอกสารที่ถือ พยาน และชื่อ/ตราที่สนับสนุนการอ้างสิทธิ แต่ห้ามคิดค้นผลทางกฎหมายหรือพิธีตราประทับท้องที่โดยไม่มีแหล่งท้องถิ่น และห้ามยืนยันว่าการยื่นบัญชีจะให้ผลทางกฎหมายถาวร

> **historicalFence — บรรยาย:** ใช้การ์ดข้อมูลยุคสงครามกลางเมือง (1467–1600) เป็นแนวทาง: วัฒนธรรมเอกสารยุคเซงโงกุมักมีคำสาบาน จดหมาย สำเนา ตรา และบันทึกวัด จึงต้องติดตามผู้ลงชื่อ ผู้ครอบครองสำเนา และพยานในฉากนี้ ห้ามสมมติผลทางกฎหมายของตราแบบเฉพาะถิ่นหรือระบุพิธีการตราประทับโดยไม่มีแหล่งท้องถิ่น

ผลหลังแก้รูปแบบ Historical Brief **ไม่พบ** `[object Object]` แล้ว โมเดลอ่าน claim, gmUse และ prohibition จาก fact cards ได้และเลือกป้าย `contextual-play` ซึ่งเหมาะกับฉากแคมเปญสมมติที่ได้รับกรอบจากประวัติศาสตร์เชิงโครงสร้าง

## การยืนยันเชิงเทคนิค

`pnpm test`, `pnpm check`, และ `pnpm build` ผ่านทั้งหมด โดย Vitest ผ่าน **11 tests** รวม regression test ที่ยืนยันว่า Historical Brief มี JSON ของ fact card และไม่พบ `[object Object]` ใน request ของโมเดล

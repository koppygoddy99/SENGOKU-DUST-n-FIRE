# Team 8 — Backend Systems Handbook

> สถานะ: คู่มือปฏิบัติงานเฉพาะ Team 8
>
> ผู้อ่าน: Backend Systems, Game Development, QA, Release and Operations

## 1. พันธกิจ

Team 8 รับผิดชอบความเชื่อมโยงระหว่าง client, server, persistence และบริการภายนอก เพื่อให้เกมยังอ่านและเขียน state เดียวกันได้อย่างตรวจสอบได้ หน้าที่ของทีมนี้คือทำให้ contract ชัด, migration ปลอดภัย, asset ถูกส่งถึง runtime ที่ถูกต้อง และความผิดพลาดสังเกตได้ ไม่ใช่การตัดสินกติกา DN, ความยาก หรือร้อยแก้วแทน Team 1–3

## 2. ขอบเขตความรับผิดชอบ

| ด้าน | ความรับผิดชอบของ Team 8 | ผู้ตรวจร่วม |
|---|---|---|
| Server contracts | tRPC input/output, error shape, authorization และ schema compatibility | Team 3, QA |
| Persistence | Local Save versioning, state normalization, database schema และ migration ที่ย้อนตรวจได้ | Team 3, QA |
| AI GM integration | server-only keys, timeout, fallback boundary, JSON validation และ historical fence handoff | Team 1, Team 3, QA |
| Asset delivery | manifest ของ asset ที่ได้รับอนุญาต, static storage URL, cache policy และ local runtime verification | Team 5, Team 7 |
| Observability | structured logs, request failure context, health checks และ incident handoff | Team 6, Team 7 |

## 3. สัญญาข้อมูลที่ต้องรักษา

Backend Systems ต้องรักษา compatibility ของ `GameState`, `RollRecord`, `RollPreview`, inventory, agreements, memories และ progression เมื่อเปลี่ยน field ที่บันทึกใน Local Save เช่น `axis` เป็น `stat` ต้องมี normalization หรือ migration ที่พิสูจน์ด้วย fixture ของเซฟเดิมก่อนเปิดใช้ ห้ามปล่อยให้เซฟเดิมกลายเป็น `undefined` โดยเงียบ

ทุก request ของ AI GM ต้องผ่าน schema validation และมี Local Trial fallback ที่ไม่หักเครดิตเมื่อบริการภายนอกใช้ไม่ได้ ส่วนผลทอยที่ client แสดงต้องยึด record เดียวกับที่ persistence บันทึก: การใช้ Momentum เพิ่มจาก dice/Stat/Mastery/Context เดิมและต้องบันทึกแหล่งกับต้นทุนของแรงฮึดเสมอ

## 4. นโยบาย asset delivery

asset ที่ผู้ใช้อนุญาตต้องมีชื่อคงที่, ที่มา, hash หรือ checksum เมื่อเหมาะสม และ path ที่ทดสอบได้ใน runtime เป้าหมาย ไฟล์ขนาดใหญ่เก็บใน static storage ที่โครงการจัดการ แล้ว client อ้าง path จาก manifest เดียว ห้ามแอบเพิ่ม asset ที่สิทธิ์ไม่ชัดหรือ hard-code URL ภายนอกที่ไม่มีแผนสำรอง

สำหรับ asset แผนที่ระดับประเทศปัจจุบัน ให้ใช้ path `/manus-storage/dust-fire-national-map-clean_73af6005.png` ซึ่งเป็นไฟล์ที่ผู้ใช้อนุญาตและอัปโหลดใหม่เพื่อแทน path เดิมที่ไม่อยู่ใน repository

## 5. เกณฑ์รับงาน

ก่อนส่งมอบ Team 8 ต้องยืนยันว่า schema/type check ผ่าน, migration fixture ครอบคลุม data เก่าเมื่อมี state change, endpoint สำคัญมี error/fallback path, asset URL ตอบ `200` จาก local runtime และ production-like runtime, และ log ชี้ย้อนถึง request/state ที่มีปัญหาได้โดยไม่บันทึกข้อมูลลับ

## 6. ขอบเขตที่ไม่ทำเอง

Team 8 ไม่เปลี่ยนสูตร 2d12, DN, narrative tone, ข้อเท็จจริงทางประวัติศาสตร์ หรือ UI hierarchy โดยลำพัง หากการเปลี่ยน server contract ทำให้กติกาหรือสิ่งที่ผู้เล่นเห็นเปลี่ยน ต้องส่งให้ Team 1–4 อนุมัติตามเรื่อง และให้ Team 6 เขียน regression ก่อน merge

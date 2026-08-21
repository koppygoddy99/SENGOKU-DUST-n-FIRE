# Dust & Fire — Mobile Keyboard Audit

**ขอบเขต:** viewport 375 × 812, route Play Scene และ Campaign Command  
**ผล:** ผ่าน

| จุดตรวจ | วิธีตรวจ | ผล |
|---|---|---|
| เมนูบนมือถือ | focus ปุ่ม `Open menu` แล้วกด Enter | เปิด navigation และพบกลุ่ม More |
| กลับหน้าแคมเปญ | focus ปุ่ม brand แล้วกด Enter | กลับถึง heading `Campaign Command` |
| จุดป้อนเจตนา | focus textarea, กรอกเจตนา, กด Tab | focus ไปยังปุ่ม `Set this intention` ที่เปิดใช้แล้ว |

## ข้อสรุป

ไม่พบข้อผิดพลาดของ interaction ในเส้นทางที่ตรวจ จึงไม่มีการเปลี่ยน semantics หรือ focus order ของ product code รอบนี้ งานที่เพิ่มคือ browser regression `tests/mobile-keyboard-audit.spec.mjs` และ script `pnpm test:mobile-keyboard` เพื่อป้องกัน regression ของเมนู, brand return และ CTA หลักของหน้า Play ในรอบถัดไป

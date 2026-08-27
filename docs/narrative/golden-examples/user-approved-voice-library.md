# User-Approved Voice Library

> **สถานะ:** source-of-truth สำหรับตัวอย่างเสียงบทสนทนาที่เจ้าของโปรเจกต์อนุมัติ

ข้อมูลที่ระบบเรียกใช้จริงเก็บใน `shared/narrativeGoldenExamples.ts` ภายใต้ `USER_APPROVED_NARRATIVE_GOLDEN_EXAMPLES` เพื่อให้ TypeScript import เข้า Narrative Prompt Packet ได้โดยตรง เอกสารนี้เป็นดัชนีมนุษย์อ่านและกติกาความคงอยู่ของข้อมูล ไม่ใช่สำเนาที่ใช้ runtime แทน source code

## ข้อมูลที่อนุมัติแล้ว

| ID | บทบาท/ฉาก | สิ่งที่สอนระบบ | tag runtime |
|---|---|---|---|
| `user-lived-in-action-ship` | คนพาย, พ่อค้า, คนงานบนเรือ | คนละคนพูดเพื่อแก้ปัญหาคนละอย่าง มีการขัดจังหวะ ความรีบ และการแก้คำ แต่ยังตามทัน | `merchant`, `water`, `travel`, `injury`, `pressure`, `consequence`, `dialogue` |
| `user-lived-in-dialogue-labor` | นายกอง, จิซามูไร, แม่, ชายหนุ่ม | การต่อคารมมีผลต่อแรงงานและครอบครัว; คนมีอำนาจถามตรง คนในพื้นที่ตอบจากสิ่งที่ต้องคุ้มครอง | `authority`, `commoner`, `pressure`, `consequence`, `dialogue` |

## กติกาความคงอยู่

1. ห้ามลบหรือเขียนทับ record ที่ `source: "user-approved"` โดยไม่มีคำสั่งจากเจ้าของโปรเจกต์
2. ห้ามย้าย data ออกจาก `shared/narrativeGoldenExamples.ts` เพราะ `selectNarrativeGoldenExamples()` import จากไฟล์นี้โดยตรง
3. ให้เพิ่ม record ใหม่ด้วย ID ถาวร, ภาษา, tag และข้อความที่ได้รับอนุมัติ โดยเก็บ source เป็น `user-approved`
4. Runtime ดึงได้ไม่เกิน 2 record ต่อฉากเพื่อคุมความเร็ว แต่ user-approved มีน้ำหนักสูงกว่า foundation examples เสมอ
5. บันทึกนี้อยู่ใน Git จึงตรวจย้อนกลับและกู้คืนจาก commit history ได้

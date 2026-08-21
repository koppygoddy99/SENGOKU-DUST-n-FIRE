# Campaign Command Responsive Review — 2026-08-21

## ขอบเขต

ตรวจหน้า Campaign Command หลังปรับ Ledger Spine และ Story Desk ด้วย viewport desktop สองขนาด เพื่อป้องกันหน้าจอหลักล้นด้านขวาเมื่อ sidebar เปิดอยู่.

| Viewport / state | ผลตรวจ | ข้อสังเกต |
|---|---|---|
| 1280 × 720 / rail เปิด | ผ่าน | Situation Map และ Story Desk อยู่ข้างกันได้; Dice Tray ถูกลดขนาดและข้อความสถานะ wrap ได้ จึงไม่ตัดออกนอกขอบขวา |
| 1280 × 720 / rail ย่อ | ผ่าน | Review query `?review=home&rail=collapsed` แสดง rail ไอคอนย่อและขยายพื้นที่ Campaign Command โดย Situation Map กับ Story Desk ยังอยู่ในขอบ viewport |
| 1024 × 720 / rail เปิด | ผ่าน | Story Desk ถูกย้ายลงเป็นลำดับถัดไปตาม breakpoint 1180px; Situation Map ใช้ความกว้างพื้นที่หลักเต็มและ Ledger Spine ยังอ่านได้ |

## Regression ที่เพิ่ม

`client/src/features/story/StoryMap.layout.test.ts` ตรวจ contract ของ CSS ว่า grid ของ desktop ใช้ column ที่ยืดหดได้, Dice Tray มี `minmax(0, 1fr)`, และ breakpoint 1180px ซ้อน Story Desk ก่อนพื้นที่เนื้อหาคับ. การตรวจ TypeScript และ Vitest ผ่านทั้งหมด **65 tests / 19 files**.

## ข้อสรุป

หน้า Campaign Command ไม่ควรใช้ minimum width ของ Story Desk เกิน 286px เมื่ออยู่ใน main leaf ที่มี Ledger Spine. หากเพิ่มข้อมูลใหม่ใน Story Desk ต้องรักษา `min-width: 0`, text wrapping และ breakpoint นี้ไว้. Query `rail=collapsed` มีไว้สำหรับ review เท่านั้น; ผู้เล่นจริงยังย่อ/ขยาย rail ด้วยปุ่มเดิม.

# Mission Thread Visual Check

ตรวจเมื่อ 26 สิงหาคม 2026 จาก development preview ที่ `/?review=missions`.

| Viewport | ผลตรวจ |
|---|---|
| Desktop 1280×720 | หน้าแสดง Main Thread เด่นหนึ่ง folio, capacity `1/1` และ Side Leads `0/2`; metadata สี่ช่องและ story movement อ่านได้ครบ ไม่มีข้อความซ้อนหรือ overflow ที่สังเกตได้ |
| Mobile 375×812 | Capacity เปลี่ยนเป็นแถบเต็มความกว้าง, folio เรียงแนวตั้ง และ metadata stack เป็นคอลัมน์เดียว; หัวเรื่องและเนื้อหาหลักยังอ่านได้โดยไม่ตัดคำผิดตำแหน่ง |

ผลนี้ตรวจเพียง layout ของ Main Thread ที่ยังไม่มี Side Lead เปิดเผย การตรวจการปรากฏของ Side Lead และ notification หลัง Main Thread replacement จะเพิ่มใน browser regression เมื่อ directive ถูกผูกเข้ากับ GM flow ครบถ้วน.

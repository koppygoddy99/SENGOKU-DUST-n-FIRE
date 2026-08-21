# Campaign Command Rail Review — 21 August 2026

## ขอบเขต

ตรวจหน้าจอ `Campaign Command` ด้วย deterministic review state ที่ความกว้าง viewport 1280 × 720 สองรูปแบบ คือ `/?review=home` สำหรับ Ledger Spine แบบเปิด และ `/?review=home&rail=collapsed` สำหรับ rail แบบย่อ การตรวจนี้ประกอบกับ DOM contract ใน `Home.campaign-command.ui.test.tsx` และ CSS layout contract ใน `StoryMap.layout.test.ts` เพื่อคุมไม่ให้การแก้ไขหน้าแผนที่กลับไปสร้าง horizontal overflow ในพื้นที่หลัก

## ผลตรวจ

| สถานะ rail | สิ่งที่ตรวจ | ผล |
| --- | --- | --- |
| เปิด | sidebar, หัวหน้า, Province Map และ Story Desk เรียงเป็นพื้นที่สามส่วนโดยไม่มีองค์ประกอบใดตัดออกจากขอบ viewport | ผ่าน |
| ย่อ | rail เหลือ glyph navigation, พื้นที่เนื้อเรื่องขยาย, Province Map และ Story Desk ยังคงอยู่ครบและอ่านหัวข้อได้ | ผ่าน |

แผนที่ใช้ความสูงของเนื้อหาจริงและไม่ได้สร้างแถบเลื่อนซ้อนใน viewport แรก ข้อความตำแหน่ง ข้อมูลแคว้น marker และ Story Desk ยังคงอยู่คนละชั้นข้อมูล จึงไม่กลายเป็น dashboard card ซ้ำซ้อน

## Regression ที่ผูกกับผลตรวจ

`Home.campaign-command.ui.test.tsx` render สอง review URL แล้วตรวจ tree หลัก ได้แก่ `player-main-content`, `campaign-command-grid`, และ `province-map-surface` พร้อมยืนยันว่าไม่มี inline fixed-width escape hatch ที่ทำให้ layout หนี contract ของ CSS. คำสั่ง `pnpm test:campaign-layout` ใช้ Chromium จริงที่ viewport 1280 × 720 วัด `scrollWidth <= clientWidth` ของ app shell, main content, Campaign Command grid และ Province Map สำหรับ rail ทั้งสองสถานะ ซึ่งผ่านครบสองกรณีหลังปรับ Story Desk ให้ยอมย่อข้อความ CTA และไม่ให้ลายชายฝั่งยื่นเกินขอบแผนที่

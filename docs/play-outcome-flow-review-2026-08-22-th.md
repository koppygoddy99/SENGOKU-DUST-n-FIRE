# Dust & Fire — Play Outcome Flow Review

**ขอบเขต:** Play Scene ใน review state `?review=play&outcome=saved`, desktop 1280 × 720 แบบ full-page

ผลตรวจยืนยันว่า Narrative Outcome อยู่ในหน้า Play เดิม ไม่พาผู้เล่นไปยังหน้าแยก ร้อยแก้วผลลัพธ์เป็นส่วนแรกใต้หัวผลทอยและใช้ขนาดตัวอักษรเด่นเต็มความกว้าง ก่อนข้อมูลรองคือผลทอย การฝึกวิชา และเวลา/เส้นเรื่อง Composer “What will you do?” อยู่ต่อท้าย narrative และพร้อมรับเจตนาถัดไปโดยตรง

ปุ่ม `WRITE NEXT INTENT` เลื่อนกลับไปยัง composer เดียวกัน ขณะที่ `RETURN TO MAP` และ `OPEN CHRONICLE` เป็นทางออกทางเลือก ไม่ใช่ข้อบังคับของ flow การเล่นต่อ

## Mobile and interaction verification

ที่ viewport 375 × 812 ร้อยแก้วผลลัพธ์ยังนำสายตาก่อน ledger รองและ composer โดยไม่มี horizontal clipping ปุ่ม `WRITE NEXT INTENT` และ `SET THIS INTENTION` เรียงตาม flow เดียวกันและเข้าถึงได้ในหน้าต่อเนื่อง

browser regression `tests/play-dice-outcome-flow.spec.mjs` ผ่าน โดยตรวจว่าหลังคลิก Roll 2D12 มี `dice-decision-window` ที่อยู่ในสถานะหมุนพร้อมลูกเต๋าสองลูก, สถานะหมุนสิ้นสุดภายในห้าวินาทีและเหลือปุ่มบันทึกผล, จากนั้น Narrative Outcome และ textarea ของเจตนาถัดไปยังอยู่หน้าเดียวกัน

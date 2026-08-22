# Dust & Fire — Play Outcome Flow Review

**ขอบเขต:** Play Scene ใน review state `?review=play&outcome=saved`, desktop 1280 × 720 แบบ full-page

ผลตรวจยืนยันว่า Narrative Outcome อยู่ในหน้า Play เดิม ไม่พาผู้เล่นไปยังหน้าแยก ร้อยแก้วผลลัพธ์เป็นส่วนแรกใต้หัวผลทอยและใช้ขนาดตัวอักษรเด่นเต็มความกว้าง ก่อนข้อมูลรองคือผลทอย การฝึกวิชา และเวลา/เส้นเรื่อง Composer “What will you do?” อยู่ต่อท้าย narrative และพร้อมรับเจตนาถัดไปโดยตรง

ปุ่ม `WRITE NEXT INTENT` เลื่อนกลับไปยัง composer เดียวกัน ขณะที่ `RETURN TO MAP` และ `OPEN CHRONICLE` เป็นทางออกทางเลือก ไม่ใช่ข้อบังคับของ flow การเล่นต่อ

## Mobile and interaction verification

ที่ viewport 375 × 812 ร้อยแก้วผลลัพธ์ยังนำสายตาก่อน ledger รองและ composer โดยไม่มี horizontal clipping ปุ่ม `WRITE NEXT INTENT` และ `SET THIS INTENTION` เรียงตาม flow เดียวกันและเข้าถึงได้ในหน้าต่อเนื่อง

browser regression `tests/play-dice-outcome-flow.spec.mjs` ผ่าน โดยตรวจว่าหลังคลิก Roll 2D12 มี `dice-decision-window` ที่อยู่ในสถานะหมุนพร้อมลูกเต๋าสองลูก, สถานะหมุนสิ้นสุดภายในห้าวินาทีและเหลือปุ่มบันทึกผล, จากนั้น Narrative Outcome และ textarea ของเจตนาถัดไปยังอยู่หน้าเดียวกัน

## Outcome layout correction

หลังได้รับ feedback ว่าหน้าซ้อนกัน ได้แยก Outcome state ออกจากบล็อกฉากตั้งต้นโดยสมบูรณ์ ผลตรวจที่ 1280 × 720 และ 375 × 812 ยืนยันว่าหน้าแสดงเพียงหัวผลลัพธ์ ร้อยแก้วหลัก ผลกระทบสั้น แถวสรุปสามช่อง ปุ่ม action และ composer เจตนาถัดไปตามลำดับ ไม่มีหัวฉากเก่า Skill Ledger เดิม บทนำเดิม หรือแนวทางเดิมปรากฏซ้ำใต้ Outcome

## Three-stage roll flow refinement

รอบล่าสุดแยก flow เป็นสามจังหวะชัดเจน: หลัง `ROLL 2D12` แสดง stage ลูกเต๋า 2 ลูกเด้งและหมุนโดยมีหัว `ROLLING 2D12`; เมื่อลูกเต๋าหยุดจึงเปลี่ยนเป็น `DICE RESULT · DECISION WINDOW` พร้อม total, DN, Momentum และปุ่ม `RECORD THIS RESULT`; จากนั้น Narrative Outcome เปิดเป็นหน้าผลเฉพาะของตนเอง

Outcome ใหม่วางแถวคำนวณขนาดย่อใต้หัวผลลัพธ์ ได้แก่ผลลูกเต๋า, วิชาที่ใช้พร้อมโบนัส, แกน/บริบท และผลรวมเทียบ DN จากค่าที่คำนวณจริง แล้วจึงแสดงร้อยแก้ว, ledger ผลลัพธ์สามช่อง, แนวทางถัดไป และ composer สำหรับเจตนาถัดไป ผลตรวจ desktop 1280 × 720 และ mobile 375 × 812 ยืนยันว่าไม่มีบล็อกฉากเดิมซ้อน และ composer อยู่หลัง action row ตามลำดับที่ผู้ใช้ระบุ

## Follow-up: visible roll when the OS requests reduced motion

พบว่า implementation เดิมข้าม stage การทอยทั้งหมดเมื่อ browser รายงาน `prefers-reduced-motion: reduce` จึงทำให้ผู้เล่นเห็นผลตัดสินใจทันทีแทนลูกเต๋าหมุน แก้ให้ทุกการกด `ROLL 2D12` เข้าสู่ stage สี่วินาทีเสมอ พร้อมสลับหน้าลูกเต๋าแบบ JavaScript และ motion ที่ช้าลงใน reduced-motion mode ก่อนเปิดช่วงตัดสินใจ เพิ่ม Playwright regression ที่จำลองค่า reduced motion โดยตรงเพื่อยืนยันว่า `ROLLING 2D12` และลูกเต๋าสองลูกยังปรากฏก่อนปุ่มบันทึกผล

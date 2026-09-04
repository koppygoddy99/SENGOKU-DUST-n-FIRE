# สถานะแคมเปญและการบันทึก

เกมใช้ **Local Save-first**: GameState, Roll records, Leaf, progression, missions, rewards, memories และ campaign snapshots เก็บใน browser เป็นหลัก คีย์หลักปัจจุบันคือ `dust-fire-local-game-v3-saika`.

Manual Save, Auto Save, Load Game และ Chronicle ต้องอ้างอิงแคมเปญที่เลือกอยู่ ไม่ปนประวัติของแคมเปญอื่น การเล่น Local Trial จึงดำเนินต่อได้แม้บริการ AI หรือเซิร์ฟเวอร์ไม่ตอบ

ชุดอาชีพเริ่มต้น 10 แบบ, ภารกิจแรก, Mastery, สัมภาระ, สถานะเริ่มต้น และภูมิหลังตัวละครสองข้อที่ไม่เพิ่มแต้ม อ่านได้ที่ [`docs/game-design/starter-occupations-th.md`](game-design/starter-occupations-th.md). ผังเทคนิคตั้งแต่กดทอยจน Local Save บันทึกผล อ่านได้ที่ [`docs/technical/one-turn-backend-flow-th.md`](technical/one-turn-backend-flow-th.md). Contract ของ Main Thread/Side Leads, canon consistency, offline yearly catalog และ historical date gate อ่านได้ที่ [`docs/technical/gm-canon-mission-timeline-contract-th.md`](technical/gm-canon-mission-timeline-contract-th.md). รายงาน coverage, source hierarchy และช่องว่างที่ catalog ไม่ยอมแต่งเติม อ่านได้ที่ [`docs/research/sengoku-timeline-coverage-audit-th.md`](research/sengoku-timeline-coverage-audit-th.md).

# AI GM และ historical guardrails

AI GM เป็นส่วนเสริม ไม่ใช่ผู้ตัดสินเต๋า หน้าที่คือวิเคราะห์เจตนา เขียนผลเชิงนิยาย สร้างตัวเลือกถัดไป และเลือก fact cards ทางสังคมประวัติศาสตร์ที่ตรงกับฉาก กฎที่ไม่เปลี่ยนคือ:

1. AI ห้ามสุ่มเต๋า แก้ Total, Margin หรือ Outcome ที่ deterministic engine ตัดสินแล้ว
2. AI ห้ามให้ context bonus เกิน `+2` และ DN ต้องผ่าน canonical rule ของ client
3. หาก AI timeout, credit ใช้ไม่ได้ หรือเป็น UI Preview เกมต้อง fallback เป็น Local Trial โดยไม่หัก AI credit
4. NPC และเหตุการณ์ในแคมเปญเป็นเรื่องสมมติ เว้นแต่ระบบติด historical status ที่มีหลักฐานตรงจุด
5. GM ใช้ Main Thread ได้หนึ่งรายการและ Side Leads ที่เปิดเผยได้ไม่เกินสองรายการ; การเบนเรื่องอย่างมีนัยสำคัญจึงเปลี่ยน Main Thread หลังผลทอยเท่านั้น
6. เหตุการณ์จริงที่มี exact date จะถูกกล่าวว่าเกิดในฉากได้ต่อเมื่อ campaign มี `historicalDate` ที่ผู้เล่นยืนยันตรงกับ record; scene day ปกติเป็นเวลา gameplay ไม่ใช่วันที่ประวัติศาสตร์

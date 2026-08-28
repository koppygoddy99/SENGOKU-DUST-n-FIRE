# Sengoku 66 Provinces Data

โฟลเดอร์นี้เก็บข้อมูลแคว้นยุค Sengoku ฉบับขยายสำหรับใช้เป็น **historical content/data source** ของเกม ยังไม่ถูก import เข้า runtime

| ไฟล์ | บทบาท |
|---|---|
| `sengoku_66_provinces_expanded.json` | JSON รวม 66 แคว้นสำหรับ import/tooling |
| `*_expanded.json` | JSON รายแคว้นสำหรับ query, diff และแก้ไขเฉพาะพื้นที่ |
| `../docs/research/sengoku_66_provinces_expanded.md` | Markdown สำหรับตรวจสอบโดยมนุษย์ |
| `../docs/research/qa_report_expanded.json` | รายงานตรวจสอบโครงสร้างชุดข้อมูล |

ข้อมูลการค้าในแต่ละยุคใช้ฟิลด์ `trade.imports`, `trade.exports`, `trade.popular_goods`, `trade.why`, `trade.confidence` และ `trade.caveat` ส่วนข้อเท็จจริงที่หลักฐานไม่พอจะระบุไว้ ไม่ควรแปลงข้อเสนอเชิงเกมเป็น historical fact โดยไม่ดูระดับความแน่นอน

## กติกาการใช้

ใช้ `province_id` เป็น stable ID ห้ามใช้ชื่อแสดงผลเป็น key หลัก เนื่องจากชื่อไทย ญี่ปุ่น อังกฤษ และการสะกดโรมาจิอาจเปลี่ยนได้ การเพิ่ม faction, route หรือ event ใหม่ควรมี `valid_from`, `valid_to`, `provenance` และ `confidence` หากเป็นข้อมูลจากการสังเคราะห์หรือการแต่งเติมเพื่อเกม

Power & Rumor Network ยังไม่ได้เปิดใช้งานจากโฟลเดอร์นี้ การเชื่อมกับ Campaign Command ให้ดู `docs/integration/power-rumor-network-campaign-command.md`

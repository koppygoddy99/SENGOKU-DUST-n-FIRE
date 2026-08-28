# Random Event (อีเวนต์สุ่มยาก) — Draft schema v0

> สถานะ: **ดราฟต์เท่านั้น** — ยังไม่ได้ต่อสายเข้า `applyRoll` / game loop
> กลไก Social Record รอบนี้ทำงานผ่าน **ภารกิจหลัก/รอง + สัญญา/หนี้** ก่อน
> ไฟล์นี้เก็บข้อตกลงของ "อีเวนต์สุ่มยาก" ไว้ เติมโค้ดจริงทีหลัง

## หลักการ
- อีเวนต์สุ่มยาก = หนึ่งในต้นทางที่ทำให้ Social Record (เกียรติ/บารมี/ข่าว) ขึ้น **เฉพาะเมื่อสำเร็จ**
- ต้องผ่าน `historical_fence` / `era_range` / `seasons` / `occupation_tags` ก่อนแสดง
- ทุก `choice` มี `check` (stat + tags) + `effects` → เป็นคนเดียวกับที่ Social Record ฟัง
- มี `cooldown_days` ป้องกันเกิดซ้ำถี่, `repeat_policy` คุมการวน
- วางไว้โครงสร้างเดียวกับที่เสนอ (ไม่เริ่มเขียน runtime จนกว่าจะได้รับอนุมัติ)

## ตัวอย่าง draft (น้ำหลากตัดเส้นทาง)

```json
{
  "event_id": "national-summer-flooded-road-001",
  "title": "น้ำหลากตัดเส้นทาง",
  "location_scope": "national",
  "location_types": ["road", "river_crossing", "village", "coast"],
  "seasons": ["Summer"],
  "weather_tags": ["heavy_rain", "flood"],
  "era_range": [1467, 1615],
  "occupation_tags": ["all"],
  "weight": 10,
  "cooldown_days": 20,
  "repeat_policy": "allow_with_weather_change",
  "historical_fence": "plausible_reconstruction",
  "choices": [
    { "id": "wait_flood", "check": { "stat": "mind", "tags": ["patience", "planning"] }, "effects": [{"type": "time", "amount": 2}, {"type": "food", "amount": -1}] },
    { "id": "pay_boatman", "check": { "stat": "heart", "tags": ["negotiation", "transport"] }, "effects": [{"type": "currency", "amount": -3}, {"type": "focus", "amount": -1}] },
    { "id": "cross_risk", "check": { "stat": "body", "tags": ["swim", "endurance"] }, "effects": [{"type": "wounds", "amount": -1}, {"type": "food", "amount": -1}] },
    { "id": "find_alternate", "check": { "stat": "wit", "tags": ["route", "navigation"] }, "effects": [{"type": "time", "amount": 1}, {"type": "food", "amount": -2}] }
  ],
  "memory_key": "summer-flooded-road",
  "tags": ["weather", "travel", "route", "disaster"]
}
```

## เงื่อนไขเชื่อมกับ Social Record (เมื่อ implement จริง)
- **สำเร็จ** อีเวนต์สุ่มยาก (กำหนดตาม `check`) → เกียรติ/บารมี/ข่าว **+0.5** (สอดคล้องกับ "เพิ่มยาก 2x")
- **พลาดรุนแรง** อีเวนต์สุ่มยาก → ข้อครหา **+1** (เหมือน failure_with_consequence)
- ยังไม่ผูกกับฟังก์ชันใด — เติมที่ `applySocialRecord`/`applyRoll` เมื่อพร้อม
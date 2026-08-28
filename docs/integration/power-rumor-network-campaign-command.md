# Power & Rumor Network — Campaign Command Integration Contract

สถานะเอกสาร: **เตรียมพร้อมสำหรับการ integrate เท่านั้น**

เอกสารนี้กำหนดจุดเชื่อมต่อสำหรับระบบ **Reputation แบบแยก faction, Heat/Wanted แบบแยกพื้นที่/ฝ่าย และ Seasonal Pressure** กับหน้า Campaign Command ของ Dust & Fire โดยรอบนี้ยังไม่เปิดระบบใน runtime และยังไม่เปลี่ยน `GameState` เดิม

## ตำแหน่งบนผลิตภัณฑ์

Campaign Command ควรเป็นพื้นที่สำหรับ “ตัดสินใจระยะกลาง” ส่วนการแสดงผลแบบเร่งด่วนยังอยู่ในหน้าแผนที่ หน้าสนทนา และหน้า Market Hub

| พื้นที่ | สิ่งที่จะเพิ่มในอนาคต | รอบนี้ |
|---|---|---|
| Campaign Command | ปุ่ม/การ์ด `Power & Rumor Network` และสรุปเส้นทางที่เสี่ยง | ยังไม่เปิด |
| Province/Map | faction ที่คุมพื้นที่ ด่าน Heat เส้นทางและฤดูกาล | ยังไม่เปิด |
| Dialogue | stance ของ faction, สิ่งที่ NPC รู้, หนี้ และคำเตือน | ยังไม่เปิด |
| Market Hub | price band, stock pressure, route condition และ provider affiliation | ยังไม่เปิด |
| Chronicle/Journal | event, witness, rumor, debt และเหตุผลที่ค่าเปลี่ยน | ยังไม่เปิด |

## Contract ระหว่าง data layer กับ Campaign Command

Campaign Command ในอนาคตควรอ่าน projection ที่ผ่าน visibility filter แล้ว ไม่อ่าน `event_log` ทั้งหมดโดยตรง

```ts
export type PowerRumorSummary = {
  provinceId: string;
  currentSeason: "Spring" | "Summer" | "Autumn" | "Winter";
  knownFactions: Array<{
    factionId: string;
    name: string;
    stance: string;
    visibleReason: string;
  }>;
  localRisk: {
    heatLevel: number;
    status: "unseen" | "suspected" | "identified" | "wanted" | "archived";
    label: string;
    reason: string;
  };
  seasonalPressure: {
    foodStock: number;
    laborAvailability: number;
    routeCondition: number;
    marketPressure: number;
    summary: string;
  };
  routeChoices: Array<{
    routeId: string;
    status: "open" | "risky" | "closed" | "unknown";
    reason: string;
  }>;
  recentRumors: Array<{
    id: string;
    summary: string;
    confidence: number;
    sourceLabel: string;
  }>;
};
```

## กฎ integrate

1. **อ่านอย่างเดียวก่อน:** Campaign Command รอบแรกต้องอ่าน `PowerRumorSummary` ที่สร้างจาก projection เท่านั้น ห้ามเขียน reputation/heat โดยตรงจาก UI
2. **ทุกการเปลี่ยนต้องมี event:** การช่วยหมู่บ้าน ปลอมเอกสาร จ่ายหนี้ เปิดเส้นทาง หรือเปลี่ยนฤดูกาลต้องสร้าง event ที่มี actor, เวลา, สถานที่, witness, evidence และ `source_event_ids`
3. **แยกความรู้:** สิ่งที่ผู้เล่นเห็น, สิ่งที่ตัวละครรู้, ข่าวลือ และข้อมูล GM ต้องผ่าน `visibility` คนละชั้น
4. **ไม่มี global score:** ห้ามสร้าง reputation หรือ heat ค่าเดียวที่ใช้ทั้งโลก
5. **ฤดูกาลต้องเป็นพื้นที่:** จังหวัดภูเขา ท่าเรือ Kinai และ Hokuriku ต้องอ่านค่า route/province คนละชุด
6. **legacy safe:** หาก save เดิมไม่มีสามระบบนี้ ให้ใช้ empty projection และ UI ไม่แสดงการ์ดจนกว่าจะเปิด feature flag

## Feature flags ที่เตรียมไว้

```ts
export type WorldSystemsFlags = {
  powerRumorNetwork: boolean;
  factionReputation: boolean;
  scopedHeat: boolean;
  seasonalPressure: boolean;
  npcMemoryRetrieval: boolean;
};
```

ค่าเริ่มต้นที่แนะนำคือทั้งหมด `false` ใน production จนกว่าจะผ่าน migration, replay test, visibility test และ UI test

## ลำดับ implementation ที่แนะนำ

เริ่มจาก read-only province card → เพิ่ม faction stance ที่อธิบายด้วยเหตุการณ์ → เพิ่ม local heat/route warning → เพิ่ม market pressure → เพิ่ม action ที่เขียน event → เปิด NPC memory retrieval → จึงค่อยเปิด feature flag แบบทีละระบบ

## Acceptance criteria ก่อนเปิดใช้

| หมวด | ผ่านเมื่อ |
|---|---|
| Historical boundary | รายการที่อิงประวัติศาสตร์มี provenance และแยก fact/inference/game invention |
| Data | 66 แคว้นใช้ stable `province_id`; faction และ route มีช่วงเวลา |
| Gameplay | การเลือกเส้นทาง/ผู้คุ้มครอง/ฤดูกาลมีผลลัพธ์อย่างน้อยสองแบบ ไม่ใช่ debuff เดียว |
| Security/visibility | NPC ไม่เห็น hidden truth และผู้เล่นไม่เห็น faction secret |
| Persistence | rebuild projection จาก event log แล้วได้ผลเดียวกัน |
| UX | ผู้เล่นเข้าใจเหตุผลของชื่อเสียง Heat และแรงกดดันโดยไม่ต้องอ่านตัวเลขดิบ |
| Performance | Campaign Command ไม่ scan world state ทั้งก้อน; ใช้ projection/index |

## ไฟล์อ้างอิงใน repository

- `data/sengoku-66-provinces/` — ข้อมูล 66 แคว้นฉบับขยาย
- `docs/research/sengoku_research_expansion_final.md` — งานวิจัยและข้อเสนอระบบ
- `schemas/sengoku_world_state.schema.json` — JSON Schema Draft 2020-12
- `schemas/examples/sengoku_world_state.example.json` — ตัวอย่าง state ฉาก Sakai

รอบนี้เป็น **integration-ready documentation/data only** ยังไม่มีการ import เข้า `GameState`, ยังไม่มี migration ฐานข้อมูล และยังไม่มี UI/runtime behavior ใหม่

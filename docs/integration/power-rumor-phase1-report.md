# Power & Rumor Network — Phase 1 Report (Read-only adapter)

**วันที่:** 28 สิงหาคม 2026
**สถานะ:** เสร็จสิ้น — รออนุมัติเข้า Phase 2
**ฐานโค้ด:** commit `f6cb62d` → เพิ่มงาน Phase 1 (ยังไม่ commit)

---

## สิ่งที่เปลี่ยน (หลังแก้ Phase 1)

### ไฟล์เพิ่มใหม่
1. `client/src/lib/powerRumor.ts` — types + projection builder (read-only)
   - `WorldSystemsFlags`, `WorldSystems` types
   - `buildPowerRumorSummary(game, language)` → `PowerRumorSummary` (แบบเต็ม สำหรับ Campaign Command)
   - `buildStoryCompact(game, language)` → `StoryCompactProjection` (แบบย่อ สำหรับ Story/Play)
   - ฟังก์ชัน derivative: `deriveLocalHeat`, `deriveFactionStances`, `deriveSeasonalPressure`, `deriveRumors`
   - **ไม่เปลี่ยน GameState เดิม** — คำนวณจาก memories / social / relationships / community / economy / campaign
2. `client/src/features/powerRumor/PowerRumorPanel.tsx` + `powerRumor.css` — UI แบบเต็ม (expand/collapse)
3. `client/src/features/powerRumor/StoryCompactStatus.tsx` + `storyCompact.css` — UI แบบเล็กค้างตลอด (sticky)
4. `client/src/lib/powerRumor.test.ts` — unit test (7 tests)

### ไฟล์แก้ไข
1. `client/src/lib/game.ts`
   - เพิ่ม `WorldSystemsFlags`, `WorldSystems` types
   - เพิ่ม `worldSystems?: WorldSystems` ใน `GameState` (optional — ไม่เปลี่ยนโครงสร้างเดิม)
   - เพิ่ม migration ใน `normalizeGameState`: `worldSystems: state.worldSystems ?? { schemaVersion: 1 }` (idempotent, legacy-safe)
2. `client/src/pages/Home.tsx`
   - import + แทรก `<PowerRumorPanel>` ใต้ `<StoryMap>` (page === "home")
   - import + เพิ่ม `powerRumor: buildPowerRumorSummary(game, "th")` ใน `toGMContext` (ส่งให้ AI แบบ filtered)
3. `client/src/features/chronicle/ChronicleView.tsx`
   - import + แทรก `<StoryCompactStatus>` ด้านบนสุดของ view (หน้า เรื่องราว)

---

## Test ที่รันและผลลัพธ์

| คำสั่ง | ผลลัพธ์ |
|---|---|
| `pnpm check` (tsc --noEmit) | ✅ ผ่าน (0 errors) |
| `pnpm test` (vitest run) | ✅ 160/160 tests, 37 files ผ่าน |
| `pnpm build` (vite + esbuild) | ✅ built in 3.98s |

**Test เพิ่มเอง (powerRumor.test.ts):** 7 tests ผ่าน
- ไม่เปลี่ยน GameState (immutability)
- faction มีคำอธิบาย ไม่ใช่ตัวเลขดิบ
- local heat มาจาก stain/evidence ไม่ใช่ global reputation
- compact projection มี vitals + 5 attributes + time + powerRumor
- critical vitals เมื่อ wounds ≥ 5
- legacy migration เพิ่ม worldSystems ว่าง
- preserve worldSystems ที่มีอยู่

---

## Save migration result

- `normalizeGameState` เพิ่ม `worldSystems: state.worldSystems ?? { schemaVersion: 1 }`
- Legacy save (ไม่มี worldSystems) → เปิดเล่นได้ → ได้ `{ schemaVersion: 1 }` อัตโนมัติ
- Save ที่มี worldSystems อยู่แล้ว → ถูกเก็บรักษา (test ยืนยัน)
- **ไม่มีการเขียนทับ manual save** — เพียงแต่งค่า default เมื่ออ่าน

---

## Known limitations (Phase 1)

1. **ยังเป็น read-only projection** — ไม่มี event writer ยัง (ตามลำดับ Phase 2–6)
2. **Faction stance ยังคำนวณแบบ conservative** จาก relationships + social score — ยังไม่มี event log เต็ม
3. **Heat ยัง derivate จาก stain memory** — ไม่มี detecting faction / province scope จริง (รอ Phase 4)
4. **Rumor ดึงจาก memories ที่เป็น news/witness** — ยังไม่มี rumor propagation (รอ Phase 6)
5. **Feature flags ยังไม่เปิดใน UI** — projection แสดงเสมอใน Phase 1 (จะคุมด้วย flag ใน Phase 8)
6. **ไม่มี canonical event types** ยัง (roll_resolved / heat_changed ฯลฯ) — รอ Phase 3+

---

## วิธี rollback

หากต้องการถอน Phase 1:
```bash
git revert <phase-1-commit>   # หรือ
git checkout f6cb62d -- client/src/lib/game.ts client/src/pages/Home.tsx client/src/features/chronicle/ChronicleView.tsx
rm -rf client/src/lib/powerRumor.ts client/src/features/powerRumor
```
เนื่องจากเป็นเพียงการเพิ่ม optional field + projection แบบอ่านอย่างเดียว การ rollback จะไม่กระทบ save เดิมเลย

---

## Phase ถัดไป (Phase 2: UI shell polish + Phase 3: Reputation write)

เมื่อคุณอนุมัติ ผมเสนอ:
- **Phase 2:** ปรับ responsive ให้ Panel / Status บน mobile (bottom sheet), เพิ่ม animation ตาม Token ของ Team 5
- **Phase 3:** เปิด faction reputation แบบ event-driven — เสียบ `emitEvent` ใน `applyRoll` / `buyMarketOffer` แล้วคำนวณ score จาก event log (ไม่ใช้ global)
- **Phase 4:** Local Heat + route warning จริง (province/location/faction scope)
- **Phase 5:** Seasonal Pressure เชื่อม season เดิม
- **Phase 6:** Write events (canonical event types)
- **Phase 7:** AI retrieval ใช้ projection เดียวกัน
- **Phase 8:** Feature flag release + rollback

**กรุณาอนุมัติเพื่อเข้า Phase 2/3 ครับ**

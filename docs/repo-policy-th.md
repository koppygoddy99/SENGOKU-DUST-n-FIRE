# นโยบาย Repository: GitHub sync, License และทรัพย์สิน

## GitHub และกติกาการส่งมอบ

Repository นี้ใช้ `main` เป็น branch หลัก และ remote ชื่อ `github` ชี้ไปยัง repository ส่วนตัว `koppygoddy99/SENGOKU-DUST-n-FIRE`.

> **นโยบายการซิงก์:** ทุก milestone ที่ส่งมอบให้ผู้ใช้ต้องผ่านการตรวจที่เกี่ยวข้อง, สร้าง checkpoint และถูก commit/push ไป `github main` ก่อนรายงานผล. งานระหว่างทำสามารถอยู่ใน working tree ได้ชั่วคราว แต่จะไม่ถูกอ้างว่าส่งมอบหรือเสร็จจนกว่าจะซิงก์สำเร็จ.

ลำดับมาตรฐานคือ: ตรวจ `todo.md` → รัน tests ที่เกี่ยวข้อง → สร้าง checkpoint → ตรวจ `git status` → commit/push → รายงาน commit/checkpoint ที่ส่งมอบ.

## เอกสารสำคัญ

| เอกสาร | ใช้เมื่อ |
|---|---|
| [`docs/dust-fire-core-game-source-of-truth-th.md`](dust-fire-core-game-source-of-truth-th.md) | ต้องการ contract กติกาและ state transition เชิง implementation |
| [`docs/dust-fire-rules-and-character-summary-th.md`](dust-fire-rules-and-character-summary-th.md) | ต้องการคู่มือผู้เล่นอ่านง่าย |
| [`docs/dust-fire-deep-game-guide-th.md`](dust-fire-deep-game-guide-th.md) | ต้องการคู่มือเชิงลึกสำหรับผู้เล่นและนักพัฒนา |
| [`docs/dust-fire-lore-narrative-art-bible-th.md`](dust-fire-lore-narrative-art-bible-th.md) | ต้องการขอบเขตเรื่อง ภาษา ฉาก และอาร์ต |
| [`docs/play-outcome-flow-review-2026-08-22-th.md`](play-outcome-flow-review-2026-08-22-th.md) | ต้องการหลักฐาน QA ของ flow ลูกเต๋า/ผลเชิงเรื่องเล่า/DN ล่าสุด |
| [`docs/team-work-status-2026-08-21-th.md`](team-work-status-2026-08-21-th.md) | ต้องการสถานะตาม workflow ทีมผลิตเกม |
| [`docs/team-handbooks/09-backend-systems-handbook-th.md`](team-handbooks/09-backend-systems-handbook-th.md) | ต้องการขอบเขต server contracts, persistence, AI GM integration, asset delivery และ observability ของ Team 8 |
| [`docs/technical/gm-canon-mission-timeline-contract-th.md`](technical/gm-canon-mission-timeline-contract-th.md) | ต้องการข้อจำกัด Main Thread/Side Leads, canon consistency, offline historical catalog และ date gate ของ GM AI |
| [`docs/research/sengoku-timeline-coverage-audit-th.md`](research/sengoku-timeline-coverage-audit-th.md) | ต้องการตัวเลข coverage, source audit, date precision และช่องว่างที่ยังห้าม GM AI สร้างข้อมูลขึ้นเอง |

## License และทรัพย์สิน

โค้ดและเอกสารของ repository นี้เป็นของโครงการ Dust & Fire ตามสิทธิ์ที่เจ้าของโครงการกำหนด. ห้ามนำ PDF, แผนที่, illustration หรือทรัพย์สินภายนอกที่มีลิขสิทธิ์มา commit หรือใช้งานโดยไม่มีสิทธิ์ชัดเจน. ทรัพย์สินรูปภาพที่ผู้ใช้อนุญาตให้ใช้ต้องถูกบันทึกที่มาและใช้ตามขอบเขตอนุญาตเท่านั้น.

### Asset runtime manifest

| Asset | สิทธิ์/ที่มา | Runtime path | สถานะตรวจรับ |
|---|---|---|---|
| National Map clean | ผู้ใช้ยืนยันสิทธิ์สำหรับแผนที่ฐาน | `client/public/assets/dust-fire-national-map-clean.webp` → `/assets/dust-fire-national-map-clean.webp` | WebP ขนาด 1600×900 ที่อยู่ใน repository เพื่อให้ทั้ง `pnpm dev` จาก VS Code และ deployment ของ Vite เสิร์ฟ path เดียวกัน |

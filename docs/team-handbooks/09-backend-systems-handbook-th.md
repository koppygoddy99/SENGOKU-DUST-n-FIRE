# Team 8 — Backend Systems Handbook

> สถานะ: คู่มือปฏิบัติงานเฉพาะ Team 8
>
> ผู้อ่าน: Backend Systems, Game Development, QA, Release and Operations
>
> รูปแบบสมาชิก: ตารางนี้คือ **บทบาทงาน** ไม่ใช่บัญชีผู้ใช้หรือบุคคลจริง ในทีมขนาดเล็กคนหนึ่งอาจรับหลายบทบาทได้ แต่ความรับผิดชอบและเกณฑ์ผ่านของแต่ละบทบาทต้องแยกชัด

## 1. พันธกิจ

Team 8 รับผิดชอบความเชื่อมโยงระหว่าง client, server, persistence และบริการภายนอก เพื่อให้เกมอ่านและเขียน state เดียวกันได้อย่างตรวจสอบได้ ทีมนี้ทำให้ contract ชัด, migration ปลอดภัย, asset ถูกส่งถึง runtime ที่ถูกต้อง และความผิดพลาดสังเกตได้ แต่ไม่ตัดสินกติกา DN, ความยาก, narrative tone หรือข้อเท็จจริงประวัติศาสตร์แทน Team 1–3

> หลักตัดสิน: หากผู้เล่นกดหนึ่งครั้งแล้ว state เปลี่ยน ระบบต้องบอกได้ว่า **ข้อมูลใดเปลี่ยน เพราะเหตุใด ใคร/โมดูลใดอนุญาต และทดสอบย้อนกลับได้อย่างไร**

## 2. แผนผังสมาชิกและบทบาท

| รหัส | บทบาท | ความรับผิดชอบหลัก | เจ้าของ artifact | อำนาจตัดสินใจ |
|---|---|---|---|---|
| B8-1 | **Backend Systems Lead** | กำหนดขอบเขต contract, จัดลำดับหนี้เทคนิค, ตัดสิน dependency และรับงานข้ามทีม | API contract register, architecture decision record, release readiness | อนุมัติการเปลี่ยน contract; หยุด release เมื่อ state/migration เสี่ยง |
| B8-2 | **Game State & Persistence Engineer** | ดูแล `GameState`, Local Save, normalization, versioning, data integrity และ rollback safety | state schema, save fixtures, migration functions, persistence tests | ปฏิเสธการเปลี่ยน field ที่ไม่มี fallback ของเซฟเก่า |
| B8-3 | **Server & API Contract Engineer** | ดูแล tRPC procedures, input/output schema, authorization, error shape และ client/server parity | router contracts, Zod schemas, API tests, error catalog | ปฏิเสธ endpoint ที่ไม่มี auth/error/fallback contract |
| B8-4 | **AI Integration & Safety Engineer** | ดูแล AI GM request lifecycle, server-only secrets, validation, timeout, Local Trial fallback และ historical handoff | GM schemas, prompt boundary, timeout policy, AI smoke tests | ปิด AI path ที่ตอบไม่ตรง schema หรือเสี่ยงเปิดข้อมูลลับ |
| B8-5 | **Data & Migration Engineer** | ดูแล Drizzle schema, migration order, backfill strategy, compatibility fixtures และ data-retention notes | migration plan, SQL review, fixture matrix, rollback note | ห้าม destructive migration หากไม่มี backup/restore plan ที่อนุมัติ |
| B8-6 | **Asset Delivery & Runtime Engineer** | ดูแล asset manifest, static storage, runtime path, cache policy, local dev verification และสิทธิ์ไฟล์ | asset manifest, checksum record, runtime asset tests | ปฏิเสธ asset ที่สิทธิ์ไม่ชัด, path ตาย หรือ local runtime โหลดไม่ได้ |
| B8-7 | **Observability & Reliability Engineer** | ดูแล structured logs, health checks, correlation fields, incident triage และ performance baseline | log taxonomy, alert/triage sheet, health check evidence | ประกาศ incident และขอหยุด release เมื่อ observability ไม่พอ |

## 3. หน้าที่รายบทบาทแบบละเอียด

### B8-1 — Backend Systems Lead

บทบาทนี้ถือภาพรวมของ backend แต่ไม่เขียนกติกาเอง เมื่อ Team 2 ต้องการเพิ่มกลไกใหม่ หรือ Team 4 ต้องการข้อมูลใหม่ใน UI, Lead ต้องแปลงความต้องการเป็น contract ที่ระบุ owner, state input, state output, validation, migration, fallback และ test owner ให้ครบก่อนเริ่มงาน เขาต้องรักษา decision log ว่าเหตุใดจึงเลือก Local Save, ใช้ AI GM แบบ optional, หรือให้ asset อยู่ใน static storage

| รับจาก | ตรวจอะไร | ส่งให้ | ผลส่งมอบ |
|---|---|---|---|
| Team 1–2 | กติกาใหม่เปลี่ยน state อะไรและมีข้อห้ามใด | B8-2/B8-3/B8-4 | contract plan และลำดับ implementation |
| Team 4 | UI ต้องใช้ข้อมูลหรือ action ใด | B8-3 | typed procedure หรือ local-state adapter |
| Team 6–7 | ข้อบกพร่อง/ความเสี่ยง release | ทุกบทบาท B8 | severity, owner, deadline และ stop-ship decision |

### B8-2 — Game State & Persistence Engineer

ดูแลความจริงหนึ่งเดียวของแคมเปญ ได้แก่ `GameState`, `RollPreview`, `RollRecord`, inventory, Vitals, Trait/Mastery Progress, agreements, memories, missions และ progression งานสำคัญคือทำให้ `applyRoll()` ให้ Progress ตาม Trait/Mastery/DN ที่ตรวจได้, item ถูกหักเฉพาะตอน commit, และเซฟเก่ายังโหลดได้หลังเปลี่ยนคำหรือชื่อ field เช่น `axis → stat` หรือ schema v4 → v5 ที่ลบ Momentum.

| งานประจำ | เกณฑ์ผ่าน | ข้อห้าม |
|---|---|---|
| เพิ่ม/เปลี่ยน field | มี default, normalize path และ fixture ของเซฟก่อนเปลี่ยน | เปลี่ยนชื่อ field persisted โดยไม่มี fallback |
| เปลี่ยน state หลัง action | `applyRoll()` หรือ transition ที่เทียบเท่าทดสอบ input/output ได้ | ซ่อน state mutation ใน component render |
| Local Save | version/shape ไม่ล้มเมื่อ key ขาดหรือ format เก่า | ลบเซฟผู้เล่นแบบเงียบหรือ auto-reset โดยไม่มี warning |

### B8-3 — Server & API Contract Engineer

ดูแล server boundary ระหว่าง React client, tRPC และ service ภายนอก ทุก procedure ต้องมี input validation, authorization policy, error message ที่ UI รับมือได้ และ response shape ที่ไม่ทำให้ UI ต้องเดา ขอบเขตนี้รวม Admin Console, profile, timeline และ AI GM route แต่ไม่รวมการออกแบบหน้าจอ

| หัวข้อ | ต้องมีเสมอ | หลักฐานตรวจรับ |
|---|---|---|
| Public procedure | input schema, rate/abuse consideration, typed output | router test และ invalid-input case |
| Protected/Admin procedure | role gate, no data leakage, explicit `FORBIDDEN` path | auth/role regression |
| Error path | user-safe message, log context, fallback behavior | test อย่างน้อย success + failure |
| Contract change | backward compatibility หรือ coordinated client update | changelog และ type check ผ่าน |

### B8-4 — AI Integration & Safety Engineer

AI GM เป็นบริการเสริม ไม่ใช่เงื่อนไขให้ผู้เล่นเซฟหรือเล่นต่อได้ บทบาทนี้บังคับให้คำขอออกจาก server เท่านั้น, key ไม่ไหลสู่ client, ผลตอบผ่าน schema, timeout มีขอบเขต และ Local Trial ทำงานเมื่อ AI ล้มเหลว นอกจากนี้ต้องส่ง historical fence, campaign context และ language guardrail ในรูปแบบที่โมเดลใช้ได้ แต่ไม่ปล่อยให้โมเดลเขียน state โดยตรงโดยไม่ผ่านกติกา deterministic

| สถานการณ์ | พฤติกรรมที่ต้องเกิด | เจ้าของการตรวจ |
|---|---|---|
| AI ตอบตาม schema | แปลงเป็น narrative/next approaches โดยใช้ roll record เดิม | B8-4 + Team 3 |
| Timeout หรือ network error | สลับ Local Trial, ไม่หักเครดิต และบันทึกเหตุผิดพลาดที่ไม่เปิด secret | B8-4 + Team 6 |
| Schema ไม่ผ่าน | ไม่ commit ผล AI, คืน error/fallback ที่อ่านได้ | B8-4 |
| เนื้อหาประวัติศาสตร์ไม่พอ | แสดง fence ที่ถูกต้อง, ไม่แต่ง fact ใหม่ | B8-4 + Team 1 |

### B8-5 — Data & Migration Engineer

รับผิดชอบฐานข้อมูลและการเปลี่ยน data shape ที่ย้อนตรวจได้ แม้ Local Save จะเป็นวิธีหลักในปัจจุบัน แต่ schema ฝั่ง server ต้องไม่ drift จาก TypeScript/Drizzle และไม่ใช้ migration เป็นที่ใส่ข้อมูลทดสอบ หน้าที่นี้รวมถึงอธิบาย dependency order, rollback limitation และการเปลี่ยนที่ต้องรับรองก่อน release

| ก่อน migration | ระหว่าง migration | หลัง migration |
|---|---|---|
| diff schema, ระบุ data loss risk, เขียน rollback note | รวม SQL ที่สัมพันธ์กัน, เรียง create ก่อน foreign key | verify schema/query, run targeted tests, บันทึก version |
| ระบุ Local Save migration ที่คู่กันเมื่อ persisted field เปลี่ยน | ห้าม seed test customer data | ยืนยันผู้เล่นเก่ายังอ่าน state สำคัญได้ |

### B8-6 — Asset Delivery & Runtime Engineer

หน้าที่คือทำให้ไฟล์ที่ได้รับอนุญาตส่งถึง browser ได้ทั้ง environment ที่กำหนด พร้อมที่มาและ path ที่ตรวจได้ ไฟล์ขนาดใหญ่เก็บใน static storage ที่โครงการจัดการและต้องมี manifest; source code ใช้ path จาก manifest เดียวแทน URL กระจัดกระจาย สำหรับ National Map ที่ผู้ใช้ต้องรันผ่าน VS Code ได้ โครงการเก็บสำเนา WebP ที่ลดขนาดแล้วใน `client/public/assets/dust-fire-national-map-clean.webp` และอ้างผ่าน `/assets/dust-fire-national-map-clean.webp` จึงต้องตรวจว่า Vite local ตอบ `200 image/webp` ทุกครั้งที่เปลี่ยน path หรือไฟล์

| ขั้นตอน | สิ่งที่ต้องบันทึก | เกณฑ์ผ่าน |
|---|---|---|
| รับ asset | ผู้อนุญาต, ขอบเขตสิทธิ์, ชื่อคงที่, type/size/hash เมื่อเหมาะสม | ไม่ใช้ asset ที่สิทธิ์ไม่ชัด |
| Upload | static storage key และ runtime path | URL/path ตอบสำเร็จจาก dev runtime |
| Integrate | source location และ alt text/accessibility | component test ตรวจ src; ไม่มี path ตาย |
| Release | manifest update และ visual review | desktop/mobile render สำเร็จ, ไม่เกิด broken image |

### B8-7 — Observability & Reliability Engineer

ทำให้บั๊กตามรอยได้โดยไม่เก็บ secret, credit token หรือข้อความส่วนตัวเกินจำเป็น Log ต้องบอก timestamp, route/action, request correlation, outcome class และ sanitized error เพื่อให้ Team 6 ทำซ้ำบั๊กได้ ส่วน health check และ performance baseline ต้องแยกว่าเป็น local, preview หรือ published runtime

| ระดับ | ตัวอย่าง | การตอบสนอง |
|---|---|---|
| S1 Stop-ship | เซฟหาย, ทุกคนเข้าเกมไม่ได้, data/secret leak | หยุด release, ส่งต่อ B8-1/B8-2/B8-7 ทันที |
| S2 High | AI fallback ใช้ไม่ได้, map/asset สำคัญไม่โหลด, admin role gate รั่ว | แก้ก่อน milestone ถัดไป, เพิ่ม regression |
| S3 Normal | ข้อความ error ไม่ชัด, log ขาด field, path asset บาง environment ไม่ตรง | บันทึก owner/deadline และแก้ในรอบงาน |
| S4 Improvement | refactor, dashboard, performance tuning | เข้าคิวหลังไม่กระทบ player flow |

## 4. งานรับ–ส่งกับทีมอื่น

| ทีม | Team 8 รับอะไร | Team 8 ส่งอะไรกลับ | ต้องมีผู้อนุมัติ |
|---|---|---|---|
| Team 1 Game Director | ขอบเขต, policy, historical/safety constraint | feasibility, risk, contract impact | Team 1 |
| Team 2 Game Design | สูตร, state transition ที่ต้องการ, reward/penalty intent | deterministic implementation plan, persistence effect | Team 2 + B8-1 |
| Team 3 Game Development | โมดูล/logic ที่ต้องเชื่อม server หรือ state | APIs, migration helpers, runtime contract | Team 3 + B8-2/B8-3 |
| Team 4 UI/UX Frontend | interaction, loading/error states, view data requirement | typed queries/mutations และ error/fallback shape | Team 4 + B8-3 |
| Team 5 Art & Audio | asset ที่อนุญาต, usage scope, display needs | manifest, storage path, cache/runtime evidence | Team 5 + B8-6 |
| Team 6 QA | reproduction, expected behavior, regression priority | logs, fixtures, health evidence, bug ownership | Team 6 + owner B8 |
| Team 7 Release & Operations | release window, monitoring needs, incident report | release checklist, rollback limit, runtime status | Team 7 + B8-1/B8-7 |

## 5. วงจรงานมาตรฐาน

| ช่วง | ผู้รับผิดชอบหลัก | คำถามบังคับก่อนผ่านไปช่วงถัดไป |
|---|---|---|
| Intake | B8-1 | เปลี่ยน state, contract, asset, secret หรือ database หรือไม่ |
| Design | B8-1 + เจ้าของเฉพาะด้าน | input/output/fallback/migration/test owner คือใคร |
| Build | B8-2 ถึง B8-6 | implementation รักษา canonical game rules และไม่ซ่อน side effect หรือไม่ |
| Verify | B8-7 + Team 6 | type check, relevant regression, local runtime และ failure path ผ่านหรือไม่ |
| Release | B8-1 + Team 7 | checkpoint, commit/push, rollback limit และ monitoring note ครบหรือไม่ |

## 6. Definition of Done ของ Team 8

งานหลังบ้านจะถือว่าเสร็จเมื่อทุกข้อที่เกี่ยวข้องผ่าน ไม่ใช่เพียงเมื่อหน้าจอ render ได้

| หมวด | หลักฐานขั้นต่ำ |
|---|---|
| Contract | TypeScript ผ่าน, input/output ถูก validate, error path มีเจ้าของ |
| State | transition deterministic, Local Save เก่าไม่พังหรือมี migration fixture |
| Security | secret อยู่ server-only, role/access error ตรวจแล้ว |
| Fallback | external dependency ล้มแล้วผู้เล่นยังเล่น/เซฟต่อได้ตาม policy |
| Assets | สิทธิ์ชัด, manifest/path ถูกต้อง, runtime ตอบสำเร็จ, alt text มี |
| QA/Operations | regression ผ่าน, visual/runtime evidence มี, checkpoint และ GitHub sync สำเร็จ |

## 7. ขอบเขตที่ Team 8 ไม่ทำเอง

Team 8 ไม่เปลี่ยนสูตร 2d12, DN, narrative tone, ข้อเท็จจริงทางประวัติศาสตร์ หรือ UI hierarchy โดยลำพัง หากการเปลี่ยน server contract ทำให้กติกาหรือสิ่งที่ผู้เล่นเห็นเปลี่ยน ต้องส่งให้ Team 1–4 อนุมัติตามเรื่อง และให้ Team 6 เขียน regression ก่อน merge

## References

1. `docs/dust-fire-core-game-source-of-truth-th.md` — กติกาและ state contract ที่ Team 8 ต้องรักษา.
2. `README.md` — runtime manifest, scripts และนโยบาย GitHub/checkpoint.
3. `docs/team-handbooks/00-document-set-index-th.md` — สัญญาการอ้างอิงร่วมและผู้ตัดสินข้อขัดแย้งข้ามทีม.

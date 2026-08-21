# คู่มือทีม 4: UI/UX Frontend — Dust & Fire: Sengoku Stories

## 1. พันธกิจของทีม

ทีม UI/UX Frontend ทำให้ผู้เล่นเห็น “สิ่งที่ควรตัดสินใจตอนนี้” ก่อนเห็น “ระบบทำงานอย่างไรทั้งหมด” หน้าที่ของทีมคือออกแบบ information architecture, layout, responsive behavior, interaction feedback, accessibility, language switching และ error/fallback states ให้ game loop เข้าใจง่ายโดยไม่ลดความหนักของเรื่อง

Dust & Fire ไม่ใช่ dashboard ทั่วไป UI ต้องรู้สึกเหมือน **Ledger of Ash**: สมุดบัญชีสงครามที่เปิดอ่านได้ มี spine, folio, leaf, margin note, ตราประทับ และรอยเส้นเอกสาร แต่ต้องไม่กลายเป็น card grid หรือ UI ที่ดูโบราณจนอ่านยาก ความงามมีหน้าที่บอกลำดับและความหมาย ไม่ใช่บังการตัดสินใจ

## 2. Player Information Architecture

โครงหลักแบ่งเป็น Story, Prepare, Chronicle และ More ผู้เล่นต้องเห็นว่า “ขณะนี้ฉันอยู่ในเรื่องอะไร” มากกว่าเห็นรายการ feature จำนวนมาก Campaign Command, Play Scene และ Missions อยู่ใน Story เพราะตอบคำถามเกี่ยวกับแรงกดดันปัจจุบัน; Character, Gear, Market, Services, Debts/Favors และ Agreements อยู่ใน Prepare; Campaign Library, Chronicle, World Archive อยู่ใน Chronicle; Save, Load, New Campaign และ Settings อยู่ใน More

| พื้นที่ | คำถามที่ผู้เล่นต้องตอบได้ | สิ่งที่ไม่ควรใส่เป็นแกน |
|---|---|---|
| Campaign Command | ตอนนี้เรื่องอยู่ที่ใด, อะไรกดดัน, จะกลับไปทำอะไร | dashboard metric จำนวนมาก |
| Play Scene | ฉันจะทำอะไรต่อ, ผลล่าสุดเปลี่ยนอะไร | การตั้งค่ายิบย่อยหรือ quest list ยาว |
| Missions | ใครรออะไร, เวลา/ราคา/รางวัลคืออะไร | ปุ่ม accept/complete ปลอม |
| Character | ตัวละครเป็นใคร, วิชาไหนโต, อะไรเป็นภาระ | combat stat ที่ไม่มีผลจริง |
| Market | ตอนนี้มีอะไร, ใช้ของอะไรได้, สัญญาใดค้าง | catalog commerce generic |
| Chronicle | โลกจำอะไร, Leaf ไหนเป็นผลของเรื่อง | duplicate prose หลายที่ |
| Save/Load | สถานะใดจะเก็บ/คืน | คำว่า Safekeeping ที่ทำให้สับสน |

## 3. Global Shell: Ledger Spine and Player Leaf

หน้า desktop ใช้ top bar, collapsible sidebar และ main leaf Sidebar คือ ledger spine ที่ย่อ/ขยายได้ตลอด มี identity, vitals, campaign navigation, recent world memory, language controls และ notice Top bar แสดงปี ฤดู ภูมิภาค Save Game และ language Main content ต้องมี `min-width: 0` และ responsive grid ที่ซ้อนก่อน overflow

การย่อ spine ต้องไม่ทำให้ผู้เล่นสูญ navigation; ใช้ไอคอนที่มี title/aria-label ชัดและ review-only query อาจใช้สร้างภาพ rail ย่อได้ แต่ห้ามเปลี่ยน default ของผู้เล่นจริง Responsive breakpoint ต้องคำนึง “พื้นที่ main leaf หลัง sidebar” ไม่ใช่ความกว้าง viewport อย่างเดียว

| Viewport | พฤติกรรมที่คาดหวัง |
|---|---|
| ≥ 1320px | Ledger spine เต็ม, campaign map/desk อยู่คู่กันเมื่อเนื้อหาพอ |
| 1181–1319px | Spine กระชับ, Story Desk ลด min width และข้อความ wrap |
| 761–1180px | Home ledger เปลี่ยนเป็น folio row, Story Desk ซ้อนใต้ map |
| ≤ 760px | Sidebar เป็น menu overlay, one-column leaf, CTA ไม่หลบ keyboard |

## 4. One-Question Rule and Primary CTA

ทุก viewport แรกควรตอบคำถามหลักหนึ่งข้อ หน้า Play ต้องตอบ “เจ้าจะทำอย่างไร” จึงมี CTA `Declare Intent / ประกาศเจตนา` ที่เลื่อนไปยัง composer ได้ หน้า Campaign Command ต้องตอบ “แรงกดดันอยู่ที่ใด” จึงมี map และ `Return to Scene` ไม่ใช่หลายปุ่มเท่า ๆ กัน หน้า Chronicle ต้องตอบ “เรื่องเปลี่ยนอะไร” จึงมี selected leaf และ ledger context ก่อน timeline ยาว

อย่าใช้ CTA หลักสองอันที่มีน้ำหนักเท่ากัน อย่าให้ปุ่ม destructive อยู่ใกล้ Save/Load โดยไม่มี confirmation และอย่าใช้ generic copy เช่น “Analyze →” เมื่อความหมายจริงคือ “Assess the risk” หรือ “Declare Intent”

## 5. Page-Level Acceptance Criteria

### 5.1 Campaign Command

Campaign Command ต้อง map-first แสดง current place, mission pressure, current Leaf/time, last roll และทางกลับสู่ Play โดยไม่เปลี่ยนเป็น analytics dashboard Map ไม่ต้องแกล้งเป็นภูมิศาสตร์จริง; ต้องมี label ว่า known routes และใช้ visual layer ของแคมเปญจริง Campaign Command ต้องไม่เกิด horizontal overflow เมื่อ rail เปิดหรือย่อบน viewport สำคัญ

### 5.2 Play Scene

Play ต้องเป็นพื้นที่บทละครใหญ่ใน viewport เดียว มี narrative surface, Skill Ledger ที่แสดง mastery/Step/XP/threshold, intent composer, roll animation ที่เคารพ `prefers-reduced-motion`, outcome panel ที่บอก axis/mastery/total/DN/result/XP/time/mission effect และร้อยแก้วต่อเนื่อง การทำ animation ต้องไม่ block Local Trial หรือ test environment และเมื่อเล่นจบผลต้องยังอยู่ในฉากเดียว ไม่ navigate กระโดด

### 5.3 Mission Dossier

Missions เป็น read-only dossier อธิบาย issuer, request, pressure, deadline, risk, reward และ status ไม่มีปุ่มรับงานหรือกด complete ถ้า mission ยังไม่ถูกผลทอยแตะ ต้องแสดงว่าอะไรคือสิ่งที่โลกกำลังรอ ไม่ใช่แสดง progress bar ปลอม

### 5.4 Chronicle

Chronicle มี library mode และ reader mode Library mode แสดง folio, calendar/Leaf, active thread, latest consequence, shelf และ selected leaf Reader mode เก็บ prose เป็นหลักและลดศัพท์ระบบ Timeline/search เป็นชั้นรอง ไม่ควรแข่งขันกับ selected leaf ใน viewport แรก

### 5.5 Market, Character, Save/Load

Market แบ่งตามคำถาม: carried gear, this market, services, debts/favors, agreements and consequences Character ต้องใช้ helper Step เดียวกับ Play ไม่ทำตารางโบนัสเอง Save/Load ต้องใช้คำชัดและบอกว่า local to this browser; Manual Save กับ Auto Save ต่างกันอย่างไรต้องอ่านได้ภายในหนึ่งย่อหน้า

## 6. Language and Typography

English เป็นชื่อหลักของ navigation และ Thai เป็นคำอธิบายรองที่สลับได้จริง ไม่ควรวางสองภาษาเต็มความยาวทุกบรรทัดจนเกิด noise English system labels ใช้ Poppins/command-like clarity; Thai UI ใช้ฟอนต์ที่อ่านได้ในขนาดเล็ก; Thai prose ใช้ serif ที่รองรับตัวอักษรและบรรทัดนำที่หายใจได้

| Layer | English | Thai | ตัวอย่าง |
|---|---|---|---|
| System action | สั้น ตรง เป็นกริยา | กระชับ มีน้ำหนัก | `Declare Intent` / `ประกาศเจตนา` |
| Status | บอกสถานะ ไม่ตัดสินผู้เล่น | ใช้คำเข้าใจง่าย | `Awaiting intent` / `รอเจตนาของเจ้า` |
| Narrative | กระชับมีภาพ | เลือก register ตามสถานะ | บทพูดผู้คุมต่างจากชาวบ้าน |
| Historical fence | ชัดว่า fact/fiction ระดับใด | ไม่อวดอ้าง | `Contextual play` / `ใช้บริบทประวัติศาสตร์กำกับ` |

## 7. Accessibility and Interaction Standards

ทุก interactive element ใช้ semantic button/link, มี visible focus, มี aria-label เมื่อใช้ไอคอน, keyboard reachable, ไม่ยึด hover เป็นช่องทางเดียว และไม่ซ่อนสถานะสำคัญด้วยสีเพียงอย่างเดียว Error message ต้องอธิบายสิ่งที่เกิดและทางไปต่อ เช่น AI unavailable → Local Trial is active; save corrupted → fresh demo prepared; admin denied → return to player ledger

motion ทุกแบบต้องเปลี่ยนได้ด้วย `prefers-reduced-motion` การทอยที่มี animation ต้องมี state ที่ deterministic ไม่ใช้ timeout เพื่อสร้าง outcome color contrast ของ navy/vermilion/ochre/teal บน paper ต้องผ่านการตรวจอ่าน ไม่เอา texture หนักจนลด legibility

## 8. Design Tokens and Asset Policy

palette หลักคือ paper/off-white, ink navy, dust vermilion, ochre และ teal สีไม่ได้มีไว้ตกแต่งอย่างเดียว: vermilion คือ oath/risk/primary consequence, teal คือ memory/fact/continuity, ochre คือ pressure/uncertainty, navy คือ text/structure Asset ต้องเป็นต้นฉบับหรือมีสิทธิ์ชัด ห้ามใช้ตราตระกูลจริงเป็น decoration ที่อ้างของแท้ และห้ามสร้างภาพคนจาก reference โดยไม่ผ่าน art policy

ก่อนเพิ่ม UI pattern ให้เลือก artifact language หนึ่งแบบ: folio, dossier, ledger row, margin note, seal, map layer หรือ reader leaf หลีกเลี่ยง card เท่ากันหลายใบ เงาหนัก และ website dashboard chrome ที่ทำให้เกมกลายเป็น SaaS

## 9. UI Implementation Workflow

ทุกงาน UI ต้องทำตามลำดับ: ระบุ player question → identify source GameState → วาง primary CTA → ทำ desktop/mobile layout → ทำ empty/loading/error/fallback → เพิ่ม unit/click flow test → screenshot viewport สำคัญ → บันทึก visual review → checkpoint

หากต้องสร้าง review screenshot ให้ใช้ route-to-screen manifest และ review seed ที่กำหนด เพื่อไม่ให้ heading, URL, state และชื่อภาพคนละชุด ระวังว่า screenshot full-page อาจซ่อน fixed chrome; ใช้ viewport capture เมื่อตรวจ sidebar, topbar หรือ CTA fixed

## 10. Definition of Done สำหรับทีม UI/UX Frontend

หน้าหนึ่งเสร็จเมื่อผู้เล่นรู้คำถามหลัก, CTA มีลำดับ, data มาจาก GameState จริง, ล้น/ตัด/ซ้อนใน viewport สำคัญไม่ได้, keyboard และ reduced motion รองรับ, error/fallback ซื่อสัตย์, language toggle ไม่ทำ layout พัง และ test/screenshot มีหลักฐาน หากหน้าสวยแต่ทำให้ผู้เล่นต้องเดาว่าจะทำอะไรต่อ ถือว่ายังไม่เสร็จ

## References

1. `client/src/pages/Home.tsx` — player shell, navigation, Local Save composition.
2. `client/src/features/play/PlayScene.tsx` — intent, roll, progression disclosure.
3. `client/src/features/story/StoryMap.tsx` — Campaign Command map-first surface.
4. `client/src/features/chronicle/ChronicleView.tsx` — library/reader and ledger context.
5. `client/src/index.css` — Ledger Spine, responsive shell, tokens.
6. `docs/dust-fire-lore-narrative-art-bible-th.md` — language and art direction.

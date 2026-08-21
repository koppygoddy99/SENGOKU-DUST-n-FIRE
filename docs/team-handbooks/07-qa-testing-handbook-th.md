# Dust & Fire: Sengoku Stories — คู่มือทีม QA and Testing

> สถานะ: คู่มือปฏิบัติงานเฉพาะทีม 6
>
> ผู้อ่านหลัก: QA Lead, Test Engineer, Automation Engineer, Accessibility Tester, Game Balance Analyst และผู้ร่วมทำ playtest
>
> เอกสารแม่: `01-shared-master-handbook-th.md`

## 1. พันธกิจของทีม

ทีม QA and Testing มีหน้าที่ปกป้องความน่าเชื่อถือของการเล่น ไม่ใช่เพียงนับจำนวน test ที่ผ่าน Dust & Fire เป็นเกมที่เรื่อง กติกา เวลา ความทรงจำ และ Local Save เดินอยู่ใน state เดียวกัน บั๊กหนึ่งจุดจึงอาจไม่ใช่แค่ปุ่มกดไม่ได้ แต่อาจทำให้ผู้เล่นได้ XP ซ้ำ อายุเพิ่มผิด กลับมาเล่นแล้วสูญเสียข้อตกลง หรือเข้าใจว่า AI ตัดสินผลทั้งที่ระบบใช้ Local Trial อยู่

คุณภาพของเกมวัดจากการที่ผู้เล่นสามารถประกาศเจตนาหนึ่งประโยค เข้าใจความเสี่ยง เห็นผลของ 2d12 อ่าน consequence ที่มีน้ำหนัก และกลับมาเล่นต่อจากแคมเปญเดิมได้โดยไม่ถูกหลอกหรือทำ state หาย QA ต้องทดสอบการเดินทางนี้เป็นเส้นเดียว ไม่แยก UI, engine, prose และ persistence ออกจากกันจนไม่เห็นผลกระทบจริง

> QA ไม่ใช่ด่านท้ายของงาน แต่เป็นเจ้าของหลักฐานว่ากติกา ประสบการณ์ และความต่อเนื่องทำงานร่วมกันได้ตามสัญญา

| หลักการ | ความหมายเชิง QA | ตัวอย่างความเสี่ยงที่ต้องจับ |
|---|---|---|
| State ก่อนภาพ | อย่ายอมรับว่าฟีเจอร์เสร็จเพียงเพราะ UI แสดงค่า | ผลทอยแสดง success แต่ mission/reward ไม่ถูกบันทึก |
| One sentence, one truth | ข้อความที่ผู้เล่นเห็นต้องตรงกับ engine/fallback | UI บอกว่า AI GM วิเคราะห์ ทั้งที่เป็น Local Trial |
| Save is gameplay | Local Save และ migration เป็นระบบเกม | save เก่าเปิดแล้ว XP/agreements หายหรือ crash |
| History is bounded | factual claim ต้องอยู่ใน Historical Fence | tooltip หรือ prose อ้างเหตุการณ์จริงโดยไม่มี source |
| Accessibility is playability | ผู้ใช้คีย์บอร์ดหรือ reduced motion ต้องเล่นวงจรหลักได้ | ผลทอยรู้ได้จาก animation หรือสีเท่านั้น |

## 2. แหล่งอ้างอิงและระดับการทดสอบ

QA ต้องอ่านเอกสารหลักสองฉบับก่อนเขียน test case ใหม่: `docs/dust-fire-core-game-source-of-truth-th.md` สำหรับ data invariant และ deterministic engine; `docs/dust-fire-lore-narrative-art-bible-th.md` สำหรับ prose, language register, Historical Fence และ art boundary เอกสารทีม Game Design กำหนดความตั้งใจของกติกา ส่วน Game Development กำหนด contract ของ implementation หากเอกสารขัดกัน ให้เปิด issue ประเภท **Specification Conflict** ไม่ตั้ง expectation เองเงียบ ๆ

| ระดับ | เป้าหมาย | เจ้าของหลัก | ตัวอย่าง |
|---|---|---|---|
| Unit | ตรวจฟังก์ชัน deterministic และ state transition แยกส่วน | Game Development, QA review | 2d12 total, margin band, XP cap, time mark |
| Integration | ตรวจโมดูลที่เปลี่ยน state ร่วมกัน | Game Development + QA | resolve roll → mission → agreement → Local Save |
| UI / component | ตรวจ interaction, labels, focus และ responsive contract | UI/UX + QA | Declare Intent, rail collapse, reader mode |
| End-to-end click flow | ตรวจเส้นทางผู้เล่นตั้งแต่ต้นจนจบ | QA | เปิดแคมเปญ → roll → save → reload → อ่าน Chronicle |
| Visual review | ตรวจ hierarchy, overflow และ state ที่มองเห็น | UI/UX + QA | Campaign Command rail เปิด/ย่อใน viewport เป้าหมาย |
| Narrative / historical | ตรวจ prose และ factual boundary | Game Director + QA | AI/Local Trial disclosure และ fact card |
| Release validation | ตรวจชุดจริงก่อนเผยแพร่ | QA + Release and Operations | build, test, migration, fallback, telemetry sanity |

## 3. กลยุทธ์การทดสอบตามความเสี่ยง

ไม่ได้ทุกฟีเจอร์มีความเสี่ยงเท่ากัน QA ต้องจัดลำดับตามความเสียหายต่อแคมเปญและความยากในการฟื้นคืน State mutation, Local Save, migration, reward และ AI fallback เป็นความเสี่ยงสูงสุด เพราะความผิดพลาดเกิดแล้วอาจติดอยู่กับผู้เล่นนาน UI decorative ที่ไม่เกี่ยวกับ interaction มีความเสี่ยงต่ำกว่า แต่ยังต้องตรวจหากทำให้ข้อความหลักอ่านไม่ได้หรือใช้ไม่ได้บน mobile

| ระดับความเสี่ยง | ตัวอย่าง | สิ่งที่ต้องมีอย่างน้อย | Release gate |
|---|---|---|---|
| P0 — data/continuity | Local Save, migration, XP, time, mission, reward | unit + integration + manual recovery exercise | ห้าม release เมื่อมี defect เปิด |
| P1 — core playability | roll flow, intent, result, CTA, Chronicle | integration + E2E/manual click flow + visual state | ต้องมี mitigation ที่ได้รับอนุมัติหากค้าง |
| P2 — clarity/accessibility | labels, keyboard, responsive rail, reduced motion | component test + viewport/accessibility review | release ได้เมื่อมี workaround ที่ไม่ทำให้การเล่นหลักพัง |
| P3 — polish | spacing, decorative asset, cue ที่ไม่สำคัญ | visual review และ ticket backlog | ไม่บล็อก release เว้นแต่มากจนกระทบอ่าน/contrast |

เมื่อฟีเจอร์เปลี่ยนสูตร, threshold, schema, Local Save, AI contract หรือ navigation flow ต้องทำ impact analysis ก่อนเริ่ม test ระบุ state ที่อ่าน/เขียน, save version ที่เสี่ยง, route ที่ใช้, viewport ที่ต้องดู, user group ที่ได้รับผล และ fallback ที่ต้องยืนยัน ไม่รับ test plan ที่เขียนเพียงว่า “ทดสอบให้ครบ” เพราะไม่สามารถพิสูจน์ได้ว่าครอบคลุมอะไร

## 4. Core state invariants

ส่วนนี้เป็น checklist ที่ห้าม regression ไม่ว่าทีมใดจะแก้ UI, prose หรือระบบภายใน QA ต้องเพิ่ม test อัตโนมัติเมื่อ invariant ยังไม่มี coverage และต้องเพิ่ม manual scenario สำหรับการเดินทางผ่าน UI สำคัญ

### 4.1 ผลทอยและ Momentum

สูตร canonical คือ `d12 + d12 + axis + mastery bonus + context bonus + momentum bonus` ผล roll ต้องถูกกำหนดโดย deterministic engine และ AI GM ไม่มีสิทธิ์แก้ total, margin หรือ outcome band Momentum ใช้ได้หลังเห็นผลเมื่อ state อนุญาต; ใช้สำเร็จแล้วต้องหักครั้งเดียว, resolve ใหม่ด้วยข้อมูลที่ตรวจได้, และไม่ถูกใช้ซ้ำจาก rerender, retry หรือการเปิดหน้าใหม่

| Invariant | วิธีตรวจ | ตัวอย่าง regression |
|---|---|---|
| ค่า d12 อยู่ในช่วง 1–12 ต่อหนึ่งลูก | unit/property-style test | seed หรือ mock สร้าง 0 หรือ 13 |
| total เท่ากับองค์ประกอบที่แสดง | unit + UI assertion | UI แสดง bonus แล้ว engine ไม่รวม |
| margin band ถูกต้องทุกขอบเขต | boundary table test | `-5` ถูกจัดเป็น partial แทน failure |
| AI ไม่แก้ deterministic outcome | contract/integration test | AI response ส่ง total ใหม่แล้ว state ถูกเขียนทับ |
| Momentum หักไม่เกินครั้งเดียว | integration/retry test | double click ใช้ Momentum สองแต้ม |
| outcome มีทางไปต่อ | narrative/UI review | failure แสดงข้อความจบเกมโดยไม่มี option หรือ consequence |

### 4.2 Step, XP และ Mastery Mark

Step มีช่วง 1–20, XP ติด skill ไม่ใช่เลเวลรวม, threshold สำหรับการได้ XP เพิ่มตามช่วง และ Step 20 ไม่รับ XP เพิ่มแต่สร้าง Mastery Mark ตามกติกา QA ต้องตรวจทั้งการคำนวณและข้อความที่อธิบายว่าทำไมงานนั้นให้หรือไม่ให้ XP ไม่เช่นนั้นผู้เล่นจะเข้าใจว่าเกมแจกค่าปลอมตามจำนวนครั้งที่กด

| Invariant | Acceptance expectation |
|---|---|
| XP ต่อ roll ไม่เกิน 2 | ไม่มีเส้นทาง input ใดเพิ่มเกินเพดานแม้มีหลาย tag |
| DN ต่ำกว่า threshold ไม่สร้าง XP สูงเกินจริง | แสดงเหตุผลชัดและ state ไม่เปลี่ยน |
| Step ไม่เกิน 20 | migration, import และ resolve ทั้งหมด clamp อย่างถูกต้อง |
| Step 20 ไม่เพิ่ม XP | ผลลัพธ์เปลี่ยนเป็น Mastery Mark/ผลเรื่องตาม contract |
| โบนัสตาม Step สอดคล้องทุกหน้า | Play, Character Dossier และ result ledger แสดงค่าเดียวกัน |
| skill ที่ไม่เกี่ยวไม่รับ XP | intent/tag mapping ไม่หลุดไปเพิ่มวิชาที่ไม่ใช่หัวใจของ action |

### 4.3 เวลา อายุ Leaf และ Mission

เวลาไม่เดินตามจำนวน roll อย่างตายตัว การตอบโต้ทันทีอาจไม่ใช้เวลา งานเดินทางหรือเตรียมการอาจสะสม time mark และ Leaf ใหม่เปิดเมื่อวันสะสมผ่านเงื่อนไขหลายวันเท่านั้น อายุเพิ่มเมื่อปฏิทินข้ามฤดูในปีถัดไป ไม่ใช่เมื่อ roll ครบจำนวนหนึ่ง QA ต้องทดสอบ boundary เหล่านี้พร้อม Chronicle เพื่อให้ผู้เล่นเห็นการเปลี่ยนที่ตรงกับ state

| Invariant | วิธีตรวจ |
|---|---|
| Roll ที่ไม่เดินเวลาไม่เปิด Leaf | ทำ consecutive action ที่เวลา 0 แล้ว assert Leaf id คงเดิม |
| Leaf เปิดหลังวันสะสมตามกติกา | simulation หลาย action พร้อมตรวจ Chronicle entry |
| อายุไม่เพิ่มตาม roll/Leaf | test ปีและฤดูตรง boundary เท่านั้น |
| Mission ไม่มีปุ่มรับ/ส่ง | UI audit และ E2E ตรวจว่าการ progress เกิดจาก action trigger |
| Reward ตรงฐานะผู้มอบ | data/state test สำหรับ villager, merchant, authority, temple context |
| Agreement เก็บคู่กรณี สิ่งเปลี่ยนมือ พยาน ผลต่อทางเลือก | integration test และ visual ledger review |

### 4.4 Local Save, Load และ migration

Local Save เป็น capability หลักของเกม ไม่ใช่ cache ที่หายได้ QA ต้องทดสอบทั้ง save ใหม่, overwrite, auto-save, Load, state serialization, schema version และ migration จากตัวอย่าง save เก่าที่ได้รับอนุมัติ ห้ามใช้ข้อมูลผู้เล่นจริงใน fixture หรือ log.

| สถานการณ์ | ผลที่คาดหวัง |
|---|---|
| เซฟใหม่หลัง roll | state ล่าสุด, Chronicle, XP, mission และ agreement กลับมาเหมือนเดิม |
| ปิด/เปิดหน้าและโหลด | ไม่มี duplication ของ reward, XP หรือ event |
| save เก่าขาดฟิลด์ใหม่ | migration เติม default ที่ปลอดภัยและไม่ crash |
| save เสียหาย/JSON อ่านไม่ได้ | แจ้งอย่างซื่อสัตย์, ไม่เขียนทับทันที, มีทางเลือกเริ่ม Local Trial/เก็บสำเนาเมื่อระบบรองรับ |
| quota หรือ write error | UI บอกว่าบันทึกไม่สำเร็จและไม่อ้างว่า auto-save แล้ว |
| เปลี่ยนแคมเปญ | ไม่มี state หรือ Chronicle จากแคมเปญอื่นปน |

## 5. Test design และเครื่องมือทดสอบ

### 5.1 หลักการเขียน automated test

test ต้องยืนยันพฤติกรรมที่ผู้เล่นและเอกสารสัญญาไว้ ไม่จับ implementation detail ชั่วคราว เช่น class name ที่กำลังเปลี่ยน ให้ตั้งชื่อ scenario ในรูปแบบ `given_when_then` หรือถ้อยคำที่อ่านแล้วรู้กติกา เช่น `opens_a_new_leaf_only_after_accumulated_multi_day_time` ไม่ใช่ `testThingWorks`.

fixture ของเกมต้อง deterministic ใช้ seed/review seed ที่ระบุชัด เพื่อให้ผลทอย, route และ visual state ทำซ้ำได้ ห้ามพึ่งเวลาเครื่องจริง provider จริง หรือ random ที่ไม่ถูกควบคุมใน test โดยไม่มีเหตุผล หากต้องทดสอบ AI ให้ mock contract ที่สะท้อน success, timeout, malformed response และ credits exhausted แล้วตรวจว่า deterministic/local path ยังรักษา state.

| ชนิด test | ข้อกำหนด |
|---|---|
| Unit | ทดสอบ pure function, boundary และ invariant; ไม่มี I/O หรือ time จริงโดยไม่จำเป็น |
| Integration | เริ่มจาก GameState จริงหรือ fixture versioned; assert state ก่อน/หลัง mutation |
| Component | ตรวจข้อความ accessible, action, error state และ props สำคัญ; ไม่ snapshot ทั้งหน้าจน brittle |
| E2E/manual | ใช้ campaign seed, route และขั้นตอนที่อ่านซ้ำได้; เก็บผล expected ใน test case |
| Visual | ระบุ viewport, rail state, route/query, expected hierarchy และข้อควรดู; ภาพไม่แทน assertion เชิง state |

### 5.2 Test data governance

ใช้ชื่อ NPC, campaign, agreement และ prose ที่เป็น original test fixture เท่านั้น อย่าใส่ข้อมูลส่วนบุคคล, token, save ของผู้เล่น, หรือตัวละครจากแหล่งลิขสิทธิ์ใน snapshot/log หลีกเลี่ยง fixture ที่ “สวยเกินจริง” จนไม่ครอบ edge cases; ต้องมี save เก่าที่ขาด field, input ไทย/อังกฤษยาว, intent ว่างหรือผิดรูป, resource ติดลบ, Step 20, มุม boundary ของ margin และ provider error.

## 6. Playtest และการตรวจความยาก

### 6.1 ความยากไม่ใช่เพียงอัตราชนะ

Dust & Fire ไม่ควรถูกปรับให้ทุก roll สำเร็จ และไม่ควรทำให้ failure ปิดเรื่อง QA ต้องตรวจการกระจาย outcome ประกอบกับคุณภาพของทางเลือกหลังผล ตัวเลข success ที่ “สวย” แต่ผู้เล่นไม่เห็นว่าทำไมแพ้หรือไม่มีวิธีไปต่อ คือ defect ของการออกแบบหรือการนำเสนอ ไม่ใช่แค่ปัญหาการบาลานซ์

การทดสอบความยากต้องใช้ scenario ที่ Game Design ระบุ axis, mastery, context, DN, stakes, time cost และ expected narrative consequence อย่าปรับ DN จากความรู้สึกหลัง roll ไม่กี่ครั้ง ให้รายงาน distribution พร้อม sample size, seed/fixture, ข้อจำกัด และ interpretation ที่แยก “ข้อมูล” ออกจาก “ข้อเสนอ”.

| ตัวชี้วัด | คำถามที่ต้องตอบ | สัญญาณเสี่ยง |
|---|---|---|
| Outcome distribution | scenario ระดับ DN เดียวกันให้ decisive/success/partial/failure เท่าใด | สัดส่วน extreme สูงผิดคาดหรือไม่เปลี่ยนเมื่อ bonus เปลี่ยน |
| XP velocity | กี่ action ที่มีน้ำหนักจึงได้ Step ในแต่ละช่วง | ฟาร์ม action ง่ายแล้วไต่ช่วงสูงได้เร็วเกิน |
| Mission latency | mission ตอบสนองหลัง action ที่เกี่ยวกี่ครั้ง/กี่วัน | progress ล่องหนนานจนผู้เล่นคิดว่าเกมไม่จำ action |
| Resource pressure | เสบียง เครดิต หนี้ และเวลาให้ทางเลือกจริงหรือไม่ | resource เป็นข้อความตกแต่ง ไม่เคยเปลี่ยนการตัดสินใจ |
| Failure recovery | หลัง failure ผู้เล่นยังมีทางเดินที่เข้าใจได้หรือไม่ | dead end, state ขัดแย้ง, หรือ prose สั่งให้เริ่มใหม่ |
| Agency clarity | ผู้เล่นรู้หรือไม่ว่าอะไรเป็นผลจาก intent ของตน | AI prose ลอยจนแยกเหตุและผลไม่ได้ |

### 6.2 รูปแบบ session playtest

ก่อน session ให้กำหนดเป้าหมายเดียวหรือสองข้อ เช่น “ผู้เล่นเข้าใจว่า mission เดินเองหรือไม่” หรือ “Local Trial disclosure ทำให้ไว้วางใจหรือไม่” อย่าถามความเห็นกว้าง ๆ โดยไม่มีเป้าหมาย QA เก็บสิ่งที่ผู้เล่นทำ/พูด, จุดที่หยุด, ความเข้าใจที่อธิบายกลับได้, และ defect ที่เกิด โดยต้องขอความยินยอมตามนโยบาย privacy ก่อนบันทึกเสียง/ภาพใด ๆ

หลัง session ให้แยก observation, reproduction, hypothesis และ recommendation ไม่ยกระดับประโยคของผู้เล่นหนึ่งคนเป็นข้อเท็จจริงทั่วไป และไม่แก้ difficulty ทันทีจากเหตุการณ์ที่อาจเกิดจาก UI บกพร่องหรือ test setup.

## 7. Visual, responsive และ accessibility review

### 7.1 Visual regression

QA ต้องเก็บ visual review ตาม route manifest และ deterministic query/seed ที่ทีมกำหนด ทุกครั้งที่แก้ layout ของ shell, Story Map, Play Scene, Chronicle, Market, Character, Save/Load หรือ Admin ให้ตรวจ state สำคัญ ไม่ใช่เพียงหน้า default ที่ว่าง เช่น rail เปิด/ย่อ, narrative ยาว, result หลัง roll, mission ที่กำลังค้าง, agreement จำนวนมาก และ save error.

ภาพ screenshot เป็นหลักฐานประกอบ ไม่ใช่ค่าวัดแทนการใช้งานจริง QA ต้องอ่านสิ่งที่ภาพควรพิสูจน์ เช่น “ไม่มี horizontal overflow ที่ Campaign Command ใน 1024 px” และต้องมี DOM/CSS contract test หรือการวัดที่เหมาะสมเมื่อเป็น defect เกี่ยวกับ overflow.

| หน้าหลัก | State ที่ต้องเห็น | สิ่งต้องตรวจ |
|---|---|---|
| Campaign Command | rail เปิดและ collapsed | map ไม่ถูกบีบ, ไม่มี overflow, CTA ยังเข้าถึงได้ |
| Play Scene | ก่อน roll, หลัง roll, Local Trial | intent focus, dice/result order, prose อ่านได้, disclosure ชัด |
| Chronicle | Leaf หลายรายการ, Reader Mode | folio, latest consequence, การออกจาก reader mode |
| Market / Character | resource/Step state ต่างกัน | ค่าไม่ขัดกับ state หลัก, label อ่านง่าย |
| Save / Load | save มี/ไม่มี/เสีย | ทางเลือกชัด, ไม่มีการยืนยันปลอม |
| Admin Console | ไม่มีสิทธิ์/มีสิทธิ์ | role guard, ไม่มีข้อมูลเกินขอบเขต, navigation กลับได้ |

### 7.2 Browser และ device matrix

matrix เป็นตัวอย่างขั้นต่ำ ทีม Release and Operations ต้องปรับตาม telemetry หลังเปิดจริง แต่ QA ห้ามยืนยันว่า “รองรับทุกเบราว์เซอร์” หากไม่ได้ทดสอบ เวอร์ชันเบราว์เซอร์ต้องบันทึกพร้อมผลทดสอบทุกครั้งใน release evidence.

| กลุ่ม | เป้าหมายการทดสอบ | ความเสี่ยงเฉพาะ |
|---|---|---|
| Chromium desktop ปัจจุบัน | flow หลัก, Local Save, keyboard, visual | layout wide, local storage, devtools zoom |
| Firefox desktop ปัจจุบัน | core flow และ typography | font rendering, storage behavior, focus |
| Safari desktop ปัจจุบันเมื่อเข้าถึงได้ | core flow และ mobile-like constraints | audio policy, storage/viewport differences |
| Chrome Android ปัจจุบัน | touch, rail, input, soft keyboard | viewport height, tap target, composer obscured |
| Safari iOS ปัจจุบัน | touch, Local Save, safe area | virtual keyboard, autoplay, storage eviction behavior |
| Reduced motion | roll, Leaf, drawer, result | information ไม่หายเมื่อ motion ถูกลด |
| Keyboard only | route สำคัญและ dialogs | focus order, visible focus, escape route |
| Screen reader spot check | labels, live result, errors | icon-only control, dynamic update ที่ไม่ถูกประกาศ |

### 7.3 Accessibility acceptance

การเล่นหลักต้องทำได้โดย keyboard: เปิด menu, ย่อ/ขยาย rail, เลือกหน้า, focus intent composer, confirm roll, อ่านผล, เปิด/ปิด reader mode และ Save/Load Dynamic result ต้องสื่อผ่าน semantic heading, text และ focus/live region ที่เหมาะ ไม่ให้ screen reader อ่านทุก token ซ้ำจนรบกวน.

color ต้องไม่ใช่ช่องทางเดียวของ outcome หรือ severity: `Success with cost` ต้องมีข้อความและ icon/label, ไม่ใช่ teal/vemilion เท่านั้น Error ต้องบอกสิ่งที่เกิด ผลกระทบ และขั้นตอนถัดไป เช่น “บันทึกในเครื่องไม่สำเร็จ; แคมเปญในหน้านี้ยังเปิดอยู่ โปรดคัดลอกข้อความสำคัญก่อนปิดหน้า” ไม่ใช่ “Error 500”.

## 8. ระบบรายงานบั๊ก

### 8.1 หลักการรายงาน

รายงานบั๊กต้องทำให้คนที่ไม่ได้เห็นปัญหาสามารถทำซ้ำ ตัดสินความสำคัญ และตรวจว่าการแก้ไม่สร้าง regression ได้ หลีกเลี่ยงคำว่า “มันพัง” หรือ “ดูแปลก” โดยไม่ระบุ expected/actual, state, seed, browser และหลักฐาน หากเป็น issue เชิง story/history ให้แยก factual claim ที่ผิด ออกจากความไม่ชอบเชิงโทน เพื่อให้เจ้าของงานตอบได้ถูกประเภท.

### 8.2 Bug report template

```markdown
## Summary
คำอธิบายสั้นที่บอก feature และผลกระทบ

## Environment
- Build/version:
- Browser + version:
- Device / viewport:
- Route/query/review seed:
- Save fixture/version:
- Audio/reduced-motion/language settings:

## Preconditions
state ที่ต้องมี เช่น Step, mission, Local Trial, save เก่า

## Steps to reproduce
1. ...
2. ...
3. ...

## Expected result
อ้างถึงเอกสาร/contract ที่เกี่ยวข้องถ้ามี

## Actual result
สิ่งที่เกิดจริง พร้อมข้อความ/ค่า state ที่เห็น

## Impact and severity proposal
P0/P1/P2/P3 พร้อมเหตุผลต่อ data, playability, accessibility หรือ trust

## Evidence
screenshot/video/log sanitized/test output และเวลาเกิดเหตุ

## Notes
repro rate, workaround, suspected regression range (ถ้ารู้)
```

### 8.3 นิยาม severity และ priority

Severity คือความร้ายแรงของผลต่อผู้เล่น ส่วน priority คือความเร่งด่วนในการแก้ก่อนงานอื่น สองค่าต้องไม่ถูกใช้แทนกัน P0 data loss อาจมี priority สูงสุดแม้เกิดไม่บ่อย; spacing issue อาจ priority สูงถ้าทำให้ release screenshot/CTA อ่านไม่ได้ แต่ severity ไม่เท่า P0.

| Severity | เกณฑ์ | ตัวอย่าง |
|---|---|---|
| P0 / Blocker | state สูญหาย/เสียหาย, security/privacy risk, เกมเล่นต่อไม่ได้ใน flow หลัก | Load เขียนทับ save เสีย, XP/reward duplication, role guard รั่ว |
| P1 / Critical | feature หลักทำงานผิดหรือผู้เล่นถูกหลอกเรื่องผล/เครดิต | outcome ไม่ตรง engine, fallback หักเครดิต, roll CTA ใช้ไม่ได้ |
| P2 / Major | workflow สำคัญมีทางเลี่ยงยาก หรือ accessibility หลักพัง | keyboard ไป intent ไม่ได้, mobile composer ถูกบัง, Chronicle เปิดไม่ได้ |
| P3 / Minor | ความชัด/ความงามผิดแต่ไม่ปิด flow | spacing, icon label รอง, cue เบาเกิน |

## 9. การ triage และการปิดบั๊ก

QA triage ร่วมกับเจ้าของระบบอย่างน้อยวันละครั้งระหว่าง release candidate สำหรับ P0/P1 ให้ตั้ง incident owner, reproduction owner, decision deadline และ regression scope ทันที อย่าปิดบั๊กเพราะ “แก้โค้ดแล้ว” ต้องมีหลักฐาน retest บน environment ที่เกิด และ test ใหม่หรือ test ที่อัปเดตเพื่อกันย้อนกลับ.

การปิดบั๊กต้องตรวจ side effect ที่คาดได้ เช่น แก้ migration ต้องตรวจ save version เก่า; แก้ bonus preview ต้องตรวจ roll total; แก้ rail CSS ต้องตรวจทุก review route ที่ใช้ shell; แก้ prose/fallback ต้องตรวจ language state และ disclosure ไม่ให้ขัดกัน

| สถานะ | ความหมาย | ผู้รับผิดชอบถัดไป |
|---|---|---|
| New | QA บันทึกข้อมูลขั้นต่ำครบ | QA triage |
| Needs info | ทำซ้ำไม่ได้หรือหลักฐานไม่พอ | ผู้รายงาน/QA เติมรายละเอียด |
| Confirmed | ยืนยัน expected/actual และ severity | เจ้าของ feature |
| In progress | มี owner และแผนแก้ | ทีมเจ้าของระบบ |
| Ready for QA | มี build/commit/test reference | QA retest |
| Verified | ผ่าน repro เดิมและ regression scope | QA ปิดพร้อมหลักฐาน |
| Deferred / Won't fix | ตัดสินโดย product owner พร้อมเหตุผล | Game Director/Release เก็บเป็น debt |

## 10. Release regression checklist

ก่อน release ทุกครั้ง QA ต้องยืนยันหลักฐาน ไม่ยึดจากคำบอกเล่าว่า “น่าจะผ่าน” Checklist นี้เป็นขั้นต่ำ; release scope ที่เปลี่ยน data/AI/UI ต้องเพิ่มรายการตาม impact analysis.

- [ ] TypeScript check และ automated test suite ผ่านใน revision ที่จะ release
- [ ] Core invariant: roll, margin, Momentum, XP, Step 20, time/age/Leaf, mission, agreement ผ่าน test ที่เกี่ยวข้อง
- [ ] Local Save new/load/autosave และ migration fixture สำคัญผ่าน
- [ ] AI GM success, timeout/error และ Local Trial fallback แสดงความจริง ไม่หักเครดิตผิด และเล่นต่อได้
- [ ] Visual route manifest ครบตามหน้าที่เปลี่ยน ทั้ง rail เปิด/ย่อและ viewport เป้าหมาย
- [ ] Keyboard, focus, reduced motion และ error state ใน flow ที่เปลี่ยนผ่าน spot check
- [ ] Browser/device matrix ที่ตกลงสำหรับ release ผ่านหรือมี known issue/mitigation ที่อนุมัติแล้ว
- [ ] ไม่มี P0/P1 เปิด; P2/P3 ที่ค้างมี owner, workaround และ release note ตามจำเป็น
- [ ] ไม่มี test fixture, screenshot หรือ log ที่มีข้อมูลผู้เล่น/secret/PII
- [ ] QA sign-off ระบุ build, เวลา, scope, known risk และ rollback/recovery note

## 11. Definition of Done ของทีม QA and Testing

การทดสอบเสร็จไม่ใช่เมื่อคำว่า “pass” ปรากฏใน CI แต่เมื่อมีหลักฐานว่าสิ่งที่เปลี่ยนไม่ทำให้คำมั่นหลักของเกมพัง: ผู้เล่นเข้าใจสิ่งที่เลือก, engine ยุติธรรมและตรวจได้, โลกจำผลอย่างต่อเนื่อง, fallback ไม่หลอก, และรูปแบบการเล่นเข้าถึงได้จริง QA ต้องส่งต่อความเสี่ยงที่ยังเหลือให้ Release and Operations อย่างโปร่งใส ไม่เปลี่ยน defect เป็น “expected behavior” เพียงเพื่อให้ release ผ่าน.

## References

1. `docs/team-handbooks/01-shared-master-handbook-th.md` — play loop, state promises, Definition of Done ร่วม
2. `docs/team-handbooks/03-game-design-handbook-th.md` — กติกา, DN, Step/XP, mission และ balance intent
3. `docs/team-handbooks/04-game-development-handbook-th.md` — architecture, contracts, migration และ Local Save
4. `docs/team-handbooks/05-uiux-frontend-handbook-th.md` — routes, responsive, component and accessibility acceptance
5. `docs/team-handbooks/06-art-audio-handbook-th.md` — visual/audio accessibility และ asset acceptance
6. `docs/team-handbooks/08-release-operations-handbook-th.md` — release gate, observability, privacy และ incident response

# Dust & Fire: Sengoku Stories — คู่มือทีม Release and Operations

> สถานะ: คู่มือปฏิบัติงานเฉพาะทีม 7
>
> ผู้อ่านหลัก: Release Manager, Operations Engineer, Product Operations, Support Owner, Analytics Owner, Incident Commander และผู้ดูแล Admin Console
>
> เอกสารแม่: `01-shared-master-handbook-th.md`

## 1. พันธกิจของทีม

ทีม Release and Operations รับผิดชอบให้เกมที่ผ่านการพัฒนาและ QA ไปถึงผู้เล่นอย่างซื่อสัตย์ เสถียร และฟื้นคืนได้เมื่อมีปัญหา ความสำเร็จของทีมไม่ได้วัดจากการปล่อย build ให้เร็วที่สุด แต่จากการทำให้ผู้เล่นยังเล่นต่อได้เมื่อ AI ช้า เมื่อ Local Save ผิดพลาด เมื่อมี bug ใน state หรือเมื่อระบบสังเกตพบสัญญาณว่าผู้เล่นกำลังสูญเสียความต่อเนื่องของแคมเปญ

Dust & Fire ใช้ Local Save เป็นหลัก และมี AI GM ที่อาจเกิด timeout, provider error หรือข้อจำกัดเครดิต ดังนั้นการปฏิบัติการต้องถือว่า **Local Trial** เป็น capability ของผลิตภัณฑ์ ไม่ใช่สภาวะล้มเหลวที่ต้องปิดบัง หาก AI ใช้ไม่ได้ ระบบต้องไม่สร้างความรู้สึกว่าผู้เล่นทำผิด, ไม่หักเครดิตอย่างไม่ถูกต้อง และไม่หยุดวงจรเรื่องที่ deterministic engine ทำต่อได้

> เป้าหมายการปฏิบัติการคือ “เล่นต่อได้อย่างมีข้อมูล” ไม่ใช่ “ไม่มี error ให้เห็น” ข้อความที่ตรงไปตรงมา การฟื้นคืนที่ปลอดภัย และหลักฐานที่ตรวจได้มีค่ากว่าหน้าจอที่ดูนิ่งแต่ทำข้อมูลหาย

| คำมั่นปฏิบัติการ | คำแปลในผลิตภัณฑ์ | สิ่งที่ไม่ยอมรับ |
|---|---|---|
| Continuity first | save, engine และ Local Trial มีทางเล่นต่อ | ปิด flow เพราะ provider ภายนอกช้า |
| Truthful degradation | บอกว่าเกิด fallback อะไรและผลกระทบใด | แสดงว่า AI สำเร็จทั้งที่ใช้ fallback |
| Safe release | ปล่อยเมื่อมีหลักฐาน test/migration/recovery | release จากเครื่องส่วนตัวโดยไม่มี checklist |
| Privacy by restraint | เก็บเท่าที่จำเป็นและแยก PII จาก telemetry | ส่ง prose/save/intent ดิบเข้าระบบ log โดยไร้เหตุ |
| Learn without surveillance | ใช้ข้อมูลเพื่อดูสุขภาพและ friction | สร้าง profile ของผู้เล่นจากเรื่องส่วนตัวโดยไม่จำเป็น |

## 2. ขอบเขต ระบบ และความรับผิดชอบ

ทีมนี้ทำงานร่วมกับทุกทีม แต่ไม่แก้กติกา เกมเพลย์ หรืองานศิลป์เองโดยไม่ผ่านเจ้าของ domain หน้าที่หลักคือเปลี่ยน “งานที่เสร็จใน repository” เป็น “รุ่นที่เปิดใช้ได้อย่างเข้าใจความเสี่ยง” โดยคุม release evidence, monitoring, incident process, privacy, support playbook และสภาพแวดล้อมการทำงาน

| ขอบเขต | Release and Operations เป็นเจ้าของ | ต้องร่วมตัดสินกับ |
|---|---|---|
| Release readiness | version, checklist, changelog, go/no-go, rollback decision | QA, Game Development, Game Director |
| Runtime health | error rates, latency, provider/fallback health, asset delivery | Game Development, QA |
| Data continuity | save failure monitoring, migration rollout, recovery message | Game Development, UI/UX, QA |
| Privacy/analytics | event taxonomy, retention, redaction, access | Game Director, Game Development, legal/privacy owner เมื่อมี |
| Incident response | severity, communication, roles, post-incident review | ทุกทีมที่ได้รับผลกระทบ |
| Admin operations | role access, audit/review surfaces, operational documentation | Game Development, product owner |

Admin Console เป็นพื้นที่ผู้ดูแลแอป ไม่ใช่เครื่องมือแอบดูเรื่องของผู้เล่น ข้อมูลที่เห็นต้องอยู่ตามขอบเขต role, มีเหตุผลเชิงปฏิบัติการ, มี audit trail และไม่เปิด Local Save/intent ดิบของผู้เล่นเป็นค่าเริ่มต้น การขอข้อมูลระดับแคมเปญเพื่อแก้ incident ต้องใช้หลัก least privilege และบันทึกเหตุผล/ผู้เข้าถึงตามนโยบายที่ทีมกำหนด

## 3. โมเดลความน่าเชื่อถือของระบบ

การประเมินความน่าเชื่อถือของ Dust & Fire แบ่งเป็นสี่เสา: **ความถูกต้องของ state**, **ความพร้อมของ flow หลัก**, **ความซื่อสัตย์ของข้อความ**, และ **ความสามารถในการสังเกต/ฟื้นคืน** ไม่มีเสาใดแทนกันได้ หน้าเว็บตอบ 200 ไม่ได้หมายความว่า roll ถูก, provider ทำงานไม่ได้แปลว่าเกมต้องหยุด, และ telemetry มากไม่ชดเชยการเก็บข้อมูลเกินจำเป็น

| เสา | คำถามปฏิบัติการ | ตัวชี้วัด/หลักฐานตัวอย่าง |
|---|---|---|
| State integrity | save, XP, mission, time และ agreement ถูกเขียน/โหลดหรือไม่ | migration test, save failure count, invariant regression |
| Flow availability | ผู้เล่นเปิดแคมเปญ ประกาศ intent และเล่นต่อได้หรือไม่ | route error, action completion, Local Trial availability |
| Trustful communication | UI บอกความจริงเรื่อง AI, credit, save และ error หรือไม่ | fallback disclosure audit, support reports, QA evidence |
| Observability/recovery | ทีมรู้ปัญหาเร็วพอและลดผลกระทบได้หรือไม่ | alert quality, incident timeline, rollback/recovery drill |

### 3.1 Service objectives ภายใน

ก่อนมีข้อมูลการใช้งานจริง ทีมต้องใช้เป้าหมายเป็น operating hypothesis ไม่โฆษณาเป็น SLA ภายนอก ตัวเลขที่ตัดสินใจได้จริงต้องมาจาก telemetry ที่นิยามแล้วและ review เป็นรอบ ตัวอย่างด้านล่างเป็นกรอบตั้งต้นเพื่อให้ทีมเห็นว่าอะไรควรสังเกต ไม่ใช่คำรับประกันให้ผู้เล่น

| พื้นที่ | เป้าหมายเชิงปฏิบัติการ | การลดผลกระทบเมื่อพลาด |
|---|---|---|
| หน้าเล่น/Local engine | input และ deterministic roll ตอบสนองโดยไม่รอ AI | เปลี่ยนไป Local Trial และเก็บ event แบบไม่ระบุตัวตน |
| AI analysis/resolve | latency อยู่ในเวลาที่ UI สื่อสารได้อย่างสุจริต | timeout ที่ชัด, cancel/retry ตาม contract, fallback เล่นต่อ |
| Local Save | เขียน/อ่านสำเร็จและรายงานความล้มเหลว | ไม่อ้างว่า saved, เก็บ in-memory state, ให้ recovery guidance |
| Asset/UI delivery | หน้าเริ่มอ่าน/เล่นก่อน asset รอง | defer noncritical asset, ใช้ style fallback ไม่ทำ layout พัง |
| Admin oversight | role check และข้อมูลเชิงสุขภาพเข้าถึงได้ | ปิด write action ที่ไม่จำเป็น, audit permission failure |

## 4. Performance engineering

### 4.1 หลักการวัด

Performance ต้องวัดจากสิ่งที่ผู้เล่นรู้สึก: เปิดหน้าแล้วอ่านสถานะได้, focus intent composer ได้, รับผล deterministic ได้ และบันทึกต่อเนื่องได้ ไม่ใช่ดูเฉพาะ bundle size หรือค่าเฉลี่ย latency ที่กลบ tail latency ให้เก็บและดู percentile/การกระจายตามอุปกรณ์และเครือข่ายเท่าที่สอดคล้องกับ privacy policy.

ให้แยก latency เป็นช่วง: UI input, deterministic compute, Local Save write, AI request, prose render และ asset/audio load เพื่อไม่โยนทุกความช้าให้ “AI ช้า” โดยไม่มีข้อมูล หาก AI สร้าง prose ช้า แต่ local resolution พร้อม ระบบต้องสื่อว่าผลกติกาพร้อมแล้วและผู้เล่นสามารถดำเนินต่อใน Local Trial ตาม contract ไม่บล็อก interaction ไว้หลัง spinner ไม่มีกำหนด.

| สัญญาณ | การตีความ | การตอบสนองเบื้องต้น |
|---|---|---|
| Intent confirm ช้า | main-thread/UI or validation pressure | ตรวจ long task, component rerender, input composition |
| Roll result ช้า | engine/state mutation หรือ UI transition | แยก compute จาก animation, ตรวจ duplicate mutation |
| Save write ล้มเหลว | quota, serialization, browser policy หรือ schema | อย่า auto-overwrite; แจ้งผู้เล่น; เก็บ context ที่ปลอดภัย |
| AI timeout เพิ่ม | provider/network/contract issue | open fallback path, monitor error class, rate-limit/retry ตาม policy |
| Chronicle/Map หนัก | render list/asset/layout | virtualization/lazy strategy โดยไม่เปลี่ยน state semantics |
| Mobile layout jank | viewport, font, asset หรือ rail behavior | ทดสอบ device matrix และตรวจ layout shift/focus |

### 4.2 งบประมาณประสิทธิภาพ

ทีมต้องกำหนดและทบทวน performance budget ตาม release ไม่ตั้งตัวเลขตายตัวในเอกสารโดยไม่มี baseline งบประมาณอย่างน้อยต้องครอบคลุม JavaScript/CSS ที่จำเป็นต่อหน้าเล่น, asset ที่ขวาง LCP, จำนวน request ใน flow เปิดแคมเปญ, เวลาจากกด `Declare Intent` ถึง deterministic result และขนาด Local Save ที่เริ่มเสี่ยง quota.

เมื่อ budget ถูกละเมิด ต้องบันทึกเป็น release risk พร้อม owner และ mitigation; ห้าม “แก้” ด้วยการตัดข้อความ disclosure, ลด accessibility หรือปิด error reporting การตัด asset decorative, defer module ที่ไม่ใช่ flow หลัก, หรือทำให้ data selector มีประสิทธิภาพขึ้นคือแนวทางที่เหมาะกว่า.

## 5. Release management

### 5.1 รุ่นและขอบเขตการเปลี่ยน

ทุก release ต้องมี version identifier, commit/revision ที่ตรวจได้, owner, scope, compatibility statement ของ Local Save, รายการ feature/bug fix, known issue และ recovery/rollback plan ไม่ว่าการเปลี่ยนจะเล็กเพียง CSS ก็ตาม หากกระทบ Player Shell, Local Save, migration, AI fallback, roll engine, XP/time หรือ role guard ต้องยกระดับเป็น change ที่มี impact analysis.

| ประเภทการเปลี่ยน | ตัวอย่าง | หลักฐานเพิ่มก่อน release |
|---|---|---|
| Content/config low-risk | ข้อความ UI ที่ไม่เปลี่ยน state, asset รอง | visual/language review และ smoke test |
| UI interaction | CTA, rail, responsive, focus behavior | viewport/keyboard regression และ route review |
| Rule/state | Trait/Mastery Progress, DN, time, mission/reward | unit + integration + migration/fixture analysis |
| Persistence/schema | Local Save format, migration, retention | backward compatibility, corruption/recovery exercise |
| AI/provider contract | prompt schema, timeout, credit handling | contract/error/fallback tests และ disclosure review |
| Auth/admin | role gate, audit surface, permissions | authorization test, privacy review, manual access check |

### 5.2 Release checklist

release manager ต้องถือ checklist นี้เป็นเอกสารลงนาม ไม่ใช่รายการที่ติ๊กย้อนหลัง หากข้อใดใช้ไม่ได้ ต้องมี waiver ที่ระบุเหตุผล owner วันทบทวน และ risk acceptance จากผู้มีอำนาจตัดสินใจ.

#### ก่อนสร้าง candidate

- [ ] Scope ถูก freeze หรือมีรายการ change หลัง freeze ที่บันทึกชัด
- [ ] Impact analysis ครอบคลุม state, save version, route, AI/fallback, analytics และ privacy
- [ ] TypeScript, lint/format ตามระบบโครงการ และ automated test ที่เกี่ยวข้องผ่าน
- [ ] QA มี test plan และ deterministic review seeds สำหรับการเปลี่ยนที่มองเห็น
- [ ] Static asset มีที่มา/สิทธิ์และไม่ฝัง binary ขนาดใหญ่ใน project runtime

#### ก่อน go/no-go

- [ ] QA sign-off สำหรับ core regression, Local Save, migration และ browser/accessibility scope
- [ ] Visual review ทุกหน้าที่เปลี่ยนใน desktop/mobile/rail state ที่เกี่ยวข้อง
- [ ] AI success/error/timeout/credits exhausted ทดสอบ และ Local Trial เล่นต่อได้จริง
- [ ] Telemetry และ alert สำหรับความเสี่ยงใหม่ถูก deploy โดยไม่เก็บ PII เกินจำเป็น
- [ ] ไม่มี P0/P1 เปิด; known issue อื่นมี severity, owner และ player/support wording
- [ ] Rollback หรือ mitigation ที่ใช้งานได้ถูกทดสอบตามประเภท change
- [ ] Release note เขียนสิ่งที่ผู้เล่นสังเกตได้ โดยไม่อ้างความสามารถเกินจริง

#### หลัง release

- [ ] ตรวจ smoke flow: เปิด → intent → roll → result → save → reload → Chronicle
- [ ] ตรวจ health/error/fallback dashboard ในช่วงเฝ้าดูแรก
- [ ] ตรวจ feedback/support channel และ triage anomaly ที่พบ
- [ ] บันทึกผล go-live, known issue และ follow-up owner
- [ ] ปิด release เมื่อ metrics/incident window ผ่านตามเกณฑ์ที่ทีมตั้ง ไม่ใช่เพียง deploy สำเร็จ

### 5.3 Rollback และ forward fix

การ rollback เป็นเครื่องมือปกป้องผู้เล่น ไม่ใช่สัญลักษณ์ความล้มเหลว แต่อย่าทำ rollback แบบทำลาย Local Save โดยไม่เข้าใจ compatibility หาก schema/save migration ไม่สามารถย้อนกลับได้ ให้เลือก forward fix, feature flag/fallback หรือ communication ที่ชัดเจนตามลำดับความปลอดภัย ผู้รับผิดชอบต้องรู้รุ่นล่าสุดที่มั่นคง และต้องมี checkpoint ที่ใช้อ้างอิงได้ก่อน release สำคัญ.

ห้ามใช้คำสั่งทำลาย history อย่าง `git reset --hard` ในโครงการเพื่อแก้ runtime issue ให้ใช้กระบวนการ checkpoint/rollback ที่จัดไว้และบันทึกเหตุผล รวมถึงผลต่อ state/data ที่อาจไม่ย้อนกลับ.

## 6. Observability และ analytics

### 6.1 หลัก data minimization

เก็บเฉพาะข้อมูลที่ตอบคำถามการปฏิบัติการหรือผลิตภัณฑ์ได้จริง เช่น “roll resolve error เพิ่มหรือไม่”, “Local Trial ถูกใช้เพราะอะไร”, “save failure เกิดใน browser ใด”, “ผู้เล่นไปถึง Declare Intent แต่ไม่ยืนยันมากขึ้นหรือไม่” อย่าเก็บเนื้อหา intent, prose, ชื่อตัวละคร, agreement, Chronicle หรือ Local Save ทั้งก้อนเป็น telemetry default เพราะข้อมูลเหล่านี้อาจเป็นเรื่องส่วนตัวของผู้เล่นแม้เกมจะเป็น fiction.

event ต้องมี schema, owner, purpose, retention และ redaction rule ก่อนใช้ ห้ามเพิ่ม `console.log` ที่บันทึก state ดิบเพื่อ debug แล้วลืมลบก่อน release Log ที่ต้องใช้แก้ incident ต้องถูก sanitize, จำกัดสิทธิ์ และมีอายุเก็บที่สอดคล้องกับ policy.

| ชนิดข้อมูล | เก็บได้เมื่อจำเป็น | ห้ามเก็บเป็นค่าเริ่มต้น |
|---|---|---|
| Runtime health | error code, duration bucket, route/feature id, browser family | token, cookie, full URL query ที่มีข้อมูลผู้ใช้ |
| Game flow aggregate | intent confirmed count, roll outcome band, fallback reason category | raw intent/prose, NPC/character name, full campaign state |
| Save health | success/failure category, serialized-size bucket, save schema version | entire Local Save, localStorage dump |
| AI health | model/provider category, timeout/error class, duration bucket, credit state category | prompt/context/prose text เว้นแต่มีการยินยอมและระบบอนุมัติแยก |
| Admin/security | role-check result, action category, audit timestamp | secret, session ID, player content เกินเหตุ |

### 6.2 Event taxonomy ขั้นต่ำ

ชื่อ event ต้องบอก action และผล ไม่ใช้ event อเนกประสงค์ที่มี payload ดิบก้อนใหญ่ ให้ version schema หากเปลี่ยน meaning และต้องหลีกเลี่ยง cardiniality สูง เช่น raw campaign id หรือข้อความอิสระที่ทำให้ dashboard ใช้ไม่ได้และเสี่ยง privacy.

| Event | Purpose | Properties ที่อนุญาตเป็นตัวอย่าง |
|---|---|---|
| `campaign_opened` | วัดการเปิดแคมเปญ | source category, save-schema version |
| `intent_confirmed` | หา friction ก่อน roll | route, language, input-length bucket |
| `roll_resolved` | สุขภาพ core loop | outcome band, DN bucket, Local/AI mode category |
| `local_trial_activated` | เฝ้าดู degradation | reason category: timeout/provider/credits/preview |
| `save_write_result` | ตรวจ continuity | result category, size bucket, schema version |
| `load_result` | ตรวจ migration/load errors | result category, migrated boolean |
| `admin_access_checked` | ตรวจ role guard | allow/deny, action category |

### 6.3 Alert design

alert มีไว้เรียกคนเมื่อ action ที่ชัดเจนต้องเกิด ไม่ใช่เพื่อทำให้ dashboard มีสีแดง ให้ตั้ง threshold จาก baseline เมื่อมีข้อมูล และใช้ multi-window หรือ error-rate plus volume เพื่อหลีกเลี่ยง false alert จาก traffic น้อย ทุก alert ต้องมี owner, runbook link, severity, quiet hours/rotation และวิธียืนยันว่าปัญหากระทบผู้เล่นจริง.

| สัญญาณ | ตัวอย่างการยกระดับ | Action แรก |
|---|---|---|
| save failure เพิ่มต่อเนื่อง | P1/P0 ตามผลต่อการเล่น | หยุด release ที่เกี่ยวข้อง, ตรวจ browser/schema/version, เปิด recovery communication |
| Local Trial activation สูงผิดปกติ | P1 หาก AI path หายเป็นวงกว้าง | ตรวจ provider/timeout/credit category และยืนยัน fallback ไม่หักเครดิต |
| roll resolve error | P0 หากเล่นต่อไม่ได้หรือ state ไม่สอดคล้อง | เปิด incident, freeze change, ตรวจ invariant/revision |
| role denial/authorization anomaly | P0/P1 ตามการรั่วไหล | จำกัด admin access, ตรวจ audit, แจ้ง security owner |
| asset/UI load degradation | P2/P1 หาก block core UI | ลด/rollback asset, ตรวจ CDN/bundle/performance trace |

## 7. Incident response

### 7.1 นิยามและบทบาท

incident คือเหตุที่ส่งผลต่อ state, ความสามารถเล่นต่อ, ความถูกต้องของการสื่อสาร, ความเป็นส่วนตัว หรือการเข้าถึง ไม่ใช่ทุกบั๊กต้องมี incident แต่ P0/P1 ที่เกิดใน live environment ต้องมีบันทึก timeline และ owner ห้ามรอให้สาเหตุชัดก่อนเริ่มลดผลกระทบ.

| บทบาท | หน้าที่ |
|---|---|
| Incident Commander | ตัดสินใจลำดับงาน, ตั้งจังหวะ update, ลดความสับสน |
| Technical Lead | ตรวจสมมติฐาน, หา scope, ดำเนิน mitigation/rollback |
| Communications Owner | เขียนข้อความผู้เล่น/ทีมที่เป็นจริงและไม่เกินข้อมูล |
| Scribe | บันทึกเวลา การตัดสินใจ หลักฐาน และ action owner |
| Domain Owner | ให้บริบทด้าน game state, AI, UI, privacy หรือ release ตามเหตุ |

### 7.2 ขั้นตอนมาตรฐาน

```text
Detect → Acknowledge → Triage impact → Contain → Communicate
→ Mitigate/Recover → Verify → Close → Blameless review
```

1. **Detect และ Acknowledge:** ยืนยันสัญญาณด้วย telemetry, report หรือการทำซ้ำ ตั้ง incident owner และระบุ revision/environment ไม่ลบ log หรือแก้แบบเงียบ ๆ ก่อนเก็บหลักฐานขั้นต่ำ
2. **Triage impact:** ตอบว่าใครได้รับผล, flow ใดพัง, state สูญหายหรือเสี่ยงสูญหายหรือไม่, fallback ใช้ได้หรือไม่ และมี privacy/security impact หรือไม่
3. **Contain:** หยุด rollout, ปิด feature path ที่เสี่ยงด้วย flag/route guard, หรือบังคับใช้ Local Trial เมื่อ AI contract ผิด โดยเลือกวิธีที่ไม่ทำให้ผู้เล่นสูญเสีย state เพิ่ม
4. **Communicate:** บอกผู้เล่นเฉพาะสิ่งที่รู้ ผลกระทบ สิ่งที่ทำอยู่ และสิ่งที่ผู้เล่นควรทำ/ไม่ควรทำ ไม่โยนความผิดให้ผู้เล่นหรือ provider โดยไม่มีหลักฐาน
5. **Mitigate/Recover:** rollback/forward fix/recovery guide ต้องผ่าน peer review ตามระดับ incident; อย่าแก้ data/state แบบ bulk โดยไม่มี backup/plan
6. **Verify และ Close:** ทำ repro เดิม, ตรวจ metrics กลับสู่ baseline, ยืนยัน Local Save/roll/flow ตาม scope แล้วจึงปิด
7. **Blameless review:** เขียนสิ่งที่เกิด เหตุที่ระบบอนุญาต ผลกระทบ สิ่งที่ทำได้ดี/ควรเปลี่ยน และ action ที่มี owner/วันครบกำหนด

### 7.3 Runbook: AI GM ไม่พร้อมใช้งาน

เมื่อ provider timeout, API error, output malformed หรือเครดิตไม่พอ เป้าหมายคือให้ผู้เล่นไม่เสีย turn และไม่ถูกหักเครดิตผิด ตรวจว่าระบบเข้าทาง Local Trial, outcome ยังมาจาก deterministic engine, UI ประกาศ fallback ชัด, และ Local Save ยังเขียนได้ เก็บเฉพาะ error category/latency ที่ sanitized ไม่เก็บ prompt หรือ prose ดิบเป็น default.

หาก Local Trial เองใช้ไม่ได้ ให้ยกระดับเป็น core flow incident; ห้ามแสดง outcome ที่ไม่ได้ resolve เพื่อ “ให้ดูเหมือนเล่นต่อ” ข้อความต้องบอกว่า state ปัจจุบันคงอยู่หรือไม่และผู้เล่นควรทำอะไร เช่น อย่าปิดหน้าเมื่อ save ล่าสุดยืนยันไม่ได้.

### 7.4 Runbook: Local Save เสียหายหรือเขียนไม่สำเร็จ

เมื่อพบ save corruption หรือ write error อย่าเขียนทับ key เดิมโดยอัตโนมัติ ตรวจ build/schema/browser/quota และทำซ้ำด้วย fixture ก่อนใด ๆ ที่แตะข้อมูล ระดับผู้เล่น UI ต้องแยกชัดระหว่าง “การเล่นในหน้านี้ยังอยู่” กับ “บันทึกลงเครื่องสำเร็จแล้ว” หากมี export/recovery flow ในอนาคต ต้องออกแบบให้ผู้เล่นยืนยันการแทนที่และเห็นผลกระทบก่อนเสมอ.

สำหรับ save เก่าที่ migration ไม่ผ่าน ให้เก็บ raw copy ในพื้นที่ local ที่ปลอดภัยเท่าที่ platform อนุญาต, แสดง code/reason ที่ support ใช้ช่วยได้โดยไม่เผยเนื้อหา และเสนอทางเลือกที่ไม่กล่าวอ้างว่ากู้คืนสำเร็จหากทำไม่ได้ เป้าหมายคือรักษาหลักฐานและลดการสูญเสียเพิ่ม ไม่ให้คำสัญญาเกิน capability.

### 7.5 Runbook: กติกาหรือ state ให้ผลผิด

หาก total, margin, XP, time, mission หรือ reward ผิด ให้หยุดการเปลี่ยนที่ขยายผลก่อน ตรวจ revision, fixture/seed, input/output และ save impact อย่าปรับค่า state ของผู้เล่นจำนวนมากก่อนรู้ว่ากฎ/ช่วงเวลาใดผิด การแก้ต้องมี owner จาก Game Design และ Game Development, QA regression, และ communication ที่แยก “สิ่งที่ตรวจพบ” จาก “สิ่งที่กำลังสอบสวน”.

## 8. ความเป็นส่วนตัว ความปลอดภัย และการสนับสนุนผู้เล่น

### 8.1 Local-first privacy

Local Save อยู่ในเบราว์เซอร์ของผู้เล่นเป็นหลัก จึงต้องสื่อขอบเขตให้ถูกต้อง: ระบบไม่ควรอ้างว่า server สำรองแคมเปญอยู่หากยังไม่มี feature นั้น, ผู้เล่นต้องทราบว่าการล้างข้อมูลเบราว์เซอร์หรือข้อจำกัด storage อาจกระทบ save, และ UI ควรบอกสถานะบันทึกล่าสุดอย่างไม่ทำให้เข้าใจเกินจริง

ห้ามใส่ secret, token, OAuth cookie, full Local Save, prompt/prose ดิบ หรือข้อมูลระบุตัวบุคคลใน client analytics, error boundary message, screenshot ที่แชร์สาธารณะ หรือ ticket ที่ส่งข้ามทีม การเข้าถึงข้อมูล operational ต้องใช้ role-based access และมี audit ตามความเหมาะสมกับระดับข้อมูล.

### 8.2 Support principles

support script สำหรับเกมเชิงเรื่องต้องไม่ขอให้ผู้เล่นเผยเนื้อหาแคมเปญมากกว่าจำเป็น ให้ขอ build, browser, route, error code/category, เวลาโดยประมาณ, save schema version และขั้นตอนทำซ้ำก่อน หากต้องขอภาพ screenshot ให้แนะนำผู้เล่นปิด/ปกปิดชื่อ ตัวละคร เนื้อเรื่อง หรือข้อมูลอื่นที่ไม่เกี่ยวกับบั๊ก.

| ปัญหาผู้เล่น | การตอบสนองที่เหมาะ | สิ่งที่ไม่ควรทำ |
|---|---|---|
| AI ไม่ตอบ | อธิบายว่า Local Trial ใช้เล่นต่อได้/กำลังตรวจหาก fallback ล้ม | บอกว่า “ลองรอ” โดยไม่ให้ทางไปต่อ |
| save ไม่ยืนยัน | แนะนำอย่าปิดหน้า, ตรวจพื้นที่/เบราว์เซอร์, เก็บหลักฐานที่ปลอดภัย | กล่าวหาว่าผู้เล่นใช้ผิดหรือรับรองว่ากู้ได้ |
| ผลทอยดูผิด | ขอ seed/steps/state label, เปิด triage | ปรับ state มือโดยไม่มี incident record |
| การเข้าถึง/คีย์บอร์ดพัง | ขอ browser/viewport/setting และให้ workaround ที่ใช้ได้ | ปิด ticket เพราะ “เมาส์กดได้” |
| privacy concern | จำกัดข้อมูลที่ขอ, ส่งให้ privacy owner ตาม procedure | ขอ export Local Save ทั้งก้อนเป็นค่าเริ่มต้น |

## 9. การสื่อสาร release และความโปร่งใส

release note ต้องบอกการเปลี่ยนที่ผู้เล่นสัมผัสได้ เช่น “ผลทอยแสดงลำดับ bonus ชัดขึ้น” หรือ “ปรับการโหลด save เก่าที่ไม่มีข้อมูลเศรษฐกิจบางส่วน” หลีกเลี่ยงคำว่า “แก้บั๊กหลายจุด” เมื่อมี impact สำคัญ และอย่าใช้คำว่า “AI ทำงานเสมอ” เพราะสัญญาของเกมคือเล่นต่อได้แม้ AI ไม่พร้อม.

เมื่อมี known issue ที่เกี่ยวกับ save, roll, credit, privacy, browser หรือ accessibility ต้องสื่อก่อนผู้เล่นเสียข้อมูลหรือเข้าใจผิด ข้อความต้องแยกสิ่งที่ได้รับผล, workaround, สิ่งที่ทีมกำลังทำ และเวลาจะ update ถัดไปถ้าระบุได้ ห้ามคาดเดาเวลาแก้ไขหรือรับปากผลลัพธ์ที่ยังไม่ผ่าน verification.

## 10. Operational calendar และการทบทวน

ทีมต้องกำหนดจังหวะ review ตามขนาดของผลิตภัณฑ์: release readiness ก่อนทุกการปล่อย, health review หลัง release, incident follow-up หลังเหตุสำคัญ, privacy/event audit เป็นรอบ และ performance/asset budget review เมื่อ feature หรือ traffic เปลี่ยน อย่าตั้ง schedule เชิงเทคนิคในโค้ดหรือ background job เพียงเพราะเอกสารพูดถึงรอบ review; การทำ automation/heartbeat ต้องผ่าน workflow และ skill ที่เกี่ยวข้องก่อนเสมอ.

| รอบทบทวน | ประเด็น | Output ที่ต้องมี |
|---|---|---|
| ก่อน release | scope, risks, test evidence, rollback, privacy | go/no-go record |
| ช่วงเฝ้าดูหลัง release | errors, fallback, save health, support signals | health note และ action owner |
| หลัง incident | timeline, root/system causes, action items | blameless post-incident review |
| เป็นระยะตามการเติบโต | event taxonomy, retention, access, budgets | updated policy/register |
| เมื่อเพิ่ม provider/feature สำคัญ | contract, secrets, recovery, consent | integration readiness document |

## 11. Definition of Done ของทีม Release and Operations

รุ่นหนึ่งเสร็จเชิงปฏิบัติการเมื่อทีมตอบได้อย่างมีหลักฐานว่า: ผู้เล่นทำ flow หลักต่อได้หรือไม่, หาก AI หรือ save มีปัญหา UI บอกความจริงและลดผลกระทบอย่างไร, มีใครได้รับผล, ข้อมูลใดถูกเก็บเพื่อดูระบบและเก็บนานเท่าใด, rollback/forward fix ใดปลอดภัย, และใครต้องตื่นเมื่อสัญญาณสำคัญแย่ลง

ไม่มี release ใดปลอดความเสี่ยงโดยสมบูรณ์ แต่ release ที่รับผิดชอบต้องทำให้ความเสี่ยงมองเห็น มีเจ้าของ และมีทางไปต่อ โดยไม่โยนต้นทุนของความไม่แน่นอนให้ผู้เล่นเป็นคนค้นพบเองหลังข้อมูลแคมเปญหาย.

## References

1. `docs/team-handbooks/01-shared-master-handbook-th.md` — product promises, Local Trial, Local Save และสัญญาข้ามทีม
2. `docs/team-handbooks/04-game-development-handbook-th.md` — architecture, server contracts, Local Save, migration และ role guard
3. `docs/team-handbooks/05-uiux-frontend-handbook-th.md` — player-facing disclosure, responsive behavior และ error/accessibility states
4. `docs/team-handbooks/07-qa-testing-handbook-th.md` — test strategy, severity, release regression และ browser matrix
5. `docs/dust-fire-core-game-source-of-truth-th.md` — deterministic game state และกติกาที่ใช้ตรวจ incident

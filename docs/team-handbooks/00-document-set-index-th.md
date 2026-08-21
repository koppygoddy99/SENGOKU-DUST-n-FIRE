# ชุดเอกสารปฏิบัติงาน Dust & Fire: Sengoku Stories
# Dust & Fire: Sengoku Stories — สารบัญชุดเอกสารและสัญญาการอ้างอิงร่วม

> สถานะ: เอกสารดัชนีและกติกาการอ้างอิงของชุดคู่มือ
>
> ผู้อ่าน: ทุกทีมที่สร้าง ดูแล ตรวจคุณภาพ หรือปล่อย Dust & Fire

## วัตถุประสงค์

เอกสารชุดนี้เป็นคู่มือแบบตัวอักษรล้วนสำหรับทีมที่สร้างและดูแล **Dust & Fire: Sengoku Stories** ซึ่งเป็นเกม tabletop role-playing เชิงนิยายประวัติศาสตร์ต้นฉบับในบริบทญี่ปุ่นยุคเซ็นโกกุ เอกสารมิได้แทนที่โค้ดหรือผลทดสอบ แต่กำหนดภาษาเดียวกันสำหรับการตัดสินใจ ออกแบบ พัฒนา ตรวจคุณภาพ และปล่อยเกม

ชุดนี้มี **8 ฉบับ**: เอกสารกลางหนึ่งฉบับ และคู่มือเชิงลึกของเจ็ดทีมหนึ่งฉบับต่อทีม ทุกฉบับอ้างอิงกติกา canonical จาก `docs/dust-fire-core-game-source-of-truth-th.md` เมื่อข้อความในคู่มือทีมขัดกับเอกสารคอร์เกม ให้ถือเอกสารคอร์เกมเป็นข้อผูกพันด้าน state transition และให้ Game Director เป็นผู้ตัดสินข้อขัดแย้งเชิงผลิตภัณฑ์

| รหัส | ไฟล์ | เจ้าของหลัก | หน้าที่ของเอกสาร |
|---|---|---|---|
| 00 | `00-document-set-index-th.md` | Game Director | สารบัญ ขอบเขต และกติกาการอ้างอิงข้ามทีม |
| 01 | `01-shared-master-handbook-th.md` | ทุกทีม | วิสัยทัศน์ คำศัพท์ กติกากลาง ขอบเขต MVP และสัญญาข้ามทีม |
| 02 | `02-game-director-handbook-th.md` | Team 1 | การกำกับทิศทาง กลุ่มผู้เล่น ขอบเขต และการอนุมัติการเปลี่ยนแปลง |
| 03 | `03-game-design-handbook-th.md` | Team 2 | ระบบเล่น ฉาก ตัวละคร ความก้าวหน้า ภารกิจ และ GDD |
| 04 | `04-game-development-handbook-th.md` | Team 3 | สถาปัตยกรรม state, deterministic engine, AI GM, Local Save และ implementation contract |
| 05 | `05-uiux-frontend-handbook-th.md` | Team 4 | IA, responsive UI, accessibility, interaction และ acceptance criteria หน้าจอ |
| 06 | `06-art-audio-handbook-th.md` | Team 5 | art direction, typography, motion, sound direction และสิทธิ์ในทรัพยากร |
| 07 | `07-qa-testing-handbook-th.md` | Team 6 | test strategy, bug report, difficulty validation และ browser matrix |
| 08 | `08-release-operations-handbook-th.md` | Team 7 | performance, release, observability, incident response และการดูแลหลังเปิดตัว |

## กฎการใช้เอกสาร

ทีมต้องเริ่มงานใหม่ด้วยการอ่านเอกสารกลางและคู่มือของตนเองก่อน หากงานเปลี่ยน state ของเกม ให้ Game Development ตรวจสัญญา `applyRoll()` และ Game Design ตรวจผลต่อ experience เสมอ หากงานเปลี่ยนเนื้อเรื่อง สถานะทางประวัติศาสตร์ หรือระดับภาษา ให้ Game Director และ Game Design ตรวจร่วมกัน หากงานเปลี่ยนหน้าจอหรือการเข้าถึง ให้ UI/UX Frontend และ QA ตรวจร่วมกัน

> กฎความต่อเนื่อง: ผู้เล่นประกาศเจตนาเพียงประโยคเดียว ส่วนระบบเลือกแกน ทอย 2d12 บันทึกผล เปลี่ยนโลก และคืนฉากที่เล่นต่อได้ ไม่มีทีมใดเพิ่มรางวัล โบนัส หรือข้อเท็จจริงทางประวัติศาสตร์นอก state transition ที่ตรวจสอบได้

## คำศัพท์ร่วมที่ห้ามแปลความต่างกัน

| คำ | ความหมายที่ใช้ร่วมกัน |
|---|---|
| **Intent / เจตนา** | ประโยคการกระทำหนึ่งประโยคที่ผู้เล่นยืนยันก่อนทอย |
| **Axis / แกน** | วิธีหลักห้าแบบ: พละกำลัง ฝีมือ ไหวพริบ ปัญญา และพลังใจ |
| **Mastery / ความชำนาญ** | วิชาเฉพาะรายตัวที่มี Step 1–20, XP และโบนัส ไม่ใช่เลเวลรวม |
| **Step** | ขั้นของ mastery; Step 20 เป็นเพดานและเปลี่ยนเป็น Mastery Mark เชิงเรื่อง |
| **Leaf** | หน้าหรือบทของแคมเปญที่เกิดจากเวลาสะสมหลายวัน ไม่ใช่ตัวนับทุกการทอย |
| **Mission Thread** | เส้นเรื่องที่ระบบติดตามจาก action และผลลัพธ์ ไม่ใช่ปุ่มรับเควส |
| **Agreement** | สมุดสัญญาและผลประโยชน์ที่บันทึกผู้เกี่ยวข้อง สิ่งที่เปลี่ยนมือ พยาน และผลตามมา |
| **Local Trial** | การ resolve ในเครื่องเมื่อ AI GM ใช้ไม่ได้ โดยไม่หักเครดิตและยังเซฟต่อได้ |
| **Historical Fence** | การบอกระดับหลักฐานว่า fact-supported, contextual-play, campaign-fiction หรือ insufficient-evidence |

## มาตรฐานสถานะเอกสาร

ทุกฉบับต้องระบุว่าส่วนใดเป็น **ใช้งานจริง**, **vertical slice**, **โครงข้อมูลพร้อมแต่ยังไม่ครบ**, หรือ **งานอนาคต** ห้ามใช้คำว่า “เสร็จแล้ว” กับระบบที่มีเพียง mock, static copy หรือ state ที่ยังไม่มี transition ที่ทดสอบได้

## การจัดการข้อขัดแย้ง

ตารางต่อไปกำหนดผู้ตัดสินหลักเมื่อเอกสารสองฉบับให้คำตอบไม่ตรงกัน

| ประเด็น | ผู้ตัดสินหลัก | ผู้ตรวจร่วม |
|---|---|---|
| เป้าหมายผู้เล่น ขอบเขต MVP และเนื้อหาเสี่ยง | Game Director | Game Design, Release and Operations |
| สูตรทอย XP เวลา ภารกิจ และรางวัล | Game Design | Game Development, QA |
| state transition, migration, AI contract และสิทธิ์ | Game Development | Game Design, QA |
| การมองเห็นข้อมูล ลำดับการตัดสินใจ และ accessibility | UI/UX Frontend | Game Design, QA |
| ภาพ เสียง ฟอนต์ และสิทธิ์ทรัพย์สิน | Art and Audio | Game Director, UI/UX Frontend |
| เกณฑ์ผ่าน การทำซ้ำบั๊ก และความยาก | QA and Testing | ทุกทีม |
| เวลา release, monitoring และ incident | Release and Operations | Game Development, QA |

## วิธีขยายเอกสาร

เมื่อเพิ่มระบบใหม่ ให้เพิ่มหัวข้อในเอกสารกลางก่อน ระบุ owner, state contract, UI surface, test requirement, historical/language guardrail และ operational impact จากนั้นจึงแก้คู่มือทีมที่รับผิดชอบ ห้ามให้คู่มือทีมใดสร้างกติกาลับหรือ schema อิสระโดยไม่บันทึกในเอกสารกลาง

## References

1. `docs/dust-fire-core-game-source-of-truth-th.md` — แหล่งอ้างอิง canonical ของกติกา state transition และ data contract.
2. `docs/dust-fire-lore-narrative-art-bible-th.md` — แหล่งอ้างอิง setting, narrative, language, historical boundary และ art direction.
3. `docs/team-handbooks/01-shared-master-handbook-th.md` — เอกสารกลางที่ใช้เป็นฐานของคู่มือทีมทั้งเจ็ด.

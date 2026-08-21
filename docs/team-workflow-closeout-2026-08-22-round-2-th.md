# Dust & Fire: Sengoku Stories — รายงานปิดรอบ UI, Map, Chronicle และ Navigation

**สถานะรอบ:** ปิดรอบแล้ว  
**ขอบเขต:** หน้า Play Scene, National Map, Chronicle, World Archive และ Player Navigation  
**สถานะตรวจรับ:** TypeScript ผ่าน, Vitest **89 tests / 28 files** ผ่าน, browser layout **2/2 scenarios** ผ่าน

## บทสรุปผู้บริหาร

รอบนี้เปลี่ยนหน้าเล่นให้เดินตามจังหวะการตัดสินใจเดียวมากขึ้น ผู้เล่นเขียนเจตนาแล้วจึงเข้าสู่คำวินิจฉัยและการทอย โดยตัดปุ่มดูความเสี่ยงที่สร้างขั้นตอนเกินจำเป็นออก การทอย 2d12 มีช่วงหมุนราวสี่วินาทีก่อนหยุด และร้อยแก้วผลลัพธ์หลังบันทึกจะแสดงแบบค่อยเป็นค่อยไปในสภาพแวดล้อมที่ไม่เปิด reduced motion

National Map ยังคงใช้ asset ฐานที่ผู้ใช้ยืนยันสิทธิ์ แต่ปรับ Province Detail ให้โฟกัสใกล้ตำแหน่งปัจจุบัน แสดงเพียงแคว้นปัจจุบันและแคว้นข้างเคียงที่เลือกได้ ไม่แสดงข้อความประเภท “ไม่มีเหตุการณ์เฉพาะพื้นที่ที่ผ่านการตรวจทาน” ในส่วนแผนที่อีกต่อไป พงศาวดารถูกทำให้ระบุชัดว่าเป็นบันทึกของแคมเปญที่เปิดอยู่เท่านั้น และ Campaign Library ถูกย้ายจากกลุ่ม Chronicle ไปอยู่ใต้ More ตามคำสั่ง

| หัวข้อ | ผลส่งมอบ | หลักฐานตรวจรับ |
|---|---|---|
| การทอย | ลูกเต๋าเคลื่อนไหวก่อนเปิดผลประมาณ 4 วินาที และรองรับ reduced motion | `ROLL_ANIMATION_MS = 4000`, regression UI ผ่าน |
| ร้อยแก้วผล | ผลเรื่องเล่าปรากฏแบบไล่พิมพ์หลังบันทึกผล | `TypewriterProse` พร้อม `aria-live` และ `aria-busy` |
| เจตนา | คำถามไทยเป็น “เจ้าจะทำอย่างไร”; ตัดปุ่มดูความเสี่ยง | regression ยืนยัน CTA หลักเดียว |
| แผนที่ | Overview และ Province Detail; Detail รอบ Izumi แสดง Izumi, Settsu, Kawachi | visual review desktop/mobile และ zoom test ผ่าน |
| พงศาวดาร | มี scope line ระบุชื่อแคมเปญ และใช้ game state ของแคมเปญที่เลือก | local-flow regression ผ่าน |
| เมนู | Campaign Library อยู่ใน More; Chronicle เหลือ Chronicle และ World Archive | navigation regression ผ่าน |

## สถานะตาม workflow 7 ทีม

| ทีม | งานในรอบนี้ | สิ่งที่เสร็จแล้ว | หลักฐานตรวจรับ | สิ่งที่จงใจยังไม่เปิด | งานถัดไป |
|---|---|---|---|---|---|
| 1. Game Director | กำกับลำดับประสบการณ์ผู้เล่น | ยืนยัน one-question rule สำหรับ Play: เขียนเจตนา → ตรวจคำวินิจฉัย → ทอย → บันทึกผล | Play review desktop/mobile; CTA หลักเหลือหนึ่งจุด | ไม่เพิ่ม flow เสี่ยง/เดาความยากก่อน commit | เก็บ feedback การเล่นจริงว่าจังหวะสี่วินาทีพอดีหรือควรตั้งค่าได้ |
| 2. Game Design | กติกาการทอยและขอบเขตข้อมูลแผนที่ | การทอย 2d12 ไม่เปลี่ยนผลคำนวณ; map detail แสดงชื่อ/บริบทภูมิศาสตร์ แต่ไม่แต่งเหตุการณ์หรือผู้ครองอำนาจ | `StoryMap.zoom.test.tsx` และ catalog แคว้นเดิม | ไม่สร้าง state ใหม่จากการคลิกแคว้น | ตรวจ source เพิ่มเฉพาะ timeline ปี/ภูมิภาคที่ต้องการขยาย |
| 3. Game Development | state และพฤติกรรม interaction | เพิ่ม constant ระยะ animation, typewriter ที่ cleanup timer, state map zoom/selected province และคง Local Save | TypeScript ผ่าน; 89 tests ผ่าน | ไม่แตะ schema หรือเพิ่ม server write | เพิ่ม E2E authenticated GM flow เมื่อมี requirement ด้านเครดิต/บัญชีเพิ่มเติม |
| 4. UI/UX Frontend | Play, Chronicle, menu และ archive affordance | ตัด SEE THE RISK; เปลี่ยน copy เจตนา; Chronicle ระบุ campaign scope; ย้าย Campaign Library ไป More; World Archive ไม่มี chevron ที่สื่อว่ากดได้ | visual review 1280 × 720 และ 375 × 812 | ไม่เพิ่ม route ใหม่สำหรับ archive records | ตรวจ keyboard focus order บนมือถือและรับ feedback การอ่านจริง |
| 5. Art & Audio | จังหวะภาพของผลทอยและ map hierarchy | Dice tray หมุนสลับจังหวะก่อนหยุด; map detail ซูมใกล้และลด labels เหลือแคว้นข้างเคียง | screenshot desktop/mobile; reduced-motion fallback ใน CSS | ไม่มีเสียงหรือ asset เคลื่อนไหวใหม่ | หากต้องการ ให้กำหนด sound cue ที่ผู้ใช้ยืนยันต่อไป |
| 6. QA & Testing | regression และ responsive | เพิ่ม regression ระยะทอย/CTA เดียว, map detail ไม่มี historical note, navigation ใหม่ และ campaign-scoped chronicle | TypeScript ผ่าน, 89 tests / 28 files ผ่าน, browser overflow 2/2 ผ่าน | ยังไม่มี E2E ที่ login จริงและ mobile keyboard audit แบบเต็ม | เพิ่ม E2E role-gated admin และ mobile keyboard audit |
| 7. Release & Operations | เอกสารและ checkpoint | บันทึก visual triage, รายงานทีม และเตรียม checkpoint ของรอบนี้ | `docs/player-ui-triage-2026-08-22-th.md`, รายงานฉบับนี้ | Analytics visitor ยัง not-configured; Local Save ยัง browser-only | ตรวจ feedback หลังเล่นและสร้าง checkpoint สำหรับรอบถัดไป |

## สิ่งที่จงใจคงไว้เป็นขอบเขต

ระบบยังใช้ **Local Save ในเบราว์เซอร์** เป็นแหล่งข้อมูลหลัก จึงไม่มีการรวมพงศาวดารข้ามแคมเปญโดยอัตโนมัติ และไม่มีการเพิ่มข้อมูลแคมเปญไปยังฐานข้อมูลกลาง การคลิกแคว้นบนแผนที่เป็นการอ่านข้อความกำกับเท่านั้น ไม่เปลี่ยน location, ไม่ย้ายเวลา และไม่กำหนดการครอบครองแคว้น

ในหน้า Play ปุ่มดูความเสี่ยงถูกลบเพื่อไม่ให้สร้างงานอ่านหรือเรียกใช้ระบบก่อนผู้เล่นยืนยันเจตนา การช่วยตีความโดย AI จึงยังอยู่หลังปุ่มยืนยันเจตนาในกรณีที่ผู้เล่นเข้าสู่ flow ที่ได้รับสิทธิ์ ส่วน Local Trial ยังคงไม่ใช้เครดิต AI ตามขอบเขตเดิม

## แฟ้มหลักของรอบนี้

| ไฟล์ | บทบาท |
|---|---|
| `client/src/features/play/PlayScene.tsx` | จังหวะทอย, typewriter, CTA เจตนา |
| `client/src/features/play/playSceneProgression.css` | animation และ reduced-motion fallback |
| `client/src/features/story/StoryMap.tsx` | Province Detail ซูมใกล้และ province brief ที่ไม่แสดง historical note |
| `client/src/features/chronicle/ChronicleView.tsx` | ขอบเขตพงศาวดารตามแคมเปญ |
| `client/src/pages/Home.tsx` | ย้าย Campaign Library ไป More และ archive record presentation |
| `client/src/pages/Home.local-flow.ui.test.tsx` | regression CTA, cadence, navigation และ campaign scope |
| `client/src/features/story/StoryMap.zoom.test.tsx` | regression map detail และ hotspot neighborhood |

## งานที่ยังค้างหลังปิดรอบ

งานคงค้างไม่ใช่ blocker ต่อการเล่นในรอบนี้ ได้แก่ feedback เอกสารจากผู้ใช้, การขยาย timeline เมื่อมี source เพิ่ม, E2E สำหรับ admin ที่ login จริง และ mobile keyboard audit แบบเต็ม

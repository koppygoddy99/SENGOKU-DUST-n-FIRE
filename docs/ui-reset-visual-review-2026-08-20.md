# UI Reset Visual Review — 2026-08-20

## Captures reviewed

| Review route | Route target | Result |
|---|---|---|
| `?review=home` | Campaign Command | ผ่านโครง map-first แล้ว แต่ยังต้องลด record density และเกลา heading rail |
| `?review=play` | Play Scene | ผ่าน reading surface และ action dock แล้ว แต่ยังต้องลบ technical label และแก้ CTA copy |

## Findings retained for implementation

Campaign Command มี focal point ที่ถูกต้องแล้ว: map อยู่ซ้าย, dice tray และ current consequence อยู่ขวา, CTA กลับสู่ฉากอยู่ในตำแหน่งที่เห็นได้ทันที อย่างไรก็ดี `World State Pulse` ยังแสดง prose เต็มยาวเกินบทบาท context layer จึงต้อง clamp เหลือ preview สั้นและเปิดอ่านรายละเอียดจาก World Archive อีกทั้ง metadata `First decision` ที่หัว Story Desk ต้องจำกัดความกว้าง/ตำแหน่งเพื่อไม่ล้น edge ที่ความกว้าง review desktop

Play Scene มี prose field ที่กว้างและอ่านได้โดยไม่มี scroll ซ้อน ซึ่งตรงกับ blueprint แต่ยังมี `Story Engine: Local` ใน player-visible toolbar และ CTA `PREVIEW RISK` / `COMMIT ACTION` ที่เป็น copy เชิงระบบเกินไป ทั้งสามรายการต้องถูกแทนด้วย copy ที่ระบุผลของการกระทำ และ fallback/engine status ต้องย้ายเข้า contextual notice เฉพาะเมื่อจำเป็น

## Next implementation checks

| Priority | Change | Acceptance check |
|---|---|---|
| P0 | Clamp World State Pulse และควบคุม Story Desk metadata | Campaign Command ไม่มี prose record ยาวเต็ม viewport และไม่มี header content ล้น |
| P0 | เปลี่ยน CTA ของ Action Dock | CTA บอกผลชัด, ไม่มี `PREVIEW RISK` หรือ `COMMIT ACTION` ใน player UI |
| P1 | ลบ technical engine label จาก Play toolbar | สถานะ Local Trial ปรากฏเฉพาะเมื่อ fallback มีผลต่อผู้เล่น |
| P1 | ตรวจ Campaign Command และ Play ที่ 390px | Map/action dock ไม่ล้นและ CTA หลักยังอยู่ใน reach zone |

## Review round two

Chronicle ผ่านการปรับไปสู่ `recent leaves → selected leaf → story thread` แล้ว โดย first viewport ไม่ซ้ำ prose เต็มแบบเดิม และ Reader Mode ยังเป็นทางอ่านฉบับเต็มแยกจากหน้าจอ library อย่างชัดเจน

ผู้ตรวจภาพพบว่า player UI มีคุณภาพทาง editorial แล้ว แต่ ledger spine ยังไม่เป็นระบบข้ามหน้า และ Admin Console ยังมี chrome แบบ generic SaaS รวมทั้ง loading surface ที่ว่างเกินไป จึงกำหนดแก้ต่อดังนี้

| Priority | Change | Acceptance check |
|---|---|---|
| P0 | ทำ ledger spine ให้เป็นส่วนประกอบข้าม player และ admin | ทุก route เห็น identity, folio/context และ navigation อย่างเป็น document structure เดียวกัน |
| P0 | เปลี่ยน Admin เป็น official war-office ledger | ไม่มี sidebar/overview แบบ generic; ใช้ folio, seal, ruled audit rows และ operational copy |
| P1 | ทำให้ vermilion เป็นสัญญาณการกระทำ/ความเสี่ยง ไม่ใช่แค่ label | CTA สำคัญและ record ที่มีต้นทุนเห็น semantic vermilion ชัดโดยไม่กลบ navy ink |
| P1 | จำกัด World State Pulse และ Story Desk metadata | ไม่มี prose record เต็มหรือ metadata ล้น viewport desktop |

## Full route capture

การ capture desktop ครบ 16 review routes สำเร็จ: Campaign Command, Campaign Library, New Campaign, Play Scene, Missions, Market, Carried Gear, Services, Debts & Favors, Exchange History, Character Dossier, Chronicle, World Archive, Save, Load และ Settings ทุก route render ได้จาก deterministic review seed และไม่มี build/type error ระหว่าง capture

> ภาพ full-page ของระบบตรวจจะซ่อน fixed sidebar โดยเจตนา จึงไม่ใช้การไม่มี rail ในไฟล์ภาพเป็นข้อสรุปว่า rail ไม่ทำงาน ตัว shell ยังคง `sidebar` แบบ fixed ใน player preview และถูกทดสอบผ่าน click-flow/navigation regression

ภาพที่เห็นยืนยันว่า Chronicle ใช้ selected-leaf hierarchy แล้ว; Market ใช้ ledger-tab structure ตามข้อมูลเศรษฐกิจจริง; Character, Archive, Save, Load และ Settings ยังคงสอดคล้อง material system แบบ paper/ink แต่ยังเป็นกลุ่มหน้าที่ควรเกลารายหน้าเมื่อผู้ใช้ชี้เป้าหมายถัดไป

## Play scene viewport follow-up

ภาพ desktop ของ Play Scene หลังรีเซ็ตยืนยันว่า narrative paper แสดงเป็นพื้นที่ต่อเนื่องโดยไม่มี scroll ซ้อน และ rail ยังแสดงตัวตน ค่าสถานะ และเส้นทาง Story ในจอเดียวกัน เนื่องจาก prose ของฉากยาวตามข้อกำหนด จึงเพิ่ม CTA สี vermilion **Declare Intent / ประกาศเจตนา** ใน header เพื่อพาผู้เล่นไปยัง composer และโฟกัสช่องเขียนโดยตรง นี่ทำให้การกระทำหลักปรากฏใน viewport แรก โดยไม่ตัดบทละครหรือซ่อนกติกาที่จะใช้หลังเจตนาได้รับการยืนยัน

# Dust & Fire — Player UI Triage หลังรอบ National Map

**ขอบเขตการตรวจ:** review routes ทั้ง 16 หน้าผู้เล่นที่ viewport 1280 × 720 แบบ full-page  
**เป้าหมาย:** หา UI กลุ่มแรกที่ยังขัดกับ one-question rule และลำดับข้อมูลสามชั้น โดยไม่เปลี่ยนกติกาหรือ state เกม

## ข้อค้นพบที่ใช้ดำเนินงาน

หน้า Campaign Command เป็นจุดที่ควรแก้ก่อน เพราะ **Story Desk** ถูกยืดให้มีความสูงเท่ากับ National Map แต่เนื้อหาภายในยาวกว่าพื้นที่ที่ถูกจัดสรร เมื่อชื่อสถานที่ภาษาไทยยาว ปุ่ม `Return to …` ใน CTA หลักจึงถูกบีบและดูเหมือนถูกตัดที่ขอบล่างของ desk แม้ข้อมูลแผนที่และภารกิจยังแสดงถูกต้อง

การแก้รอบถัดไปจะคงคำถามหลักของหน้าไว้เพียงข้อเดียว คือ “จะกลับไปทำอะไรในฉากปัจจุบัน” โดยให้ CTA กลับไปเล่นฉากอยู่ใน flow ปกติของเนื้อหา ไม่แข่งขันกับความสูงของ National Map ส่วนแผนที่, mission และ world state จะคงเป็นข้อมูลบริบทระดับรองและระดับสามตามลำดับ

| กลุ่มหน้า | ผล triage | เหตุผล |
|---|---|---|
| Campaign Command | **แก้ก่อน** | Story Desk มี CTA ที่เสี่ยงถูกบีบเมื่อ label สถานที่ยาว |
| Play Scene | คงไว้ | เป็นหน้า one-question rule อยู่แล้ว: ผู้เล่นประกาศเจตนาหนึ่งประโยค |
| Market / Character / Save / Load | คงไว้ | โครง ledger สม่ำเสมอ และ CTA หรือ tab หลักอ่านได้ชัด |
| Chronicle / World Archive | ตรวจรอบถัดไป | เนื้อหารองยาว แต่ไม่พบ CTA หลักถูกตัดในรอบนี้ |
| Settings / New Campaign | คงไว้ | ตั้งใจเป็นหน้าตั้งค่าและ wizard หลายขั้น จึงไม่ควรถูกบังคับให้เหลือการตัดสินใจเดียวในหน้าเดียว |

## Chronicle and World Archive follow-up

การตรวจภาพ 22 สิงหาคม 2026 พบว่า Chronicle library มีเส้นทางหลักชัดเจนอยู่แล้ว คือเลือก recent leaf แล้วอ่านต่อใน Reader Mode จึงไม่ควรเพิ่ม CTA ซ้ำ ส่วน World Archive แสดงการ์ดสรุปสี่ใบพร้อม chevron ไปทางขวา แม้การ์ดเหล่านั้นยังเป็นข้อมูลอ่านอย่างเดียวและไม่มีการนำทางหรือการขยายรายละเอียด การคง chevron ไว้จึงสื่อ affordance ที่ไม่จริง

รอบถัดไปจะคง archive เป็น **ledger of visible knowledge**: ตัด chevron ที่สื่อว่ากดได้ออก, ลดการ์ดเป็น record rows ที่บอกว่าข้อมูลใดเป็นผลจากแคมเปญจริง และให้ Recent Memories เป็นชั้นรายละเอียดแทน ไม่เพิ่ม route หรือ state ใหม่โดยไม่มี requirement จากผู้ใช้

## Visual review — รอบคำสั่งหน้าเล่นและแผนที่ล่าสุด

ตรวจ Play, National Map ใน Province Detail และ Chronicle library ที่ viewport 1280 × 720 แล้ว หน้า Play เหลือ CTA ยืนยันเจตนาหลักเดียวโดยไม่มีปุ่มดูความเสี่ยง; คำถามภาษาอังกฤษเปลี่ยนเป็น “What will you do?” และคำถามไทยใน component เปลี่ยนเป็น “เจ้าจะทำอย่างไร” ตาม requirement. National Map ซูมเข้าใกล้จุดอิซุมิและแสดงเพียง Izumi, Settsu และ Kawachi พร้อม province brief โดยไม่มี historical note. Chronicle แสดงบรรทัดกำกับว่าพงศาวดารเป็นของแคมเปญที่เปิดอยู่เท่านั้น. ภาพรวมไม่พบ horizontal clipping ในสามหน้าที่ตรวจ.

ตรวจ viewport 375 × 812 แล้ว หน้า Play เรียง narrative, approaches และ composer แบบคอลัมน์เดียว ปุ่มตั้งเจตนายังเข้าถึงได้ และไม่มีปุ่มดูความเสี่ยง ส่วน National Map แสดงแคว้นอิซุมิและแคว้นซ้าย–ขวาในกรอบโดยไม่มี horizontal scroll; Story Desk, Mission และ Timeline จัดลงเป็น flow เดียวใต้แผนที่โดยไม่ตัดข้อความหลัก.

## Prepare group triage

ตรวจ Character, Gear, Market, Services และ Obligations ที่ 1280 × 720 แล้ว พบว่า Market และหน้ารองต่าง ๆ สื่อบทบาทเป็น ledger ได้ค่อนข้างชัด ส่วน **Character Dossier** มีคำสั่ง `View related records` ที่กว้างและไม่บอกปลายทาง จึงเป็นจุดเสี่ยงสูงสุดต่อ one-question rule ในกลุ่มนี้ รอบถัดไปควรเปลี่ยนเป็นคำสั่งที่ระบุปลายทางหรือย้ายการนำทางรองเข้ากลุ่ม record ที่สัมพันธ์กัน โดยไม่เปลี่ยนค่าตัวละครหรือระบบ progression

แก้แล้วเป็น `Open this campaign's Chronicle` / `เปิดพงศาวดารของแคมเปญนี้` และตรวจภาพที่ 1280 × 720 กับ 375 × 812 แล้ว label อ่านได้ครบ ไม่ชนกับข้อมูลตัวตนหรือ status ledger และยังนำไป Chronicle ของแคมเปญเดียวกันตามเดิม

## Prepare guidance verification

ผลตรวจ desktop ของ Gear, This Market, Services & Hands และ Debts & Favors ยืนยันว่าทุก tab มี ledger guidance ในตำแหน่งเดียวกันใต้เนื้อหาหลัก: Gear และ Debts เป็น record อ่านอย่างเดียว, Services ระบุว่าผู้ติดต่อจะใช้งานได้เมื่อฉากทำให้ติดต่อกัน, ส่วน This Market ระบุให้เลือกข้อเสนอหนึ่งรายการและทุกแถวมี CTA `TAKE OFFER` ของตนเอง จึงไม่มี action ที่ดูเหมือนกดได้แต่ไม่ทำงาน การจับภาพ Agreements รอบแรกใช้ query ที่ไม่อยู่ใน manifest จึงได้หน้า Campaign Command; จะจับภาพใหม่ผ่าน `review=exchanges` ก่อนปิดรอบ

ตรวจ `review=exchanges` แล้ว Agreements & Consequences แสดงเป็น record อ่านอย่างเดียวโดยไม่มี CTA ปลอม ทั้งห้าหน้าตรวจซ้ำที่ 375 × 812 แล้ว tab strip ห่อข้อความตามความกว้างจอโดยยังเลือกได้ครบ, เนื้อหาอยู่ใน flow เดียวและ ledger guidance ไม่ถูกตัด แม้ชื่อ tab บางรายการใช้สองถึงสามบรรทัดตามพื้นที่แคบ

## Prepare hierarchy correction

รอบแก้ QA ย้าย guidance ของทุก tab ไปอยู่ใต้ tab strip และก่อนเนื้อหาหลัก: This Market แสดงคำสั่งเลือกหนึ่งข้อเสนอก่อนรายการและ CTA `TAKE OFFER`, ส่วน Gear, Services, Debts และ Agreements ระบุ read-only campaign record ก่อนอ่าน detail. Gear มีป้าย `RECORD` ระดับ item; Services มี role/availability/record และประโยค risk ที่บอกชัดว่าเกิดเมื่อถูกติดต่อในฉาก; Debts และ Agreements มี `RECORD` ในหัวและแต่ละรายการ จึงไม่สื่อว่าแถวใดกดใช้ได้ทันที ผล desktop ครบทั้งห้า route แสดง hierarchy ตามนี้โดยไม่เกิด horizontal clipping

ผล mobile ที่ 375 × 812 ยืนยันว่า guidance นำมาก่อน content ทุก tab, CTA `TAKE OFFER` ของ market ยังแยกเป็นปุ่มเต็มแถวและเข้าถึงได้, ส่วน Gear/Services/Debts/Agreements ไม่มี action ปลอมและป้าย `RECORD` อ่านได้ แม้ชื่อ tab จะห่อหลายบรรทัดตามความกว้าง แต่ไม่ล้นแนวนอนและยังแยก tab active ได้ชัด

browser regression ใหม่ตรวจพบ overflow จริงจาก tab strip และ top bar (`app-shell` กว้างถึง 498px ที่ viewport 375px) จึงเปลี่ยน tab strip ของ Market Hub เป็น five-column grid ที่ยอมตัดบรรทัด พร้อมลด gap และ padding ของ top bar ที่ breakpoint มือถือ หลังแก้ `pnpm test:market-mobile-layout` ผ่านครบ 5/5 routes และภาพ `review=market` ยืนยันว่าหน้าไม่มี horizontal clipping

ชุดตรวจรับเต็มหลังแก้ผ่านครบ: TypeScript, Vitest 91 tests / 28 files, Campaign Command layout 2 scenarios, mobile keyboard audit 1 scenario, Play dice flow 1 scenario และ Market Hub mobile layout 5 routes. Regression ระดับ component ยืนยัน guidance อยู่ก่อน content สำหรับ Market tab, CTA `TAKE OFFER` มีอยู่จริง, และแต่ละ tab แสดง read-only/status label ตามหน้าที่ของตน

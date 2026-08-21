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

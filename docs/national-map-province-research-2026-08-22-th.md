# National Map Zoom — บันทึกฐานข้อมูลแคว้น

## ขอบเขตข้อมูล

ระบบซูมจะใช้ชื่อ **แคว้นประวัติศาสตร์** (`kuni`) เป็นชั้นภูมิศาสตร์ ไม่ใช้เป็นข้ออ้างว่าใครครอบครองพื้นที่ในปีของแคมเปญ เพราะแคว้นกับอำนาจของ daimyo เป็นคนละชั้นข้อมูล แหล่งสรุประบุว่าเส้นเขตแคว้นคงรูปเป็นส่วนใหญ่ตั้งแต่สมัยเฮอังถึงเอโดะ ขณะเดียวกันแคว้นอยู่ร่วมกับระบบ `han` และมีสถานะรองลงมาในปลายมุโรมาจิ [1]

ชั้นโต้ตอบจึงแยกออกเป็นสองระดับดังนี้

| ระดับ | สิ่งที่แสดง | สิ่งที่ไม่แสดง |
|---|---|---|
| ซูมออก | asset แผนที่ระดับประเทศ, marker ผู้เล่น, ชื่อแคว้นปัจจุบัน | ชื่อแคว้นอื่น, สีครอบครอง, ธงตระกูล, ruler |
| ซูมเข้า | ป้ายชื่อแคว้น, boundary hotspot, province brief ตามปีแคมเปญ และแคว้นรอบตัวผู้เล่น | territorial control, การอ้างว่าผู้ปกครองใดถือครองแคว้นโดยอัตโนมัติ |

## แหล่งและข้อจำกัด

China Historical GIS ให้รายการแหล่งข้อมูลสำหรับแผนที่แคว้น premodern/medieval, แผนที่ Sengoku daimyo ราว ค.ศ. 1572 และแผนที่ feudal Japan ช่วง ค.ศ. 1564–1573 [2] ซึ่งเหมาะเป็นหลักฐานอ้างอิงสำหรับการตรวจชื่อและขอบเขตระดับแนวคิด ไม่ได้นำ artwork หรือ raster map ของแหล่งนั้นมาใช้ในเกม

Lavenberg Collection รวบรวมรายชื่อและความสัมพันธ์ระหว่างแคว้นที่ตรวจสอบย้อนกลับได้ เช่น Iga ติด Ise, Ōmi, Yamato และ Yamashiro; Ise ติด Iga, Kii, Mino, Ōmi, Owari, Shima และ Yamato; รวมถึง Mino, Owari, Mikawa, Shinano, Kii, Settsu และแคว้นสำคัญอื่นในพื้นที่เกม [3] ข้อมูลนี้จะใช้ตรวจ neighborhood list ก่อนแสดง “แคว้นรอบข้าง” ใน zoom mode

การเปิดหน้าแหล่งอ้างอิงโดยตรงเมื่อ 22 สิงหาคม 2026 ยืนยันว่า CHGIS ระบุทั้งแผนที่ “Provinces of premodern Japan”, “Provinces of medieval Japan”, “Major Sengoku Daimyo (ca. 1572)” และ “Feudal Map of Japan (1564–1573)” ส่วน Lavenberg แสดงรายการแคว้นและแนวติดกันของแคว้นกลางที่ใช้กับเกม เช่น Iga, Ise, Izumi, Kii, Mikawa, Mino, Ōmi, Owari, Shinano และ Yamato ตามข้อความอธิบายรายแคว้นบนหน้าเดียวกัน [2] [3]

## แนวทางการเขียน province brief

คำอธิบายที่กดดูได้ต้องประกอบด้วยชื่อแคว้น, ขอบเขตภูมิศาสตร์/เส้นทางที่มีแหล่งตรวจได้ และข้อความกำกับว่าบทบาทของผู้ปกครองหรือเหตุการณ์เฉพาะปีจะแสดงเฉพาะเมื่อ timeline มี record รองรับ หากไม่มี record เกมจะบอกว่า “ไม่มีเหตุการณ์ที่ผ่านการตรวจทานสำหรับปีนี้” แทนการเดา

## Visual review — National Map zoom

ตรวจภาพจริงในโหมด province detail สำหรับ Izumi และ Kii ที่ viewport 1280 × 720 แล้วพบว่าโหมดซูมคง artwork หลักเดิมไว้, แสดง marker ผู้เล่น, เผยป้ายชื่อแคว้นรอบตำแหน่ง และแสดง province brief แยกจาก timeline หลักอย่างชัดเจน การย้าย label เฉพาะพื้นที่ Kinai ลดการทับกันของ Settsu, Kawachi, Yamato และ Izumi ได้แล้ว

ตรวจซ้ำที่ viewport มือถือ 375 × 812 หลังย้าย label Iga และ Kii พบว่าป้าย Settsu, Iga, Kawachi, Yamato และ Izumi อ่านได้ใน canvas เดียวกันโดยไม่ทับกัน; Kii ถูกวางต่ำกว่า area ที่ซูมจับในกรณี focus Izumi ตามเจตนาที่ให้เห็นเฉพาะแคว้นรอบใกล้สุด ข้อมูลแคว้นและ historical note ยังคงอยู่ต่อจากแผนที่โดยไม่ล้นแนวนอน.

## References

[1] [Provinces of Japan — historical boundaries and relationship to han](https://en.wikipedia.org/wiki/Provinces_of_Japan)  
[2] [China Historical GIS — Japan datasets and historical map sources](https://chgis.fas.harvard.edu/data/japan/)  
[3] [Lavenberg Collection — Former Provinces of Japan](https://pages.uoregon.edu/jsmacollections/home/articles/ancient-provinces-of-japan.html)

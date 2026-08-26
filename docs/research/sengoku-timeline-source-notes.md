# บันทึกการตรวจแหล่ง Timeline เซ็นโกคุ

## Sengoku Shogun Map

วันที่ตรวจ: 26 สิงหาคม 2026

| URL ที่ตรวจ | ผลที่พบ | ใช้ใน catalog อย่างไร |
|---|---|---|
| `https://ufirst.jp/sengoku-map/en/1570` | หน้าปี 1570 แยกเหตุการณ์ตาม Spring, Month 4, Summer, Month 7, `7/30`, Month 8, Month 9, Month 10 และ Winter พร้อมขอบเขตพื้นที่/บุคคล/บางรายการมี source link | ใช้เป็น discovery และ cross-check ของ event title, year, region และ date precision; ไม่คัดลอกข้อความมาเป็นข้อมูลเกม |
| `https://ufirst.jp/sengoku-map/en/1467` | URL ถูก redirect ไปหน้า 1555 แสดงว่าหน้า public ไม่เปิดปี 1467 ผ่าน path นี้ | ห้ามถือว่าแหล่งนี้ครอบคลุม 1467–1615 ครบทั้งหมด ต้องหาหลักฐานจาก archive/academic sources เพิ่ม |
| `https://ufirst.jp/sengoku-map/en/1555` | แสดง event ระดับเดือนและ month-unknown พร้อม links ของเทศบาล/หน่วยงานท้องถิ่นสำหรับบางรายการ | ใช้เพื่อระบุว่า event ต้องเก็บ `month` หรือ `year` ตามที่แหล่งให้ ไม่แปลงเป็น exact date เอง |

ข้อสรุปเชิง implementation คือ record จาก source นี้จะเข้า `historicalEvents` ได้เฉพาะหลังมี citation ใน catalog และต้องคงค่า `precision` ตามแหล่ง. รายการ `7/30` ของ Anegawa ปี 1570 เป็นตัวอย่าง exact-date record; การถอยคาเนงาซากิเป็น month-level record จึงห้าม GM AI พูดวันเจาะจง.

## ผลตรวจ endpoint ข้อมูล

bundle ของแผนที่ระบุชื่อไฟล์ `sengoku.json` และ `countries.json` หลาย path. เมื่อทดสอบ `assets/map-data/sengoku.json` ได้ `404`; path `assets/sengoku.json` เปิด response แต่ไม่ให้ markdown ที่อ่าน field ได้. ดังนั้นในรอบนี้จะใช้หน้า year ที่เปิดอ่านได้เป็น cross-check เท่านั้น และจะไม่สร้างตัวดึงข้อมูลอัตโนมัติหรือถือว่า dataset ภายนอกเป็น source-of-truth จนกว่าจะยืนยัน field/licensing ผ่านเอกสารของเจ้าของแหล่ง.

## หมายเหตุเรื่อง “66 แคว้น”

ผลค้นหาพบการใช้ทั้งคำว่า **66 แคว้น** และ **68 แคว้น** ในสื่ออธิบาย Gokishichidō. คำอธิบายหนึ่งระบุว่า “66 国 2 島” เป็นการนับที่แยกอิกิและสึชิมะเป็น island provinces; อีกแหล่งสรุป 68 ประเทศในระบบ令制国. Catalog จึงจะเก็บ `coverageSet: "sengoku-66-plus-islands"` และไม่อ้างว่ารายชื่อ 68 entry ใน interactive map เป็น 66 โดยตรง. เอกสาร public จะระบุวิธีนับเสมอ และ validation จะตรวจ key ที่ canonical list กำหนด ไม่อนุมานจากจำนวน label บนแผนที่.

## Findings เพิ่มสำหรับ seed catalog

| ปี | Finding ที่อ่านจากหน้า year | Precision ที่ catalog ต้องเก็บ |
|---|---|---|
| 1582 | หน้าปีสรุป Honnō-ji, การศึกยามาซากิ และการล่มของทาเคดะ; แสดง Tokugawa รับ Suruga เป็น month 3 และ Fall of Takatō Castle เป็น `3/25` | year, month 3 และ exact-date เฉพาะ record ที่ระบุ `3/25` |
| 1600 | หน้าปีสรุปการเผชิญหน้าระดับชาติของ Eastern/Western armies; Fushimi siege เดือน 7, fall วันที่ `8/1`, Gifu วันที่ `8/23`, Ueda เดือน 9 และ Sekigahara วันที่ `10/21` | รักษา month/exact-date ตามแต่ละ record; ห้าม GM ยกความละเอียดของ summary ระดับปีให้เป็นวัน |

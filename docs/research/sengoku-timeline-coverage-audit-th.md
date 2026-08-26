# รายงาน Coverage: Offline Sengoku Timeline Catalog

**วันที่ตรวจ:** 26 สิงหาคม 2026  
**ขอบเขต:** ค.ศ. 1467–1615, ชุด `Gokishichidō` 66 แคว้น และเกาะอิกิ/สึชิมะแยกต่างหาก  
**วิธีตรวจ:** `pnpm exec tsx scripts/timeline-audit.mjs`

> Catalog นี้เป็น **ชุดข้อมูลอ้างอิงที่คัดแล้ว** ไม่ใช่การเล่าเหตุการณ์สมมติให้ครบทุกปี เมื่อหลักฐานที่ตรวจแล้วไม่พบ record ที่เหมาะสม ปีนั้นจะยังอยู่ใน yearly ledger ด้วยสถานะ `no-reviewed-event` แทนการให้ GM AI สร้างประวัติศาสตร์ขึ้นเอง

## สรุปการตรวจ

| ตัวชี้วัด | ผลตรวจ |
|---|---:|
| ช่วงปีใน yearly ledger | 1467–1615 (149 ปี) |
| ปีที่มี record ผ่านการตรวจ | 67 ปี |
| ปีที่ไม่มี record ตรวจแล้ว | 82 ปี |
| Historical records ทั้งหมด | 111 รายการ |
| สงคราม | 26 รายการ |
| เหตุการณ์การเมือง/สังคม | 40 รายการ |
| ภัยพิบัติ/สภาพแวดล้อม | 45 รายการ |
| Source labels ที่แยกได้ | 52 รายการ |
| Coverage ของ province/island keys | 68/68; ไม่มี key ขาด |

ตัวเลขนี้หมายถึงแต่ละ key มีอย่างน้อยหนึ่ง record ที่มี source ใน catalog ไม่ได้หมายความว่าแต่ละแคว้นมีเหตุการณ์สำคัญทุกปี และไม่ได้อนุญาตให้ AI สรุปว่า “ไม่มีอะไรเกิดขึ้น” ในความหมายทางประวัติศาสตร์

## Date precision และกติกา GM

| Precision | จำนวน | กติกาการใช้ |
|---|---:|---|
| `exact-date` | 35 | ใช้ได้ต่อเมื่อ campaign มี `historicalDate` ที่ผู้เล่นยืนยัน; scene day ที่ engine สร้างขึ้นเองใช้ไม่ได้ |
| `month` | 10 | ใช้เป็นบริบทของเดือนและฤดู ไม่ใช้เป็นวันตายตัว |
| `season` | 1 | ใช้เป็นสีสันของฤดูกาลเท่านั้น |
| `year` | 65 | ใช้เป็นบริบททั้งปี ไม่ผูกกับวันในฉาก |

การกั้น date precision นี้จำเป็นเพราะ timeline campaign เดิมนับยาม/วันในฉากเพื่อกติกาเกม ไม่ใช่ปฏิทินพลเรือนที่พิสูจน์แล้ว จึงห้าม GM ใช้ตัวนับนั้นอ้างวันของศึกหรือภัยพิบัติจริงโดยตรง

## Source hierarchy ที่ใช้

แหล่งหลักของ catalog คือหน้า timeline รายปีของ Sengoku Shogun Map ซึ่งถูกใช้เป็นดัชนีเหตุการณ์ระดับชาติและแคว้น แต่ทุก record ที่เพิ่มจากภัยพิบัติหรือแคว้นที่ไม่มีในดัชนีต้องคง URL และ label ของแหล่งท้องถิ่น/สถาบันไว้ใน record โดยตรง [1] ข้อมูลภัยพิบัติมาจากฐานของสถาบัน Historiographical Institute มหาวิทยาลัยโตเกียว ซึ่งเผยแพร่พร้อมกรอบสิทธิ์ CC BY 4.0 [2] ส่วน record ระดับแคว้นใช้ฐานวัฒนธรรมของหน่วยงานในพื้นที่เมื่อหาได้ เช่น ทากายามะ ซาโดะ ซูโมโตะ โทบะ ไมซูรุ นากาซากิ ยามางูจิ และนครเกียวโต [3] [4] [5] [6] [7] [8] [9] [10] [11]

Catalog ไม่ได้คัดลอกบทความยาวของแหล่งอ้างอิง แต่สรุปเป็นข้อความสั้นสองภาษา พร้อมปี/precision/region keys/source. หากแหล่งกล่าวถึงเรื่องเล่าหรือข้อสันนิษฐาน ระบบระบุว่าเป็นข้อถกเถียง หรือไม่เพิ่มส่วนที่เกินหลักฐานใน record.

## ขอบเขตความปลอดภัยของข้อมูล

Record ทุกตัวส่งเข้าสู่ GM ในฐานะ **historical context only**. ระบบไม่ให้ record ใดเปลี่ยน faction, ที่ดิน, เงิน, คนในความสัมพันธ์, เรือ, อาวุธ หรือเป้าหมายของผู้เล่นเอง เหตุการณ์ระดับชาติอาจปรากฏเป็นข่าว บรรยากาศ หรือผลกระทบทางอ้อมเท่านั้น ขณะที่ local record ใช้เพียงเมื่อแคว้นและช่วงเวลาของ campaign สอดคล้องกัน

งานวิจัยต่อจากนี้ควรเติมเฉพาะ record ใหม่ที่ผ่าน source/date review และต้องรัน audit script กับ regression เดิมทุกครั้ง ห้ามแก้ `no-reviewed-event` เพื่อทำให้ catalog ดูเต็มเทียม

## References

[1]: https://ufirst.jp/sengoku-map/en/1570 "Sengoku Shogun Map"
[2]: https://www.hi.u-tokyo.ac.jp/collection/digitalgallery/disaster_events/about "University of Tokyo Historiographical Institute: Medieval Japanese Weather Disaster Chronology"
[3]: https://www.city.takayama.lg.jp/machihaku/1005305/1020397.html "Takayama City Museum: Kanamori Nagachika sites"
[4]: https://www.city.sado.niigata.jp/site/mine/ "Sado City: Sado Island Gold Mines"
[5]: https://awajishimamuseum.com/shirasujo/ "Awaji Cultural History Museum: Shirasu Castle"
[6]: https://www.city.toba.mie.jp/isan/7686.html "Toba City: Kuki Yoshitaka and the Kuki navy"
[7]: https://yuragawa-maizuru.edumap.jp/tiiki "Maizuru Municipal Yuragawa Elementary School: Local history"
[8]: https://www.pref.nagasaki.jp/bunkadb/index.php/view/532 "Nagasaki Prefecture Cultural Property Database: Katsumoto Castle"
[9]: https://bunkazai.pref.yamaguchi.lg.jp/support/theme/tyousyuu/tnen.html "Yamaguchi Prefecture: Chōshū domain chronology"
[10]: https://ja.kyoto.travel/tourism/single02.php?category_id=9&tourism_id=4 "Kyoto City Official Travel Guide: Funaokayama battlefield site"
[11]: https://yamaguchi-city.jp/history/ouchi_chronology.html "Yamaguchi City Official Tourism: Ōuchi clan chronology"

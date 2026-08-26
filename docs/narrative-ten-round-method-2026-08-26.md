# วิธีรีไฟน์ร้อยแก้ว AI GM สิบรอบ

## ครูหลักและขอบเขต

การทดลองนี้ใช้ `sengoku-novelizer` เป็นมาตรฐานหลัก ไม่ใช่การฝึกโมเดลถาวร การปรับมีผลเฉพาะ prompt, quality gate และ corpus ของ Dust & Fire เท่านั้น

สิ่งที่สกิลกำหนดคือร้อยแก้วไทยกลางแบบนิยาย, มุมมองบุรุษที่สามใกล้ชิด, บทสนทนาต้องติดกับท่าทางและฐานะ, การเก็บเหตุการณ์เดิมโดยไม่เปิด mechanics, และการระบุปี–สถานที่–ฤดูกาล–สถานะทางสังคมก่อนเขียน

## ข้อค้นพบที่นำมาใช้

| หลักฐาน | สิ่งที่ใช้กับ prompt/validator |
|---|---|
| National Museum of Japanese History, *Documents from Medieval Japan: Functions and Styles* | เอกสารในญี่ปุ่นยุคกลางมีความหมายทั้งเนื้อหา รูปแบบ วัสดุ ขนาด การส่งมอบ การเก็บรักษา และความครอบครอง จึงใช้กระดาษ หมึก พู่กัน รอยพับ ตรา และผู้ถือเอกสารเป็นรายละเอียดเชิงวัตถุได้ แต่ห้ามสมมติกฎหมายท้องถิ่นหรือพิธีเฉพาะถิ่น |
| World History Encyclopedia, *Daily Life in Medieval Japan* | ใช้ข้อสังเกตระดับกว้างเรื่องชนชั้น สภาพการเดินทาง การขนส่งทางน้ำ/บก ตลาด เครื่องแต่งกาย และวัสดุในชีวิตประจำวันเป็นภาพฉาก ไม่ใช้แทนหลักฐานเฉพาะตำบล |
| Yale Library, *Japanese Studies Primary Sources in Western Languages: Pre-1600* | ใช้เป็นแนวทางลำดับหลักฐาน: เมื่อจะอ้างเหตุการณ์เฉพาะ ต้องยกระดับไปยังแหล่งปฐมภูมิ/ฐานคำศัพท์ประวัติศาสตร์ ไม่สร้างชื่อสำนักงาน กฎหมาย หรือธรรมเนียมเฉพาะจากความทรงจำ |

## Rubric 100 คะแนน

| มิติ | คะแนน | ผ่านเมื่อ |
|---|---:|---|
| ไทยแบบนิยายและจังหวะประโยค | 25 | มีภาพสัมผัส กริยามีผู้กระทำ บทสนทนาติดท่าทาง ไม่มีโครงแปลตรงหรือรายงานระบบ |
| ยุคสมัยและวัตถุ | 20 | ไม่มีศัพท์/วัตถุสมัยใหม่ และไม่สมมติกฎเฉพาะถิ่นเกินหลักฐาน |
| สถานะ อำนาจ และน้ำเสียง | 15 | น้ำเสียงต่างกันตามโรนิน พ่อค้า ผู้คุม ชาวบ้าน และมองเห็นความสัมพันธ์เชิงอำนาจ |
| ความเป็นฉาก | 15 | มีรายละเอียดกายภาพ/ความกดดัน/ผลที่จับต้องได้ ไม่ใช่สรุปเหตุการณ์ |
| ความซื่อสัตย์ต่อ state และขอบเขตการเปิดเผย | 15 | ไม่เปลี่ยนผล deterministic ไม่บอกข้อมูลลับ ไม่เปิด mechanics |
| ความกระชับและทางเลือกถัดไป | 10 | สามย่อหน้า ไม่ฟุ่มเฟือย ความกดดันชัด และ choice ต่อเนื่องกับฉาก |

การรับแนวทาง: ต้องได้คะแนนรวมสูงกว่า baseline และไม่มี hard fail: modernism, period-anachronism, game-artifact หรือ private-disclosure

## แหล่งอ้างอิง

1. National Museum of Japanese History. [Documents from Medieval Japan: Functions and Styles](https://archive.rekihaku.ac.jp/english/exhibitions/project/old/131008/index.html)
2. Mark Cartwright. [Daily Life in Medieval Japan](https://www.worldhistory.org/article/1424/daily-life-in-medieval-japan/)
3. Yale University Library. [Japanese Studies Primary Sources in Western Languages: 1. Pre-1600](https://guides.library.yale.edu/Japan/English)

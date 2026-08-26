# GM Canon, Mission Threads และ Timeline Guardrails

เอกสารนี้กำหนดขอบเขตที่บังคับใช้ได้ของ AI GM หลังการทอยใน **Dust & Fire**. GM เป็นผู้เสนอข้อความเชิงโครงสร้างและร้อยแก้ว แต่ deterministic engine เป็นผู้ตัดสินว่า state ใดเปลี่ยนได้จริง ดังนั้น GM ไม่สามารถเขียนทับผล 2d12, Total, DN, inventory, เครดิต, หรือข้อเท็จจริงประวัติศาสตร์เองได้.

> **หลักสำคัญ:** เหตุการณ์จริงเป็นบริบทของโลก ไม่ใช่คันโยกที่บังคับผู้เล่นให้เป็นตัวละครสำคัญของประวัติศาสตร์.

## Mission Thread Contract

แคมเปญมี **Main Thread** ที่เปิดอยู่ได้หนึ่งรายการ และ **Side Leads** ที่เปิดเผยต่อผู้เล่นได้ไม่เกินสองรายการ. Side Lead ที่ GM สร้างใหม่ถูกเก็บเป็น `hidden` ก่อน จึงไม่ใช่รายการเควสที่ผู้เล่นต้องกดรับ; จะปรากฏในหน้า Missions เมื่อ GM ส่ง directive `reveal_side` และ engine ตรวจเพดานแล้ว.

| Directive | เงื่อนไขที่ engine ยอมรับ | ผลที่ผู้เล่นเห็น |
|---|---|---|
| `keep`, `advance`, `resolve`, `fail` | target ต้องเป็น thread ที่เปิดอยู่ | ความคืบหน้าของ thread เดิม |
| `replace_main` | target ต้องเป็น Main Thread ปัจจุบัน และต้องมี replacement | Main Thread เดิมเป็น `retired`; Main Thread ใหม่เป็น `elevated` และต้องใช้ progress 3 |
| `create_hidden_side` | จำนวน Side Lead ที่เปิดอยู่/ซ่อนอยู่ยังไม่ถึงเพดาน 2 | ไม่แสดงทันที |
| `reveal_side` | target เป็น Side Lead ที่ hidden และช่อง visible ยังเหลือ | แสดง “ร่องรอยรองปรากฏขึ้น” ในหน้า Missions |
| `retire_side` | target เป็น Side Lead ที่ยังเปิดอยู่ | ยุติร่องรอยโดยเก็บเหตุผลไว้ใน save |

การใช้ `replace_main` ถูกออกแบบสำหรับกรณีที่ผู้เล่น **เบนจาก Main Thread อย่างมีนัยสำคัญ**. หลังผลทอยได้รับการบันทึกแล้ว ระบบจะแสดงข้อความว่า Main Thread เปลี่ยน พร้อมเหตุผลที่ GM ส่งมา. Thread ใหม่ต้องตามทางที่ผู้เล่นเลือก แต่ระดับความท้าทายยกระดับโดย deterministic progress requirement ไม่ใช่การให้ GM ดัดแปลงแต้มทอย.

## Canon Consistency

ทุก directive ผ่าน guard ก่อนบันทึก Local Save. Guard จะคงภารกิจเก่าไว้หาก directive ไม่อ้าง target ที่ถูกต้อง, เกินเพดาน thread, หรือเสนอการกระทำรุนแรงที่พุ่งตรงไปยังชื่อผู้ที่ถูกคุ้มครองโดย open thread. ตัวอย่างเช่น หาก Main Thread คือ “ช่วย A ให้เชื่อใจ” GM ไม่อาจสร้าง Side Lead ที่สั่ง “ฆ่าลูกชายของ A” ได้ เพราะชื่อ A อยู่ใน `protectedTerms` และข้อความใหม่มีเจตนารุนแรง.

กฎนี้เป็น **safety floor** ไม่ใช่ตัวแทนความเข้าใจเรื่องราวทั้งหมด. Prompt ยังกำหนดให้ GM ยึด memory, relationship, mission และ historical brief; reducer ฝั่ง engine เป็นด่านสุดท้ายสำหรับความขัดแย้งแบบที่ตรวจเป็นโครงสร้างได้.

## Historical Date Gate และ Offline Catalog

catalog อยู่ใน `client/src/lib/historicalTimeline.ts` และ source-controlled พร้อม runtime lookup แบบ offline. Catalog แยก `battle`, `event`, และ `disaster`; ทุก record เก็บปี, date precision, region keys และ URL source. Year ledger ครอบคลุมทุกปี **1467–1615** แต่ปีที่ยังไม่มี record ที่ตรวจแล้วระบุ `no-reviewed-event` อย่างชัดเจน แทนการเติมเรื่องแต่ง.

| สถานะวันของ campaign | สิ่งที่ GM ทำได้ | สิ่งที่ GM ห้ามทำ |
|---|---|---|
| Synthetic scene day เช่น `1570 · Summer · day 12` | ใช้ record ระดับปี/ฤดู/เดือนเป็นฉากหลังอย่างระมัดระวัง | กล่าวว่าศึกหรือภัยพิบัติ named event กำลังเกิด “วันนี้” |
| `historicalDate` ที่ผู้เล่นยืนยัน เช่น `1570-07-30` | ใช้เฉพาะ `exactRecords` ที่ปี/เดือน/วันตรงกัน | เลื่อนเหตุการณ์ exact-date ไปวันอื่น หรือทำให้ผู้เล่นถูกบังคับเข้าร่วม |

ระบบยังไม่มี date picker ที่กรอก `historicalDate` ให้ campaign ใหม่โดยอัตโนมัติ. นี่เป็นข้อจงใจ: calendar เดิมใช้ 30 วันต่อฤดูเพื่อ gameplay และไม่ใช่ปฏิทินจริง จึงไม่ควรนำ scene day ไปเทียบกับวันจริงโดยพลการ.

## ขอบเขตรางวัล ผลกระทบ และโลก

GM ห้ามมอบรางวัลเชิงตัวเลขหรือแก้ inventory ผ่าน directive. รางวัล ผลกระทบ เมือง สถานที่ ผู้คน อากาศ และภัยพิบัติต้องมาจาก historical brief หรือ social fact card ที่ส่งให้ในรอบนั้น. หากไม่มีหลักฐานรองรับ GM ต้องระบุเป็น **campaign fiction** ที่มีขอบเขต ไม่แต่งยอดผู้เสียชีวิต กฎหมายท้องถิ่น สภาพทั้งแคว้น หรือภัยพิบัติชื่อเฉพาะขึ้นมาเอง.

ข้อมูลการอ้างอิงเริ่มจากหน้า year view ของ Sengoku Shogun Map ซึ่งแสดง event พร้อมความละเอียดปี/เดือน/วันแตกต่างกัน และจากฐานภัยพิบัติของสถาบันประวัติศาสตร์ มหาวิทยาลัยโตเกียว. Catalog รักษา date precision ของแหล่ง ไม่แปลง month-level เป็น exact date [1] [2].

## Regression ที่ต้องผ่าน

ชุด regression ยืนยันว่า Local Save เก่าถูก normalize ให้มี Main Thread เปิดได้หนึ่งรายการ, Side Leads ที่เกินเพดานถูกซ่อน, `replace_main` ไม่เปลี่ยนผลทอยเดิม, directive รุนแรงที่ขัด protected term ถูกปฏิเสธ, ledger มี 149 ปี และ exact-date event ถูกปิดจนกว่าจะมี `historicalDate` ที่ผู้เล่นยืนยัน.

## References

[1]: https://ufirst.jp/sengoku-map/en/1570 "Sengoku Shogun Map — 1570"
[2]: https://www.hi.u-tokyo.ac.jp/collection/digitalgallery/disaster_events/about "University of Tokyo Historiographical Institute — Medieval Weather and Disaster History"

# Visual Review — Province Map

> วันที่ตรวจ: 21 สิงหาคม 2026
>
> Route: `/?review=home` และ `/?review=home&rail=collapsed`
>
> Viewport: 1280 × 720

## ผลตรวจ

แผนที่แคว้นใหม่แสดงใน Campaign Command ได้ทั้งเมื่อ Ledger Spine เปิดเต็มและเมื่อย่อ rail แล้ว พื้นที่แผนที่ยังรักษาลำดับสายตาเป็นหัวข้อแผนที่ → แผงตำแหน่งปัจจุบัน → marker → Story Desk ไม่มี horizontal overflow ที่เห็นได้ใน viewport ตรวจ และ CTA/Story Desk ยังอยู่ในแนวเดียวกับแผนที่

แผงตำแหน่งแสดงสถานที่จริงของแคมเปญ, แคว้น, คำบรรยายภูมิประเทศ และ War Shadow จาก GameState สำหรับเซฟตัวอย่างซาไก ระบบใช้ **แคว้นอิซุมิ**, **ชายขอบเมืองท่าริมทะเล** และย่อหน้าที่แยกบริบทประวัติศาสตร์ของเมืองท่าออกจากเซฟเฮาส์สมมติอย่างชัดเจน

มีการตรวจเพิ่มที่ `/?review=home&mapRegion=Kii` ซึ่งเป็น override ที่ทำงานเฉพาะ review route ไม่แตะ Local Save ของผู้เล่น แผนที่เปลี่ยน marker เป็นกิอิและแผงตำแหน่งแสดง **แคว้นกิอิ** กับ **ทางใต้และเชิงป่าริมเนิน** ถูกต้อง ทั้งสอง review แสดงเฉพาะชื่อแคว้นใน neighborhood ของพื้นที่ปัจจุบัน เพื่อหลีกเลี่ยงฉลากซ้อนทับและยังคงเห็นบริบทสัมพัทธ์รอบตัวละคร

ตรวจเพิ่มเติมที่ `/?review=home&mapRegion=Omi` และ `/?review=home&mapRegion=Musashi` บน viewport 1280 × 720 ทั้งสอง route เปลี่ยนทั้งหัวข้อมูลและแผงตำแหน่งตาม GameState: โอมิแสดง **Lake road and foothill passage** และมูซาชิแสดง **Wide plain and river crossing**. ระหว่างตรวจพบว่า marker โอมิซ้อนกับแผงตำแหน่งและ marker มูซาชิอยู่ต่ำเกิน viewport แรก จึงปรับตำแหน่ง marker ให้ปรากฏชัดโดยไม่เปลี่ยนข้อมูลหรือพื้นที่ Local Save แล้วตรวจภาพซ้ำเรียบร้อย

## ขอบเขตที่ยืนยัน

แผนที่เป็นภาพอ่านบริบทของแคมเปญ ไม่อ้างว่าเป็นเส้นเขตแดนสำรวจหรือแผนที่ประวัติศาสตร์สมบูรณ์ ชื่อ Settsu, Kawachi, Izumi, Yamato และ Kii ทำหน้าที่ให้ผู้เล่นเห็นตำแหน่งสัมพัทธ์รอบแคมเปญซาไกเท่านั้น ส่วนเส้นทาง รายละเอียดภูมิประเทศ และที่ซ่อนของตัวละครอยู่ภายใต้ Historical Fence แบบ campaign fiction ตาม Lore Bible

## หลักฐาน regression

1. `client/src/features/story/StoryMap.test.tsx` ตรวจข้อความแผนที่แคว้นอิซุมิ/กิอิ และตรวจ marker/terrain เฉพาะสำหรับทุกภูมิภาคที่ตัวสร้างแคมเปญและ starter templates รองรับ
2. `client/src/pages/Home.review-query.test.ts` ตรวจว่า `mapRegion` ใช้ได้เฉพาะ review route และจะไม่อ่าน URL ปกติของผู้เล่น
3. `client/src/features/story/StoryMap.layout.test.ts` ตรวจ CSS contract สำหรับ grid, rail compact, `province-map` containment และ location dossier บนจอแคบ
4. Full regression suite ผ่าน 72 tests ใน 21 test files หลังแก้แผนที่

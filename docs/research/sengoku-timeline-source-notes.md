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

## Source hierarchy ที่ตรวจเพิ่ม

| ลำดับ | แหล่ง | สิ่งที่ใช้ได้ | ข้อควรระวังในการลง catalog |
|---:|---|---|---|
| 1 | Tokyo Historiographical Institute, *Japanese Medieval Weather and Disaster History Chronology* | ฐาน open data CC BY 4.0 ที่อธิบายว่ารวบรวมข้อมูลภัยลม น้ำ แล้ง แมลง ผลผลิตต่ำ อดอยาก และโรคระบาดกว่า 14,000 รายการเรียงตามวัน จากคริสต์ศตวรรษที่ 10 ถึงต้นศตวรรษที่ 17 | ผู้จัดทำเตือนเองว่าข้อมูลจดหมายเหตุและพงศาวดารต้อง cross-check; วันที่ไม่ทราบถูกวาง placeholder เพื่อการเรียง จึงต้องเก็บ precision ตาม field ต้นทาง ไม่ใช่ตีเป็น exact date |
| 2 | Merkmark, *Complete Sengoku Chronology* | ให้โครงช่วง 1467–1615 โดยมีหน้าช่วง 1568–1582, 1582–1590 และ 1590–1616 เหมาะเป็นดัชนีค้น record ต่อปี | ใช้เป็น index/cross-check เท่านั้นจนตรวจ source ระดับ record และเงื่อนไขนำข้อมูลกลับมาใช้ได้ |
| 3 | Sengoku Shogun Map | หน้า year view รวม event ระดับชาติ/พื้นที่และบางรายการวัน/เดือน รวม citation สถาบันท้องถิ่นบนหน้า 1600 | field data endpoint ที่ลองยังไม่เปิดให้ดึงตรง; ใช้เฉพาะหน้าที่ตรวจอ่านแล้วและ URL ปีเป็น citation |
| 4 | Hirosaki City Library disaster chronology | ให้ disaster records ของ Mutsu/Tsugaru เช่น 1468 flood/famine, 1473 famine, 1571 Iwaki volcanic sign, 1583 poor harvest, 1597–1605 Iwaki eruptions, 1611 crop failure/tsunami และ 1615 poor harvest | เป็นแหล่งพื้นที่ตอนเหนือ ไม่ใช่ตัวแทนทั้งประเทศ และบันทึกมีความแม่นต่างกัน |
| 5 | Touken World battle chronology | ดัชนีเหตุการณ์/ศึกตามปี เช่น Ōnin 1467, Chōkyō 1487, Funaokayama 1511, Daimotsu 1531, battles 1553–1572, Ichijōdani/Odani 1573, Nagashino 1575, Honnō-ji 1582, Shizugatake 1583, Komaki–Nagakute 1584, Shikoku 1585, Kyūshū 1587, Korean campaigns 1592/1597 และ Sekigahara 1600 | ใช้เป็นดัชนี cross-check; source record ใน catalog ต้องรักษาปี/เดือน/วันเฉพาะที่หน้าหรือแหล่งอีกชั้นระบุ |

## Batch 1467–1499: records ที่ cross-check แล้ว

| ปี/precision | ระดับ | Record ที่ใช้ได้ | Province/region key | หลักฐาน |
|---|---|---|---|---|
| 1467–1477 / year range | national + Yamashiro | Ōnin War: civil war in Kyōto between Hosokawa- and Yamana-led factions; succession dispute triggered conflict and the war ended in 1477 | yamashiro; national | Britannica [exact range/location] + JREF [political background] |
| 1468 / month only | disaster + Mutsu | Wind/rain/flood and famine record for Mutsu; calendar date must stay month-only | mutsu | Hirosaki City Library disaster chronology |
| 1473 / year only | national + Yamashiro | Hosokawa Katsumoto and Yamana Sōzen died; Yoshihisa appointed shōgun; hostilities in the capital continued | yamashiro; national | JREF + Britannica |
| 1473 / year only | disaster + Mutsu | Famine record | mutsu | Hirosaki City Library disaster chronology |
| 1477 / year only | Kantō + Musashi | Nagao Kageharu seized Ikatsuko Castle, putting pressure on Uesugi Akisada during the Kyōtoku conflict | musashi | Touken World Kyōtoku War article |
| 1479 / year only | Kantō | Peace between Ashikaga Shigeuji and Uesugi Akisada ended the Kyōtoku War according to the cited overview | Kantō cluster, do not force one province | Touken World Kyōtoku War article |
| 1487 / year only | Kantō / Musashi | Chōkyō conflict began; use only its year/region until a more granular source record is checked | musashi; Kantō cluster | Touken World battle chronology/index |

### Data-entry rule from this batch

The catalog may link a national event to a province only if the inspected source names that location. General statements that a conflict spread into surrounding provinces must remain a regional/national context card rather than being copied into every province. No record above supplies a player-specific consequence.

## Batch 1500–1539: records ที่ cross-check แล้ว

| ปี/precision | ระดับ | Record ที่ใช้ได้ | Province/region key | หลักฐาน |
|---|---|---|---|---|
| 1507 / year only | Kinai political | Hosokawa Masamoto was assassinated, intensifying the Hosokawa succession conflict | yamashiro/kinai context | Touken World Funaokayama + Daimotsu articles |
| 1511 / month only | Yamashiro | Battle of Funaokayama took place around Funaokayama in Kyōto in August; conflict followed Hosokawa succession and shogunal rivalry | yamashiro | Touken World Funaokayama article |
| 1526 / year only | Tamba/Tango + Kinai | Hatano Tanemichi and Yanamoto Kataharu rose against Hosokawa Takakuni; the catalog must preserve this as a regional lead, not a national outcome | tango + kinai context | Touken World Daimotsu article |
| 1527-02-11 / exact | Yamashiro | Hatano/Hosokawa Harumoto forces met at Yamazaki Castle | yamashiro | Touken World Daimotsu article |
| 1527-02-12 / exact | Yamashiro | Battle of Katsuragawa followed; Harumoto’s side drove Takakuni from Kyōto | yamashiro | Touken World Daimotsu article |
| 1530 / year only | Settsu | Takakuni and Uragami Muramune captured Kannoji, Tomatsu, and Daimotsu castles according to the overview source | settsu | Touken World Daimotsu article |
| 1531 / year only | Settsu | Daimotsu Kuzure ended with Harumoto’s side prevailing and Takakuni’s defeat/death; source places the decisive conflict in the Osaka/Tennoji–Daimotsu area | settsu | Touken World Daimotsu article |
| 1532 / year only | Kinai | Source describes the death of Miyoshi Motonaga within an Ikkō-ikki conflict; do not infer a single exact location/date from this overview | kinai context | Touken World Daimotsu article |
| 1537 / year only | Kinai | Hosokawa Harumoto’s kanrei appointment appears in the inspected overview; use as political context only | yamashiro/kinai context | Touken World Daimotsu article |

### Cross-source note

The Britannica and Japan Experience overviews are appropriate for era-level framing but do not add exact local dates for these records. They should not be used to upgrade the source precision of the individual Kinai conflict entries.

## Batch 1540–1574: records ที่ cross-check แล้ว

| ปี/precision | ระดับ | Record ที่ใช้ได้ | Province/region key | หลักฐาน |
|---|---|---|---|---|
| 1551 / year only | Suō/Nagato | Sue Harukata’s coup forced Ōuchi Yoshitaka’s death at Dainei-ji; this is context for the Mōri–Sue conflict | suwo + nagato | Touken World Itsukushima article |
| 1553–1564 / range | Shinano/Etchūgo | Kawanakajima series concerns Takeda Shingen and Uesugi Kenshin over northern Shinano; source explicitly states the overall winner is unresolved | shinano; echigo context | Touken World Kawanakajima article |
| 1553-09-01 / exact | Shinano | Uesugi entered northern Shinano in the Fuse fighting, then withdrew September 20; catalog can retain these dates only for the source-specific campaign note | shinano | Touken World Kawanakajima article |
| 1555 / year only | Aki | Battle of Itsukushima between Mōri Motonari and Sue Harukata | aki | Touken World Itsukushima article |
| 1555-10-01 / exact | Aki | Mōri attack began at dawn on Itsukushima; Sue Harukata’s forces collapsed and he died | aki | Touken World Itsukushima article |
| 1560-05-19 / exact | Owari | Battle of Okehazama: Oda Nobunaga defeated Imagawa Yoshimoto’s force in Owari | owari | Touken World Okehazama article; Britannica cross-context |
| 1561-09-09 / exact, contested tactical narrative | Shinano | Fourth Kawanakajima campaign: source gives the date but also warns much of its famous tactical account is disputed due to source problems | shinano | Touken World Kawanakajima article |
| 1564 / year only | Shinano/Hida | Fifth Kawanakajima confrontation ended after a two-month standoff; source does not support claiming a decisive battle | shinano; hida context | Touken World Kawanakajima article |
| 1570-04 / month only | Echizen/Ōmi | Kanegasaki conflict and Azai turn against Oda should remain month-only in the catalog from this source | echizen + omi | Touken World Anegawa article |
| 1570-06 / month only | Ōmi | Battle of Anegawa took place along the Anegawa in Ōmi; Oda–Tokugawa defeated Azai–Asakura forces according to the overview | omi | Touken World Anegawa article |
| 1573 / year only | Echizen/Ōmi | The same source links the destruction of the Asakura at Ichijōdani and the Azai at Odani to 1573; exact day is not supplied in the inspected page | echizen + omi | Touken World Anegawa article |

### Evidence boundary

The Kawanakajima source itself emphasizes major source uncertainty. Catalog records may state the dated campaign/region but must not assert the famous single combat, exact casualty totals, the “woodpecker” plan, or a decisive winner as settled fact. The Okehazama article includes literary details attributed to *Shinchō kōki*; the GM must receive only the event card unless the record separately identifies an exact primary-text claim.

## Batch 1575–1615: records ที่ cross-check แล้ว

| ปี/precision | ระดับ | Record ที่ใช้ได้ | Province/region key | หลักฐาน |
|---|---|---|---|---|
| 1575-06-28 / exact | Mikawa | Battle of Nagashino: Oda–Tokugawa relieving army defeated Takeda forces near Nagashino; date and Mikawa location are explicit | mikawa | Britannica Nagashino article |
| 1582-06-21 / exact | Yamashiro | NPS timeline dates Akechi Mitsuhide’s betrayal and Nobunaga’s death in a Kyōto temple; this is a cross-checkable national context event | yamashiro | U.S. National Park Service Sekigahara Timeline |
| 1584 / month range | Owari/Mikawa | Komaki–Nagakute campaign is listed as March–November in the battle chronology; keep its date as range | owari + mikawa | Touken World battle chronology |
| 1585 / month range | Shikoku | Shikoku campaign is listed as June–August; province-level effects must not be inferred beyond records that name the relevant province | shikoku regional context | Touken World battle chronology |
| 1587 / year only | Kyūshū | Kyūshū campaign recorded in battle chronology; source list does not provide a single precise day in inspected extract | kyushu regional context | Touken World battle chronology |
| 1592-05 to 1598-12 / range | national/external | NPS dates the Korea invasion as May 1592–December 1598 and describes it as a prolonged war; it must be presented as external/national context, not a local player event | national | U.S. National Park Service Sekigahara Timeline |
| 1598-09-18 / exact | national | Toyotomi Hideyoshi died; regency arrangement becomes national context in the source timeline | national | U.S. National Park Service Sekigahara Timeline |
| 1600-08-27 to 1600-09-06 / exact range | Yamashiro | Western Army siege of Fushimi Castle is dated in NPS timeline | yamashiro | U.S. National Park Service Sekigahara Timeline |
| 1600-10-21 / exact | Mino | Battle of Sekigahara: Eastern and Western Armies clashed near Sekigahara and Ieyasu prevailed | mino | U.S. National Park Service Sekigahara Timeline |
| 1603-03-24 / exact | national | Emperor bestowed shogun title upon Ieyasu, formally beginning Tokugawa shogunate | national | U.S. National Park Service Sekigahara Timeline |
| 1614-11 to 1615-01 / month range | Settsu | Siege of Osaka began; the source identifies destruction of the Toyotomi remnant in this campaign | settsu | U.S. National Park Service Sekigahara Timeline |
| 1615 / year only | Settsu | Fall of Osaka Castle: PBS timeline places final fall in June and says Hideyori and his mother died; use year-only unless calendar conversion is separately sourced | settsu | PBS Japan Timeline |

### Date-reconciliation warning

Sources sometimes display events as a Gregorian date while Japanese chronicles use a lunisolar date. The catalog must store the cited date convention and must not silently substitute a different date. The NPS date for the Kyōto betrayal and the many commonly cited Japanese calendar dates must therefore remain source-labelled rather than be merged into one “exact date” fact without a conversion source.

## Provincial/disaster source acquisition assessment

| Source | Coverage/value | Reuse decision |
|---|---|---|
| Merkmark, *Complete Sengoku Chronology* | States 1467–1615 coverage and has country/province overview pages, but is an independently operated chronology; the inspected landing page does not grant a reuse license | Use as a **research index and citation link only**. Do not copy its prose or bulk-ingest its records. Each catalog fact still needs an independently citable source or a source-permitted record. |
| University of Tokyo Historiographical Institute, *Japanese Medieval Weather and Disaster History Chronology* | More than 14,000 weather/disaster/famine/epidemic source entries across roughly the 10th–early 17th centuries, carrying regional and original-source metadata | Permitted as an open dataset under CC BY 4.0 with attribution. It is the preferred source for disaster records, but extraction must preserve its date convention, regional label, original-source information, and the chronology’s own caution about historical-source criticism. |
| Waseda University historical timeline | Provides a high-level chronological index, but inspected extraction does not expose enough record detail for province-level database ingestion | Use only as a navigation/cross-check resource until individual citable records are inspected. |

### Provincial coverage rule

“Coverage for all 66 provinces” means the catalog carries every canonical province as a lookup key and reports whether it has a reviewed record. It does **not** permit inventing an event for a province-year with no inspected evidence. A province may legitimately display `no-reviewed-event` while research continues; the GM must then use local campaign context rather than fabricate regional history.

### Coverage audit — current reviewed-event catalog

The current seed references 36 of the project’s 68 tracked keys (66 provinces plus Iki and Tsushima). The remaining 32 must stay explicitly unfilled until sourced: **Awaji, Bingo, Bitchū, Bizen, Dewa, Echigo, Etchū, Hida, Hōki, Iga, Iki, Inaba, Ise, Iwami, Izu, Izumo, Kii, Mimasaka, Mutsu, Nagato, Noto, Oki, Sado, Shima, Suō, Suruga, Tajima, Tanba, Tango, Tsushima, Wakasa, and Yamato.**

This audit is a correctness control, not a claim that those provinces had no relevant history. It exists so the GM cannot turn missing research into false “quiet year” prose.

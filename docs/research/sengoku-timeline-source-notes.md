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

## CC BY disaster records selected for provincial expansion

The University of Tokyo dataset prints a Gregorian conversion and a region/original-source field. The following are candidates for catalog cards; summaries below are paraphrases, not copied chronicle text.

| Gregorian date | Catalog key | Paraphrased record | Dataset region and original-source metadata |
|---|---|---|---|
| 1586-04-19 | musashi | An unusually persistent ice event was recorded in Musashi, remaining into daylight. | 武蔵; 年代記配合抄, 内閣文庫 |
| 1586-05-16 | yamato | A rain event followed a recent dry spell in Yamato. | 大和; 多聞院日記 4 |
| 1586-05-28 | satsuma | Flooding was recorded as preventing an intended troop movement in Satsuma. | 薩摩; 上井覚兼日記下 |
| 1596-05-02 | kozuke | Heavy late-season snow was recorded in Kōzuke. | 上野; 赤城山年代記, 赤城神社奉讃会 |
| 1596-06-04 | owari + mino | Flooding was recorded for the Owari–Mino region. | 東海 尾濃; 当代記, 日本凶荒史考 |
| 1596-06-22 | bizen | A source report described a good harvest in Bizen; this is environmental/economic context, not a reward. | 備前; 多聞院日記 5 |
| 1596-07-02 | echigo | Earthquake and drought were recorded in Echigo. | 越後; 宝林寺年代記, 南魚沼市舞子 |
| 1615-05-15 | mutsu | Snow and drought were both recorded in Mutsu; the entry also chronicles Osaka’s fall, so the catalog must separate the local environmental fact from the national political event. | 陸奥; 加納年代記, 石巻の歴史 1 |
| 1615-06-26 | mutsu / Aizu context | Drought lasting through June was recorded in Aizu. The current 66-province key is Mutsu, but the displayed copy must preserve the source’s Aizu locality. | 会津; 異本塔寺長帳, 日本の気象史料 |
| 1615-07-13 | hizen / Nagasaki context | A smallpox mortality report was recorded for Nagasaki; the catalog must label this as an archival report with source-specific scale, never turn it into a player-facing epidemic automatically. | 長崎; 大日本史料 12-22; リチャルド・コックス日記 |
| 1615-07-23 | yamashiro | Flooding and substantial field loss were recorded for Ōsumi village in Yamashiro. | 山城大住村; 義演准后日記 19 |

The open dataset is credited as **藤木久志 編『日本中世気象災害史年表稿』（高志書院）**, Tokyo Historiographical Institute, CC BY 4.0. Its own guidance requires care with chronicle criticism, so each card must retain source attribution and must not promote a report into a universal regional condition.

## San’in–San’yō provincial records

| Year / precision | Catalog key(s) | Source-supported context | Evidence boundary |
|---|---|---|---|
| 1510s–1520s / decade range | hoki + izumo | Tottori Prefectural Archives describes Amago Tsunehisa’s move from Izumo into Hōki’s Hino district and links it to later western advance routes. | Retain the decade range; do not invent a single campaign date or force the player into the conflict. |
| 1521 / year | aki, bingo, bitchu, bizen, mimasaka, harima, inaba, hoki, izumo, iwami, oki | Yasugi Tourism’s overview dates Amago expansion across eleven San’in/San’yō provinces to 1521. | Treat as a source-labelled political reach claim, not a map-owner overlay or exact sequence of conquest for each province. |
| 1562 / year | izumo + hoki | Tottori Prefectural Archives records Mōri Motonari’s advance toward Izumo/Hōki, return of displaced Hōki local leaders, and changing local allegiance. | Do not reduce the province to a single “owner” or imply universal acceptance. |
| 1566 / year | izumo | Yasugi Tourism dates the surrender of Gassan Toda Castle and Amago Yoshihisa’s fall to 1566. | Preserve it as Izumo political context; avoid tactical/casualty claims not given by source. |
| 1569 / year | izumo + hoki | Tottori Prefectural Archives records the Amago revival movement under Katsuhisa and Yamanaka in Izumo/Hōki. | Does not create a side mission unless the campaign has a source-consistent local connection. |
| 1570 / approximate | hoki | The archive records Hino local leaders acting with Amago forces around 1570. | Use `year` precision in catalog; no day or month. |
| 1578-07 / month | harima + hoki | Tottori archive dates the fall of Kōzuki Castle in July 1578 and records Hino figures among the Amago force there. | Kōzuki is in Harima; Hōki is an actor-origin connection, not the battle location. |

The Tottori material is published by the **Tottori Prefectural Archives** and cites underlying documents and editions. The Yasugi article is a local tourism overview and forbids copying its prose, so catalog text must be independently paraphrased and source-labelled.

## Nagato record from Yamaguchi Prefectural cultural-property timeline

Yamaguchi Prefecture’s cultural-property timeline provides a province-specific annual entry for **1586**, recording a land survey in Nagato. It separately lists a Suō survey in 1588, Mōri participation in the Kyūshū campaign in 1587, Korean dispatches in 1592 and 1597, and later domain events after 1600. The 1586 Nagato survey is the cleanest provincial card: it is year-precise, administrative rather than speculative, and does not require a player-facing political outcome. Source: [Yamaguchi Prefecture cultural property, Chōshū domain chronology](https://bunkazai.pref.yamaguchi.lg.jp/support/theme/tyousyuu/tnen.html).

## Hida and Sado municipal records

* **Hida, 1585:** Takayama City’s town museum states that after the 1585 Hida invasion, Kanamori Nagachika became daimyō of Hida. Its castle-history entry adds that Miki Yoshitsuna held Hirosé Castle during that invasion and fled to Kyoto after the castle fell. This supports a year-precision political/castle card, not a detailed battle reconstruction. Source: [Takayama City, Kanamori Nagachika sites](https://www.city.takayama.lg.jp/machihaku/1005305/1020397.html).
* **Sado, mid-sixteenth century:** Sado City’s World Heritage page states that gold-and-silver mine development on the island became full-scale from the middle of the sixteenth century. The page does **not** give a campaign-year date, so the catalog must retain `year` precision only and must not claim an exact opening day or player access to mine wealth. Source: [Sado City, Sado Island Gold Mines](https://www.city.sado.niigata.jp/site/mine/).

## Awaji and Shima municipal records

* **Awaji, 1519 / 1581:** Sumoto City’s Awaji Cultural History Museum states that the Awaji Hosokawa guardian was destroyed by the Miyoshi in 1519, after which local warrior groups rose. It also dates a Hashiba invasion of Awaji to 1581, notes broad capitulation, and frames the claim that the island was pacified in three days as a traditional account now supplemented by evidence of preparations beginning about half a year earlier. Catalog copy must preserve the difference between the museum’s documented date and the traditional-duration claim. Source: [Awaji Cultural History Museum, Shirasu Castle](https://awajishimamuseum.com/shirasujo/).
* **Shima, 1600:** Toba City dates Kuki Yoshitaka (born in Shima) to 1542–1600, identifies him as a naval leader for Oda Nobunaga and Toyotomi Hideyoshi who rose to rule Shima, and records his alignment with the western side at Sekigahara and death after its defeat. This is year-level provincial context; it does not justify a player naval command. Source: [Toba City, Kuki Yoshitaka and the Kuki navy](https://www.city.toba.mie.jp/isan/7686.html).

## Tango record from Maizuru and Miyazu local-history pages

Maizuru City’s school historical material dates the fall of Tatebe Castle, the base of the Isshiki line in Tango, to **Tenshō 6 (1578)** after defeat by Hosokawa and Akechi forces. A Miyazu city-led historical promotion page independently records the Hosokawa entry into Tango in **1580** and construction/urban development of Miyazu Castle. Either is suitable as a year-precision provincial card; the catalog uses the 1578 castle fall because it is a direct conflict transition and avoids claims about how all of Tango was governed afterward. Sources: [Maizuru Municipal Yuragawa Elementary School](https://yuragawa-maizuru.edumap.jp/tiiki) and [Miyazu City-led Garasha promotion council](https://www.amanohashidate.jp/garasha/).

## Iki record from Nagasaki Prefectural cultural-property database

Nagasaki Prefecture’s cultural-property database dates the completion of Katsumoto Castle on Iki to **1591**. It identifies the castle as a logistics base built for Hideyoshi’s Korea campaigns, reports that construction took about four months, and states that the site was dismantled after the campaign period. The catalog may use the 1591 completion as provincial infrastructure context, but must never turn that fact into a player command role, a ship, or a supply reward. Source: [Nagasaki Prefecture Cultural Property Database, Katsumoto Castle ruins](https://www.pref.nagasaki.jp/bunkadb/index.php/view/532).

## Yamashiro record from Kyoto City Official Travel Guide

Kyoto City’s official travel guide for the Funaokayama battlefield site states that, in **August 1511**, Ashikaga Yoshitada, having previously fled to Tanba, and Hosokawa Takakuni attacked Hosokawa Sumimoto and Hosokawa Masakata at Funaokayama and retook Kyoto. The same page cautions by its historical framing that shogunal authority remained nominal amid the Sengoku conflict. The catalog therefore stores this as a **month-precision, Yamashiro provincial battle/context card**. It does not claim an exact day, a settled province-wide ruler, casualty figures, or any player consequence. Source: [Kyoto City Official Travel Guide, Funaokayama battlefield site](https://ja.kyoto.travel/tourism/single02.php?category_id=9&tourism_id=4).

## Excluded 1507 candidate: evidence is insufficient for a regional card

Ishikawa Prefectural Library’s biographical entry identifies Hosokawa Masamoto as a kanrei, shugo daimyo, and warrior, and gives his lifespan as **1466–1507**. It does not identify the location, cause, or political consequence of his death. The catalog therefore does **not** add a 1507 Yamashiro/Kinai record from this source alone: assigning a `regionKey` would exceed the inspected evidence. Source: [Ishikawa Prefectural Library, Hosokawa Masamoto biographical entry](https://www.library.pref.ishikawa.lg.jp/shosho/furucolle/list/prsn16196).

## Suō records from Yamaguchi City Official Tourism chronology

Yamaguchi City’s official Ōuchi-clan chronology supplies five year-precision local records suitable for an offline, context-only catalog. It dates Ōuchi Yoshioki’s succession to **1495**, his reception of former shogun Ashikaga Yoshitane at Shinkōji in Yamaguchi to **1500**, support for Yoshitane’s restoration to **1507**, Yoshioki’s return from Kyoto to Yamaguchi to **1518**, and Yoshioki’s death with Ōuchi Yoshitaka’s succession to **1528**. Each card is limited to **Suō** and its stated political-network context. The source does not authorize a province-control map, universal faction outcome, player audience, reward, or resource claim. Source: [Yamaguchi City Official Tourism, Ōuchi clan chronology](https://yamaguchi-city.jp/history/ouchi_chronology.html).

## CC BY disaster records: 1585 provincial batch

The University of Tokyo viewer’s page 415 exposes row-level Gregorian conversion, region, article, original source, and bibliography for **1585** records. The catalog paraphrases only the bounded source report and keeps every selected card at `exact-date` with the displayed Gregorian value.

| Gregorian date | Catalog key | Source-bounded paraphrase | Original-source metadata shown by viewer |
|---|---|---|---|
| 1585-06-17 | hyuga | Flooding forced a route detour before an arrival in Miyazaki. | 日向; 上井覚兼日記中; 大日本古記録 |
| 1585-06-28 | kii | Windstorm and flood. | 紀伊; 和歌山史要; 日本の気象史料 |
| 1585-09-18 | mino | Major flood affected fields and houses; the entry records deaths. | 美濃; 荘厳講執事帳; 白山史料集下 |
| 1585-09-20 | musashi | Heavy rain and wind damaged houses. | 武蔵; 家忠日記; 日本の気象史料 |
| 1585-09-21 | shimosa | Strong wind and castle damage. | 下総; 海上八幡宮年代記; 海上町史史料編1 |
| 1585-10-21 | mutsu | Tsunami and severe famine are listed in the same entry. | 陸奥; 加納家年代記; 石巻の歴史1 |

These cards do not state a player route, named castle, loss, famine causation, or region-wide impact beyond their individual row. Source: [University of Tokyo Historiographical Institute, *Japanese Medieval Weather and Disaster History Chronology*, viewer page 415](https://www.hi.u-tokyo.ac.jp/collection/digitalgallery/disaster_events/?page=415&limit=30), CC BY 4.0.

## CC BY disaster records: 1566 year-coverage batch

The University of Tokyo viewer’s page 390 supplies **five additional records for 1566**, a year already represented in the catalog by the source-backed Gassan Toda Castle surrender card. The selected cards remain context-only and use the exact date only where the source row itself identifies a day. The Hitachi famine row identifies its Japanese date only to the eighth month, so its catalog card remains `month` precision rather than converting the viewer’s normalized Gregorian date into a civil day claim.

| Catalog key | Source-bounded paraphrase | Original-source metadata shown by viewer |
|---|---|---|
| yamashiro-storm-flood | Rain, thunder, and major flooding in Yamashiro on 1566-07-04. | 山城; 永禄九年＜丙寅＞記; 続群書類従29下 |
| national-frost-famine-chronicle | A chronicle reports frost, severe famine, and a mortality formula; catalog preserves this only as an attributed report. | 天下; 享禄以来年代記; 続群書類従29下 |
| hitachi-famine | Famine is recorded at month precision. | 常陸; 東州雑記; 佐竹家旧記6 |
| musashi-flooded-routes | Continuing rain and flood are associated with obstructed routes in the source letter. | 武蔵; 北条氏照書状; 群馬県史2322 |
| yamato-water-damage | Several days of rain and water damage. | 大和; 多聞院日記1; 日本凶荒史考 |

No card imports troop movement, an attributed death total, player travel, a named site, or an economic loss. Source: [University of Tokyo Historiographical Institute, *Japanese Medieval Weather and Disaster History Chronology*, viewer page 390](https://www.hi.u-tokyo.ac.jp/collection/digitalgallery/disaster_events/?page=390&limit=30), CC BY 4.0.

## CC BY disaster records: 1579 blank-year batch

The reproducible audit identified **1579** as `no-reviewed-event`; page 405 of the University of Tokyo viewer provides source-backed entries that allow it to become a reviewed year without inventing a political event. This batch preserves the source’s own precision: the Bungo storm/flood and Shimōsa persistent-flood entries remain `year`, the Musashi hail and national epidemic entries remain `month`, and only the entries that state a day use `exact-date`.

| Catalog key | Source-bounded paraphrase | Original-source metadata shown by viewer |
|---|---|---|
| bungo-storm-flood | Windstorm and flood, year precision. | 豊後; 六郷山年代記; 豊後国都甲荘の調査資料編 |
| shimosa-persistent-floods | Many years of flooding in a Shimōsa estate. | 下総; 武州古文書; 中世東国災害史略年表 |
| musashi-hail | Hail described as soybean-sized, fifth-month precision. | 武蔵; 年代記配合抄; 内閣文庫 |
| national-epidemic-report | Epidemic mortality across the realm, fifth-month precision. | 諸国; 宝林寺年代記; 南魚沼市舞子 |
| musashi-major-flood | Rain followed by major flooding on 1579-07-08. | 武蔵; 年代記配合抄; 内閣文庫 |
| mutsu-flood-casualty-report | Prolonged rain, flood, and deaths of people and horses in listed Rikuzen localities. | 陸前; 登米郡史; 日本の気象史料 |
| yamato-field-flood-loss | Downpour and field loss. | 大和; 多聞院日記3; 角川書店 |
| bitchu-flood-delays-movement | Heavy rain/flood delayed movement in the source letter. | 備中; 沼元家文書1; 山口県史史料編中世2 |

The cards do not establish a named player route, troop order, harvest total, casualty count, active epidemic, or province-wide economic result. Source: [University of Tokyo Historiographical Institute, *Japanese Medieval Weather and Disaster History Chronology*, viewer page 405](https://www.hi.u-tokyo.ac.jp/collection/digitalgallery/disaster_events/?page=405&limit=30), CC BY 4.0.

## CC BY disaster records: 1588 blank-year batch

The audit identified **1588** as `no-reviewed-event`; the University of Tokyo viewer’s page 419 provides seven records with usable source metadata. The national epidemic record is retained at `year` precision because its Japanese date has no month/day. Every local card uses its displayed Gregorian day only where the row itself supplies a dated Japanese entry.

| Catalog key | Source-bounded paraphrase | Original-source metadata shown by viewer |
|---|---|---|
| national-epidemic-report | Epidemic spread across the realm, year precision. | 諸国; 室町安土桃山時代医事年表; 室町安土桃山時代医学史の研究 |
| yamato-windstorm-damage | Windstorm and structural damage. | 大和; 多聞院日記4; 角川書店 |
| yamato-flooded-boat | Flood-related boat sinking with fatalities reported. | 大和; 多聞院日記4; 角川書店 |
| mino-snow | Snow recorded on 1588-05-12. | 美濃; 荘厳講執事帳; 白山史料集下 |
| yamashiro-flooded-crossings | Flooded Ōi/Kamo river crossings. | 京都; 享禄以来年代記 / 続本朝通鑑; 日本の気象史料 |
| omi-land-water-damage | Mountain collapse, river change, and waterside damage mentioned in a petition. | 近江; 増補駒井日記乾37; 文献出版 |
| yamashiro-lightning-injury-report | Lightning and injuries reported in Saika-chō. | 京都; 言経卿記3; 大日本古記録 |

These cards omit the source’s numeric fatalities, names beyond locality, property valuations, and any consequence for player movement, health, finances, or relationships. Source: [University of Tokyo Historiographical Institute, *Japanese Medieval Weather and Disaster History Chronology*, viewer page 419](https://www.hi.u-tokyo.ac.jp/collection/digitalgallery/disaster_events/?page=419&limit=30), CC BY 4.0.

## CC BY disaster records: 1589 blank-year batch

Page 420 of the University of Tokyo viewer supports five source-bounded 1589 cards: Sanuki hail, an attributed national hail report, Shinano water damage, Yamato drought, and Ise hail. The first two retain `year` precision; the other three preserve their displayed dates. None creates crop outcomes, tax relief, player travel constraints, or campaign-wide weather. Source: [viewer page 420](https://www.hi.u-tokyo.ac.jp/collection/digitalgallery/disaster_events/?page=420&limit=30), CC BY 4.0.

## Candidate evidence retained for the next 1593 batch

The audit lists **1593** as blank. Viewer page 426 was reviewed and contains source rows for a year-level national water/drought report, Kyoto rain and wind, Yamato weather reports, and several late-year epidemic reports. These are **research candidates only** until each card is selected, translated conservatively, given the source-supported precision, covered by regression, and included in a fresh audit. In particular, no candidate should turn the source’s national epidemic language into player illness, casualty totals, or universal campaign conditions. Source: [viewer page 426](https://www.hi.u-tokyo.ac.jp/collection/digitalgallery/disaster_events/?page=426&limit=30), CC BY 4.0.

Three date-specific entries were selected: 3 September national water/drought report, plus Yamashiro wind and Yamato heavy rain/wind on 3 October. Late-year epidemic rows remain excluded because their Gregorian dates lie in 1594 and require a separate calendar review. The selected records create no campaign-wide weather, player damage, disease, or travel rule.

## CC BY disaster records: 1594 blank-year batch

Viewer page 427 supports five bounded cards: Aizu flood, Echigo flood/water damage, Kii windstorm, an attributed national windstorm report, and Edo rain/wind (mapped to Musashi). The Aizu row spans two dates; the catalog retains the first displayed date only as the safe exact-date anchor. The Echigo row is month-level. All casualty, crop, property, and campaign-effect detail is excluded. Source: [viewer page 427](https://www.hi.u-tokyo.ac.jp/collection/digitalgallery/disaster_events/?page=427&limit=30), CC BY 4.0.

## CC BY disaster records: 1595 blank-year batch

Viewer page 428 supports four date-specific local cards: Yamashiro flood, Settsu flood-related dike damage, Mutsu flood, and Awa windstorm. The catalog excludes named infrastructure, repair, crop, and damage detail beyond the bounded weather/environment context. Source: [viewer page 428](https://www.hi.u-tokyo.ac.jp/collection/digitalgallery/disaster_events/?page=428&limit=30), CC BY 4.0.

## Candidate evidence retained for the next 1599 batch

The audit lists **1599** as blank. Viewer page 430 provides candidate year-level national famine/food-shortage rows, an exact-date Yamato rain report, and source rows for a late-March Kyoto storm. Selection must preserve the displayed Gregorian year, exclude food price/economic effects, and not infer a campaign-wide shortage or player hardship. Source: [viewer page 430](https://www.hi.u-tokyo.ac.jp/collection/digitalgallery/disaster_events/?page=430&limit=30), CC BY 4.0.

## Starter-origin evidence: Sakai and Kunitomo

The official Sakai Tourism and Convention Bureau history describes Sengoku-period Sakai as a foreign-trade exchange hub and self-governed city, and dates a merchant ship’s departure for Ming China to 1476. It supports a conservative port/crew origin profile for the late fifteenth through late sixteenth centuries, but does not license fictional merchant councils, cargoes, or player obligations. The National Museum of Japanese History documents guns’ arrival in 1543, wider western-Japan circulation in the mid-sixteenth century, and Kunitomo gunsmithing in Ōmi during the Sengoku period. It supports opening a gunsmith profile only after the mid-sixteenth century; it does not establish a specific workshop, order, or named patron for a campaign. Sources: [Sakai official history](https://www.sakai-tcb.or.jp/en/about-sakai/history/); [National Museum of Japanese History firearms exhibition](https://archive.rekihaku.ac.jp/english/exhibitions/project/old/061003/index.html).

The Ōmi Tourism Board describes the province’s strategic routes, Lake Biwa transport, and Sengoku conflicts involving the Rokkaku, Kyōgoku, Azai, Asakura, and Oda forces; it also places the Azuchi period and the 1570 Anegawa battle in Ōmi. This supports a conservative late-sixteenth-century attendant/route origin in Ōmi, but does not license a claim that a starter character served any named lord or battle. Source: [Ōmi Tourism Board history](https://visit-omi.com/about/history).

import type { Season } from "./game";

export type TimelineKind = "battle" | "event" | "disaster";
export type DatePrecision = "year" | "season" | "month" | "exact-date";
export type TimelineCopy = { en: string; th: string };
export type HistoricalScope = "national" | "provincial" | "disaster";

export type HistoricalTimelineRecord = {
  id: string;
  kind: TimelineKind;
  scope: HistoricalScope;
  year: number;
  precision: DatePrecision;
  season?: Season;
  month?: number;
  day?: number;
  date: TimelineCopy;
  title: TimelineCopy;
  summary: TimelineCopy;
  regionKeys: string[];
  source: { label: string; url: string };
};

export type HistoricalYearLedger = {
  year: number;
  status: "reviewed-events" | "no-reviewed-event";
  recordIds: string[];
};

/**
 * “66 provinces + two islands” is the project’s stated Sengoku count. Iki and
 * Tsushima are deliberately tracked separately as island provinces, rather
 * than silently disappearing from map/timeline lookups.
 */
export const SENGOKU_66_PROVINCE_IDS = [
  "yamashiro", "yamato", "kawachi", "izumi", "settsu", "iga", "ise", "shima", "kii", "awaji", "omi", "wakasa", "echizen", "kaga", "noto", "etchu", "echigo", "sado", "tanba", "tango", "tajima", "harima", "mimasaka", "bizen", "bitchu", "bingo", "aki", "suo", "nagato", "iwami", "izumo", "hoki", "inaba", "oki", "iyo", "sanuki", "awa-shikoku", "tosa", "chikuzen", "chikugo", "hizen", "higo", "buzen", "bungo", "hyuga", "satsuma", "osumi", "owari", "mikawa", "totomi", "suruga", "izu", "kai", "sagami", "musashi", "kozuke", "shimotsuke", "hitachi", "shimosa", "kazusa", "awa-boso", "mino", "hida", "shinano", "dewa", "mutsu",
] as const;
export const SENGOKU_ISLAND_PROVINCE_IDS = ["iki", "tsushima"] as const;
export type SengokuProvinceId = typeof SENGOKU_66_PROVINCE_IDS[number] | typeof SENGOKU_ISLAND_PROVINCE_IDS[number];

const ufirst = (year: number) => ({ label: `Sengoku Shogun Map · ${year}`, url: `https://ufirst.jp/sengoku-map/en/${year}` });
const disasterArchive = { label: "University of Tokyo Historiographical Institute · 藤木久志 編『日本中世気象災害史年表稿』 (CC BY 4.0)", url: "https://www.hi.u-tokyo.ac.jp/collection/digitalgallery/disaster_events/about" };
const nationalArchives = { label: "National Archives of Japan · Tenka Taihen chronology", url: "https://www.archives.go.jp/exhibition/digital/tenkataihen/history.html" };
const tottoriArchives = { label: "Tottori Prefectural Archives · Inaba/Hōki Sengoku local history", url: "https://www.pref.tottori.lg.jp/item/413641.htm" };
const yasugiTourism = { label: "Yasugi Tourism Association · Rise and fall of the Amago clan", url: "https://yasugi-kankou.com/en/the-rise-and-fall-of-the-amago-clan/" };

const copy = (en: string, th: string): TimelineCopy => ({ en, th });
const record = (id: string, kind: TimelineKind, scope: HistoricalScope, year: number, precision: DatePrecision, title: TimelineCopy, summary: TimelineCopy, regionKeys: string[], source: { label: string; url: string }, date = copy(`${year}`, `ค.ศ. ${year}`), details: Partial<Pick<HistoricalTimelineRecord, "season" | "month" | "day">> = {}): HistoricalTimelineRecord => ({ id, kind, scope, year, precision, date, title, summary, regionKeys, source, ...details });

/**
 * A curated, citable seed. A blank year is recorded as blank in YEAR_LEDGER;
 * it is never backfilled with model-generated “history”. The catalogue is
 * deliberately append-only so research can grow province by province.
 */
export const HISTORICAL_TIMELINE: HistoricalTimelineRecord[] = [
  record("1467-onin-war", "event", "national", 1467, "year", copy("Outbreak of the Ōnin War", "การเริ่มสงครามโอนิง"), copy("Factional conflict in Kyoto began the long political breakdown conventionally used as the opening of the Sengoku era.", "ความขัดแย้งระหว่างฝ่ายในเกียวโตเริ่มขึ้น และมักใช้เป็นจุดเปิดของยุคเซ็นโกคุ."), ["yamashiro"], ufirst(1467)),
  record("1477-onin-war-end", "event", "national", 1477, "year", copy("End of the Ōnin War", "การสิ้นสุดสงครามโอนิง"), copy("The conflict ended without restoring a stable national political order.", "สงครามยุติลงโดยไม่ได้ฟื้นระเบียบการเมืองระดับชาติให้มั่นคง."), ["yamashiro"], ufirst(1477)),
  record("1488-kaga-ikki", "event", "provincial", 1488, "year", copy("Kaga Ikkō-ikki takes power", "อิกโคอิกกิยึดอำนาจในคางะ"), copy("The Kaga uprising is recorded as a provincial political rupture rather than a player-facing event.", "การลุกฮือในคางะเป็นรอยร้าวทางการเมืองระดับแคว้น ไม่ใช่เหตุการณ์ที่บังคับผู้เล่นให้เกี่ยวข้อง."), ["kaga"], ufirst(1488)),
  record("1493-meio-disturbance", "event", "national", 1493, "year", copy("Meiō Disturbance", "ความวุ่นวายเมโอ"), copy("A Kyoto political coup reshaped the balance among Muromachi actors.", "รัฐประหารทางการเมืองในเกียวโตเปลี่ยนดุลระหว่างกลุ่มอำนาจมุโรมาจิ."), ["yamashiro"], ufirst(1493)),
  record("1531-nakajima-war", "battle", "provincial", 1531, "year", copy("Battle of Nakajima", "ศึกนากาจิมะ"), copy("Conflict among Hongan-ji and allied forces affected the Kinai political field.", "ความขัดแย้งระหว่างกลุ่มฮงกันจิกับพันธมิตรส่งผลต่อสนามการเมืองคิไน."), ["settsu"], ufirst(1531)),
  record("1543-firearms-tanegashima", "event", "national", 1543, "year", copy("Firearms reach Tanegashima", "อาวุธปืนมาถึงทาเนงาชิมะ"), copy("The introduction is catalogued as national technological context; it does not grant equipment to a campaign.", "การเข้ามาของอาวุธปืนเป็นบริบทเทคโนโลยีระดับชาติ ไม่ได้มอบอุปกรณ์ให้แคมเปญโดยอัตโนมัติ."), ["osumi"], ufirst(1543)),
  record("1546-kawagoe", "battle", "provincial", 1546, "year", copy("Battle of Kawagoe", "ศึกคาวาโกเอะ"), copy("A major Kantō conflict associated with the Later Hōjō position.", "ความขัดแย้งสำคัญในคันโตที่เกี่ยวข้องกับฐานอำนาจโฮโจยุคหลัง."), ["musashi"], ufirst(1546)),
  record("1548-uedahara", "battle", "provincial", 1548, "year", copy("Battle of Uedahara", "ศึกอูเอดาฮาระ"), copy("A Shinano campaign record used only as regional war context.", "บันทึกศึกในชินาโนะ ใช้เป็นบริบทสงครามระดับแคว้นเท่านั้น."), ["shinano"], ufirst(1548)),
  record("1549-xavier-kagoshima", "event", "provincial", 1549, "year", copy("Francis Xavier arrives at Kagoshima", "ฟรานซิส ซาเวียร์มาถึงคาโงชิมะ"), copy("Christian contact in Satsuma is historical context, not a required plot for the player.", "การติดต่อคริสต์ศาสนาในซัตสึมะเป็นบริบทประวัติศาสตร์ ไม่ใช่พล็อตบังคับผู้เล่น."), ["satsuma"], ufirst(1549)),
  record("1555-itsukushima", "battle", "provincial", 1555, "month", copy("Battle of Itsukushima", "ศึกอิสึกูชิมะ"), copy("Mōri Motonari defeated Sue Harukata, accelerating the Mōri rise in western Honshū.", "โมริ โมโตนาริชนะซุเอะ ฮารุกาตะ ส่งผลให้โมริเติบโตในฮนชูตะวันตก."), ["aki"], ufirst(1555), copy("Month 10 · 1555", "เดือน 10 · ค.ศ. 1555"), { month: 10, season: "Autumn" }),
  record("1556-nagara-river", "battle", "provincial", 1556, "year", copy("Battle of Nagara River", "ศึกแม่น้ำนางาระ"), copy("The Mino succession struggle is recorded as provincial context.", "การแย่งชิงอำนาจในมิโนะถูกบันทึกเป็นบริบทระดับแคว้น."), ["mino"], ufirst(1556)),
  record("1560-okehazama", "battle", "national", 1560, "year", copy("Battle of Okehazama", "ศึกโอเคฮาซามะ"), copy("Oda Nobunaga defeated Imagawa Yoshimoto in Owari, shifting the central Japanese balance.", "โอดะ โนบุนางะชนะอิมางาวะ โยชิโมโตะในโอวาริ ทำให้ดุลอำนาจภาคกลางเปลี่ยนไป."), ["owari"], ufirst(1560)),
  record("1561-kawanakajima-fourth", "battle", "provincial", 1561, "year", copy("Fourth Battle of Kawanakajima", "ศึกคาวานากาจิมะครั้งที่สี่"), copy("A Shinano battle in the Takeda–Uesugi conflict.", "ศึกในชินาโนะของความขัดแย้งทาเคดะ–อุเอสึงิ."), ["shinano"], ufirst(1561)),
  record("1564-mikawa-ikko-ikki", "event", "provincial", 1564, "year", copy("Mikawa Ikkō-ikki suppressed", "การปราบอิกโคอิกกิในมิกาวะ"), copy("A local religious-political conflict became a key Mikawa context.", "ความขัดแย้งศาสนา–การเมืองท้องถิ่นกลายเป็นบริบทสำคัญของมิกาวะ."), ["mikawa"], ufirst(1564)),
  record("1565-eiroku-incident", "event", "national", 1565, "year", copy("Eiroku Incident", "เหตุการณ์เอโรคุ"), copy("The shogun’s death is treated as national political context centered on Kyoto.", "การสิ้นพระชนม์ของโชกุนเป็นบริบทการเมืองระดับชาติที่มีศูนย์กลางในเกียวโต."), ["yamashiro"], ufirst(1565)),
  record("1567-inabayama", "battle", "provincial", 1567, "year", copy("Fall of Inabayama Castle", "การแตกของปราสาทอินาบายามะ"), copy("Oda control of Mino became a major central route context.", "การควบคุมมิโนะของโอดะกลายเป็นบริบทสำคัญของเส้นทางภาคกลาง."), ["mino"], ufirst(1567)),
  record("1568-oda-kyoto", "event", "national", 1568, "year", copy("Oda enters Kyoto", "โอดะเข้าสู่เกียวโต"), copy("Nobunaga’s Kyoto entry changed the national political field.", "การเข้าสู่เกียวโตของโนบุนางะเปลี่ยนสนามการเมืองระดับชาติ."), ["yamashiro"], ufirst(1568)),
  record("1569-honkokuji-incident", "event", "national", 1569, "year", copy("Honkoku-ji Incident", "เหตุการณ์ฮงโคคุจิ"), copy("The year view records an attack on Ashikaga Yoshiaki's temporary residence at Honkoku-ji and its defense before Nobunaga returned to Kyoto.", "บันทึกประจำปีระบุการโจมตีที่พำนักชั่วคราวของอาชิคางะ โยชิอากิ ณ ฮงโคคุจิ และการตั้งรับก่อนโนบุนางะกลับถึงเกียวโต."), ["yamashiro"], ufirst(1569)),
  record("1569-nijo-palace", "event", "national", 1569, "year", copy("Nijō Palace built for Ashikaga Yoshiaki", "การสร้างตำหนักนิโจสำหรับอาชิคางะ โยชิอากิ"), copy("The source lists construction of a fortified Nijō residence but does not provide a month.", "แหล่งข้อมูลระบุการสร้างที่พำนักนิโจที่มีการป้องกัน แต่ไม่ให้เดือน."), ["yamashiro"], ufirst(1569), copy("1569 · month not specified", "ค.ศ. 1569 · ไม่ระบุเดือน")),
  record("1570-kanegasaki-retreat", "event", "national", 1570, "month", copy("Retreat at Kanegasaki", "การถอยทัพที่คาเนงาซากิ"), copy("The source places the retreat during the Echizen campaign after Azai Nagamasa's defection became apparent.", "หน้าปีระบุการถอยทัพระหว่างศึกเอจิเซ็น หลังการแตกจากฝ่ายของอาซาอิ นางามาซะปรากฏชัด."), ["omi", "echizen"], ufirst(1570), copy("Spring · month 4", "วสันต์ · เดือน 4"), { season: "Spring", month: 4 }),
  record("1570-anegawa", "battle", "national", 1570, "exact-date", copy("Battle of Anegawa", "ศึกอาเนงาวะ"), copy("The Oda–Tokugawa alliance defeated the Azai–Asakura alliance in Ōmi; the source notes that the Azai were not destroyed by the battle.", "พันธมิตรโอดะ–โทกูงาวะชนะพันธมิตรอาซาอิ–อาซากูระในโอมิ โดยแหล่งข้อมูลระบุว่าอาซาอิไม่ได้ถูกทำลายลงด้วยศึกครั้งนี้."), ["omi"], ufirst(1570), copy("30 July 1570", "30 กรกฎาคม ค.ศ. 1570"), { season: "Summer", month: 7, day: 30 }),
  record("1570-ishiyama-war", "event", "national", 1570, "month", copy("Outbreak of the Ishiyama War", "การเริ่มสงครามอิชิยามะ"), copy("The source records the rise of Ishiyama Hongan-ji in Settsu against Nobunaga.", "แหล่งข้อมูลบันทึกการลุกขึ้นของอิชิยามะฮงกันจิในเซ็ตสึเพื่อต่อต้านโนบุนางะ."), ["settsu"], ufirst(1570), copy("Summer · month 8", "คิมหันต์ · เดือน 8"), { season: "Summer", month: 8 }),
  record("1570-noda-fukushima", "battle", "provincial", 1570, "month", copy("Battle of Noda–Fukushima", "ศึกโนดะ–ฟูกูชิมะ"), copy("The year view places fighting in Settsu around the strongholds of Noda and Fukushima.", "หน้าปีวางการสู้รบในเซ็ตสึรอบฐานที่มั่นโนดะและฟูกูชิมะ."), ["settsu"], ufirst(1570), copy("Autumn · month 9", "สารท · เดือน 9"), { season: "Autumn", month: 9 }),
  record("1571-mount-hiei", "event", "national", 1571, "year", copy("Burning of Mount Hiei", "การเผาภูเขาฮิเอ"), copy("The conflict around Enryaku-ji is catalogued as Kyoto–Ōmi political and military context.", "ความขัดแย้งรอบเอ็นเรียคุจิถูกเก็บเป็นบริบทการเมืองและสงครามของเกียวโต–โอมิ."), ["yamashiro", "omi"], ufirst(1571)),
  record("1572-mikatagahara", "battle", "national", 1572, "year", copy("Battle of Mikatagahara", "ศึกมิคาตากาฮาระ"), copy("Takeda and Tokugawa forces fought in Tōtōmi.", "กองกำลังทาเคดะและโทกูงาวะสู้รบกันในโทโตมิ."), ["totomi"], ufirst(1572)),
  record("1573-muromachi-fall", "event", "national", 1573, "year", copy("End of the Muromachi shogunate", "การสิ้นสุดโชกุนมุโรมาจิ"), copy("Ashikaga Yoshiaki’s expulsion from Kyoto is used as national political context.", "การขับอาชิคางะ โยชิอากิออกจากเกียวโตใช้เป็นบริบทการเมืองระดับชาติ."), ["yamashiro"], ufirst(1573)),
  record("1575-nagashino", "battle", "national", 1575, "year", copy("Battle of Nagashino", "ศึกนางาชิโนะ"), copy("A Mikawa battle in the Oda–Tokugawa and Takeda conflict.", "ศึกในมิกาวะของความขัดแย้งโอดะ–โทกูงาวะกับทาเคดะ."), ["mikawa"], ufirst(1575)),
  record("1576-azuchi", "event", "national", 1576, "year", copy("Azuchi Castle construction begins", "เริ่มสร้างปราสาทอาซูจิ"), copy("Azuchi is a central political and material-culture context in Ōmi.", "อาซูจิเป็นบริบทการเมืองและวัฒนธรรมวัตถุสำคัญในโอมิ."), ["omi"], ufirst(1576)),
  record("1577-western-campaign", "battle", "provincial", 1577, "year", copy("Hashiba campaign in Harima", "การทัพฮาชิบะในฮาริมะ"), copy("Western campaign pressure is regional context for Harima routes.", "แรงกดดันจากการทัพตะวันตกเป็นบริบทเส้นทางของฮาริมะ."), ["harima"], ufirst(1577)),
  record("1578-araki-rebellion", "event", "provincial", 1578, "year", copy("Araki Murashige rebellion", "การกบฏของอารากิ มูราชิเงะ"), copy("The Settsu conflict is recorded as a regional fracture within Oda power.", "ความขัดแย้งในเซ็ตสึถูกบันทึกเป็นรอยร้าวระดับแคว้นภายในอำนาจโอดะ."), ["settsu"], ufirst(1578)),
  record("1580-ishiyama-end", "event", "national", 1580, "year", copy("End of the Ishiyama War", "การสิ้นสุดสงครามอิชิยามะ"), copy("The prolonged conflict around Ishiyama Hongan-ji ended; the catalog does not infer a player consequence.", "ความขัดแย้งยืดเยื้อรอบอิชิยามะฮงกันจิสิ้นสุดลง โดย catalog ไม่อนุมานผลต่อผู้เล่น."), ["settsu"], ufirst(1580)),
  record("1582-honnoji", "event", "national", 1582, "year", copy("Honnō-ji Incident", "เหตุการณ์ฮนโนจิ"), copy("The year view places Nobunaga’s death at Honnō-ji at the center of a succession crisis.", "หน้าปีวางการเสียชีวิตของโนบุนางะที่ฮนโนจิเป็นศูนย์กลางของวิกฤตสืบทอดอำนาจ."), ["yamashiro"], ufirst(1582)),
  record("1582-yamazaki", "battle", "national", 1582, "year", copy("Battle of Yamazaki", "ศึกยามาซากิ"), copy("Hideyoshi defeated Akechi Mitsuhide after the Honnō-ji Incident.", "ฮิเดโยชิชนะอาเคจิ มิสึฮิเดะหลังเหตุการณ์ฮนโนจิ."), ["yamashiro"], ufirst(1582)),
  record("1583-shizugatake", "battle", "national", 1583, "year", copy("Battle of Shizugatake", "ศึกชิซูกาตาเกะ"), copy("A succession conflict battle tied to northern Ōmi.", "ศึกแย่งชิงอำนาจที่เกี่ยวข้องกับโอมิตอนเหนือ."), ["omi"], ufirst(1583)),
  record("1584-komaki-nagakute", "battle", "national", 1584, "year", copy("Komaki and Nagakute Campaign", "การทัพโคมากิและนางากูเตะ"), copy("Fighting in Owari and Mikawa formed a major post-Nobunaga contest.", "การสู้รบในโอวาริและมิกาวะเป็นการแข่งขันสำคัญหลังโนบุนางะ."), ["owari", "mikawa"], ufirst(1584)),
  record("1585-shikoku", "battle", "national", 1585, "year", copy("Hideyoshi’s Shikoku campaign", "การทัพชิโกกุของฮิเดโยชิ"), copy("The campaign affected the Shikoku provincial political field.", "การทัพส่งผลต่อสนามการเมืองระดับแคว้นของชิโกกุ."), ["iyo", "sanuki", "awa-shikoku", "tosa"], ufirst(1585)),
  record("1586-tensho-earthquake", "disaster", "disaster", 1586, "year", copy("Tenshō earthquake", "แผ่นดินไหวเท็นโช"), copy("A major earthquake is retained as historical environmental context; this catalog does not state a day where the cited record has not been locally reviewed.", "แผ่นดินไหวใหญ่ถูกเก็บเป็นบริบทสิ่งแวดล้อมทางประวัติศาสตร์ โดย catalog นี้ไม่ระบุวันหากยังไม่ได้ตรวจแหล่งในพื้นที่."), ["mino", "omi", "kai"], disasterArchive),
  record("1587-kyushu", "battle", "national", 1587, "year", copy("Hideyoshi’s Kyūshū campaign", "การทัพคิวชูของฮิเดโยชิ"), copy("A national campaign with provincial effects in northern and southern Kyūshū.", "การทัพระดับชาติที่มีผลระดับแคว้นในคิวชูเหนือและใต้."), ["chikuzen", "chikugo", "hizen", "higo", "buzen", "bungo", "hyuga", "satsuma", "osumi"], ufirst(1587)),
  record("1590-odawara", "battle", "national", 1590, "year", copy("Siege of Odawara", "การล้อมโอดาวาระ"), copy("The campaign against the Later Hōjō is a Kantō and national transition context.", "การทัพต่อโฮโจยุคหลังเป็นบริบทเปลี่ยนผ่านของคันโตและระดับชาติ."), ["sagami", "musashi", "kozuke", "shimotsuke", "hitachi", "shimosa", "kazusa", "awa-boso"], ufirst(1590)),
  record("1592-korea-campaign", "event", "national", 1592, "year", copy("First Korean campaign begins", "เริ่มการทัพเกาหลีครั้งแรก"), copy("The overseas campaign is national context; it does not make a local player a participant.", "การทัพโพ้นทะเลเป็นบริบทระดับชาติ ไม่ได้ทำให้ผู้เล่นท้องถิ่นเป็นผู้เข้าร่วมโดยอัตโนมัติ."), ["chikuzen", "hizen"], ufirst(1592)),
  record("1596-keicho-fushimi-earthquake", "disaster", "disaster", 1596, "year", copy("Keichō–Fushimi earthquake", "แผ่นดินไหวเคโช–ฟูชิมิ"), copy("A late Sengoku earthquake record retained as environmental context around Kyoto and Kinai.", "บันทึกแผ่นดินไหวปลายเซ็นโกคุที่เก็บเป็นบริบทสิ่งแวดล้อมรอบเกียวโตและคิไน."), ["yamashiro", "settsu", "kawachi", "izumi"], disasterArchive),
  record("1597-korea-campaign", "event", "national", 1597, "year", copy("Second Korean campaign begins", "เริ่มการทัพเกาหลีครั้งที่สอง"), copy("The resumed overseas war is national context with port and logistics pressure.", "สงครามโพ้นทะเลที่กลับมาเป็นบริบทระดับชาติที่สร้างแรงกดดันท่าเรือและลอจิสติกส์."), ["chikuzen", "hizen"], ufirst(1597)),
  record("1598-hideyoshi-death", "event", "national", 1598, "year", copy("Death of Toyotomi Hideyoshi", "การเสียชีวิตของโทโยโตมิ ฮิเดโยชิ"), copy("Hideyoshi’s death shifted the national political balance without dictating a character’s private story.", "การเสียชีวิตของฮิเดโยชิเปลี่ยนดุลการเมืองระดับชาติ โดยไม่กำหนดเรื่องส่วนตัวของตัวละคร."), ["yamashiro"], ufirst(1598)),
  record("1600-fushimi", "battle", "national", 1600, "month", copy("Siege of Fushimi Castle", "การล้อมปราสาทฟูชิมิ"), copy("The source places the siege in month 7 after Ieyasu marched toward Aizu.", "แหล่งข้อมูลวางการล้อมไว้ในเดือน 7 หลังอิเอยาสึเคลื่อนทัพสู่อาอิซึ."), ["yamashiro"], ufirst(1600), copy("Month 7 · 1600", "เดือน 7 · ค.ศ. 1600"), { month: 7, season: "Summer" }),
  record("1600-sekigahara", "battle", "national", 1600, "exact-date", copy("Battle of Sekigahara", "ศึกเซกิงาฮาระ"), copy("The Eastern Army under Tokugawa Ieyasu defeated the Western Army in Mino.", "กองทัพฝ่ายตะวันออกของโทกูงาวะ อิเอยาสึชนะฝ่ายตะวันตกในมิโนะ."), ["mino"], ufirst(1600), copy("21 October 1600", "21 ตุลาคม ค.ศ. 1600"), { month: 10, season: "Autumn", day: 21 }),
  record("1603-edo-shogunate", "event", "national", 1603, "year", copy("Tokugawa shogunate established", "การสถาปนาโชกุนโทกูงาวะ"), copy("The National Archives chronology records the opening of the Edo shogunate in 1603.", "ลำดับเหตุการณ์ของหอจดหมายเหตุแห่งชาติบันทึกการเปิดโชกุนเอโดะใน ค.ศ. 1603."), ["musashi", "yamashiro"], nationalArchives),
  record("1614-osaka-winter", "battle", "national", 1614, "year", copy("Siege of Osaka: Winter Campaign", "การล้อมโอซากะ: การทัพฤดูหนาว"), copy("The Osaka conflict is national context concentrated in Settsu.", "ความขัดแย้งโอซากะเป็นบริบทระดับชาติที่กระจุกในเซ็ตสึ."), ["settsu"], ufirst(1614)),
  record("1615-osaka-summer", "battle", "national", 1615, "year", copy("Siege of Osaka: Summer Campaign", "การล้อมโอซากะ: การทัพฤดูร้อน"), copy("The destruction of Toyotomi resistance concludes the catalog’s stated Sengoku range.", "การทำลายการต่อต้านของโทโยโตมิเป็นจุดสิ้นสุดช่วงเซ็นโกคุที่ catalog นี้กำหนด."), ["settsu"], ufirst(1615)),
  record("1586-musashi-persistent-ice", "disaster", "disaster", 1586, "exact-date", copy("Persistent ice recorded in Musashi", "บันทึกน้ำแข็งคงอยู่นานในมูซาชิ"), copy("A source record describes ice remaining into daylight in Musashi. It is local weather evidence, not an automatic campaign hazard.", "บันทึกแหล่งหนึ่งบรรยายว่าน้ำแข็งยังคงอยู่จนถึงเวลากลางวันในมูซาชิ ใช้เป็นหลักฐานอากาศท้องถิ่น ไม่ใช่ภัยที่เกิดกับแคมเปญโดยอัตโนมัติ."), ["musashi"], disasterArchive, copy("19 April 1586", "19 เมษายน ค.ศ. 1586"), { season: "Spring", month: 4, day: 19 }),
  record("1586-yamato-rain", "disaster", "disaster", 1586, "exact-date", copy("Rain after a dry spell in Yamato", "ฝนหลังช่วงแล้งในยามาโตะ"), copy("A Yamato diary records rainfall after a recent dry spell. The card does not infer harvest or travel effects beyond the source report.", "บันทึกจากยามาโตะระบุฝนหลังช่วงแล้งล่าสุด การ์ดนี้ไม่อนุมานผลต่อการเก็บเกี่ยวหรือการเดินทางเกินกว่ารายงานต้นทาง."), ["yamato"], disasterArchive, copy("16 May 1586", "16 พฤษภาคม ค.ศ. 1586"), { season: "Spring", month: 5, day: 16 }),
  record("1586-satsuma-flood", "disaster", "disaster", 1586, "exact-date", copy("Flood disrupts a troop movement in Satsuma", "น้ำท่วมขัดขวางการเคลื่อนกำลังในซัตสึมะ"), copy("A Satsuma record notes that flooding prevented an intended troop movement. This stays regional context and never assigns that movement to the player.", "บันทึกจากซัตสึมะระบุว่าน้ำท่วมทำให้การเคลื่อนกำลังที่ตั้งใจไว้ไม่เกิดขึ้น ใช้เป็นบริบทระดับแคว้น และไม่ผูกการเคลื่อนนั้นกับผู้เล่น."), ["satsuma"], disasterArchive, copy("28 May 1586", "28 พฤษภาคม ค.ศ. 1586"), { season: "Spring", month: 5, day: 28 }),
  record("1596-kozuke-snow", "disaster", "disaster", 1596, "exact-date", copy("Heavy snow in Kōzuke", "หิมะหนักในโคซูเกะ"), copy("A Kōzuke chronicle records heavy snow on the cited date. It is a source-bounded weather card, not a region-wide climate claim.", "พงศาวดารโคซูเกะบันทึกหิมะหนักในวันที่อ้างอิง เป็นการ์ดอากาศที่จำกัดตามแหล่ง ไม่ใช่คำอ้างภูมิอากาศทั้งแคว้น."), ["kozuke"], disasterArchive, copy("2 May 1596", "2 พฤษภาคม ค.ศ. 1596"), { season: "Spring", month: 5, day: 2 }),
  record("1596-owari-mino-flood", "disaster", "disaster", 1596, "exact-date", copy("Flooding recorded in Owari–Mino", "บันทึกน้ำท่วมในโอวาริ–มิโนะ"), copy("A chronicle records flooding for the Owari–Mino region. The catalog treats this as cross-province environmental context only.", "พงศาวดารบันทึกน้ำท่วมในภูมิภาคโอวาริ–มิโนะ โดย catalog ใช้เป็นบริบทสิ่งแวดล้อมข้ามแคว้นเท่านั้น."), ["owari", "mino"], disasterArchive, copy("4 June 1596", "4 มิถุนายน ค.ศ. 1596"), { season: "Summer", month: 6, day: 4 }),
  record("1596-bizen-harvest-report", "disaster", "disaster", 1596, "exact-date", copy("Good harvest report from Bizen", "รายงานผลเก็บเกี่ยวดีจากบิเซ็น"), copy("A source report describes a good harvest in Bizen. It cannot create money, supplies, or a reward without the campaign’s own economy rules.", "รายงานต้นทางกล่าวถึงผลเก็บเกี่ยวดีในบิเซ็น ข้อมูลนี้ไม่สร้างเงิน เสบียง หรือรางวัล หากกฎเศรษฐกิจของแคมเปญไม่ได้กำหนดไว้."), ["bizen"], disasterArchive, copy("22 June 1596", "22 มิถุนายน ค.ศ. 1596"), { season: "Summer", month: 6, day: 22 }),
  record("1596-echigo-earthquake-drought", "disaster", "disaster", 1596, "exact-date", copy("Earthquake and drought recorded in Echigo", "บันทึกแผ่นดินไหวและภัยแล้งในเอจิโงะ"), copy("An Echigo chronicle records both an earthquake and drought. The card preserves this paired source report without extrapolating damage.", "พงศาวดารเอจิโงะบันทึกทั้งแผ่นดินไหวและภัยแล้ง การ์ดคงรายงานคู่นี้ไว้โดยไม่ขยายความเสียหายเกินแหล่ง."), ["echigo"], disasterArchive, copy("2 July 1596", "2 กรกฎาคม ค.ศ. 1596"), { season: "Summer", month: 7, day: 2 }),
  record("1615-mutsu-snow-drought", "disaster", "disaster", 1615, "exact-date", copy("Snow and drought recorded in Mutsu", "บันทึกหิมะและภัยแล้งในมุตสึ"), copy("A Mutsu chronicle records snowfall and drought. Its separate note about Osaka belongs to national history and is not folded into this local weather card.", "พงศาวดารมุตสึบันทึกหิมะและภัยแล้ง ส่วนข้อความแยกเรื่องโอซากะเป็นประวัติศาสตร์ระดับชาติ จึงไม่ถูกผนวกเข้าการ์ดอากาศท้องถิ่นนี้."), ["mutsu"], disasterArchive, copy("15 May 1615", "15 พฤษภาคม ค.ศ. 1615"), { season: "Spring", month: 5, day: 15 }),
  record("1615-aizu-drought", "disaster", "disaster", 1615, "exact-date", copy("Drought recorded in Aizu", "บันทึกภัยแล้งในไอซุ"), copy("A source reports drought through June in Aizu. The campaign uses the Mutsu key for lookup but retains Aizu in copy as the source locality.", "แหล่งข้อมูลรายงานภัยแล้งยาวถึงเดือนมิถุนายนในไอซุ แคมเปญใช้รหัสมุตสึในการค้นหา แต่คงชื่อไอซุไว้ในข้อความในฐานะพื้นที่ของแหล่ง."), ["mutsu"], disasterArchive, copy("26 June 1615", "26 มิถุนายน ค.ศ. 1615"), { season: "Summer", month: 6, day: 26 }),
  record("1615-hizen-nagasaki-smallpox", "disaster", "disaster", 1615, "exact-date", copy("Smallpox mortality report from Nagasaki", "รายงานผู้เสียชีวิตจากไข้ทรพิษที่นางาซากิ"), copy("An archival report records smallpox mortality in Nagasaki. It remains a source-specific public-health note and never automatically creates an epidemic in play.", "บันทึกจดหมายเหตุรายงานผู้เสียชีวิตจากไข้ทรพิษในนางาซากิ ข้อมูลนี้เป็นหมายเหตุสาธารณสุขเฉพาะแหล่ง และไม่สร้างโรคระบาดในเกมโดยอัตโนมัติ."), ["hizen"], disasterArchive, copy("13 July 1615", "13 กรกฎาคม ค.ศ. 1615"), { season: "Summer", month: 7, day: 13 }),
  record("1615-yamashiro-flood", "disaster", "disaster", 1615, "exact-date", copy("Flood damage reported in Yamashiro", "รายงานความเสียหายน้ำท่วมในยามาชิโระ"), copy("A Yamashiro village report records flooding and extensive field loss. It is local archival context, not a mandatory player consequence.", "รายงานจากหมู่บ้านในยามาชิโระบันทึกน้ำท่วมและความเสียหายต่อที่นาในวงกว้าง เป็นบริบทจดหมายเหตุท้องถิ่น ไม่ใช่ผลบังคับต่อผู้เล่น."), ["yamashiro"], disasterArchive, copy("23 July 1615", "23 กรกฎาคม ค.ศ. 1615"), { season: "Summer", month: 7, day: 23 }),
  record("1510s-amago-hoki-advance", "event", "provincial", 1510, "season", copy("Amago advance into Hōki’s Hino district", "การรุกของอามาโกะสู่เขตฮิโนะแห่งโฮกิ"), copy("A prefectural archive describes Amago Tsunehisa’s advance from Izumo into Hōki during the 1510s–1520s. It is a decade-scale political context, not a dated battle card.", "หอจดหมายเหตุจังหวัดบรรยายการรุกของอามาโกะ สึเนฮิสะจากอิซุโมะสู่โฮกิในทศวรรษ 1510–1520 จึงเป็นบริบทการเมืองระดับทศวรรษ ไม่ใช่การ์ดศึกที่ลงวันได้."), ["izumo", "hoki"], tottoriArchives, copy("1510s–1520s · year not fixed", "ทศวรรษ 1510–1520 · ยังไม่ระบุปี")),
  record("1521-amago-sanin-sanyo-expansion", "event", "provincial", 1521, "year", copy("Amago regional expansion", "การขยายอำนาจภูมิภาคของอามาโกะ"), copy("A local overview dates Amago expansion across parts of San’in and San’yō to 1521. The record is a source-labelled regional context, not a province-by-province ownership map.", "แหล่งท้องถิ่นลงวันที่การขยายอำนาจของอามาโกะครอบคลุมบางส่วนของซันอินและซันโยไว้ที่ ค.ศ. 1521 บันทึกนี้เป็นบริบทภูมิภาคตามแหล่ง ไม่ใช่แผนที่ผู้ครองแคว้นรายจังหวัด."), ["aki", "bingo", "bitchu", "bizen", "mimasaka", "harima", "inaba", "hoki", "izumo", "iwami", "oki"], yasugiTourism),
  record("1562-mori-izumo-hoki-advance", "event", "provincial", 1562, "year", copy("Mōri advance toward Izumo and Hōki", "การรุกของโมริสู่อิซุโมะและโฮกิ"), copy("A prefectural archive records Mōri Motonari’s advance toward Izumo and Hōki and shifting local allegiance. This does not impose a political stance on the player.", "หอจดหมายเหตุจังหวัดบันทึกการรุกของโมริ โมโตนาริสู่ิซุโมะและโฮกิพร้อมการเปลี่ยนฝ่ายของกลุ่มท้องถิ่น ข้อมูลนี้ไม่บังคับจุดยืนทางการเมืองแก่ผู้เล่น."), ["izumo", "hoki"], tottoriArchives),
  record("1566-gassan-toda-fall", "event", "provincial", 1566, "year", copy("Surrender of Gassan Toda Castle", "การยอมจำนนของปราสาทกัสซันโทดะ"), copy("A local overview dates the surrender of Gassan Toda Castle and Amago Yoshihisa’s fall to 1566. The card deliberately omits unsourced siege detail.", "แหล่งท้องถิ่นลงวันที่การยอมจำนนของปราสาทกัสซันโทดะและการล่มของอามาโกะ โยชิฮิสะไว้ที่ ค.ศ. 1566 การ์ดนี้ตัดรายละเอียดการล้อมที่ไม่มีแหล่งรองรับ."), ["izumo"], yasugiTourism),
  record("1569-amago-revival", "event", "provincial", 1569, "year", copy("Amago revival movement", "ขบวนการฟื้นอามาโกะ"), copy("A prefectural archive records the Amago revival movement under Katsuhisa and Yamanaka in Izumo and Hōki. It is background only unless campaign evidence connects to it.", "หอจดหมายเหตุจังหวัดบันทึกขบวนการฟื้นอามาโกะภายใต้คัตสึฮิสะและยามานากะในอิซุโมะกับโฮกิ ใช้เป็นฉากหลังเท่านั้น เว้นแต่หลักฐานในแคมเปญเชื่อมถึงเหตุการณ์นี้."), ["izumo", "hoki"], tottoriArchives),
  record("1578-kozuki-fall", "battle", "provincial", 1578, "month", copy("Fall of Kōzuki Castle", "การแตกของปราสาทโคซึกิ"), copy("The Kōzuki Castle force fell in Harima in July 1578. Hōki leaders are documented among the Amago side, but Hōki is not represented as the battle location.", "กองกำลังที่ปราสาทโคซึกิในฮาริมะแตกในเดือนกรกฎาคม ค.ศ. 1578 มีการบันทึกผู้นำจากโฮกิอยู่ฝ่ายอามาโกะ แต่โฮกิไม่ถูกระบุว่าเป็นสถานที่ของศึก."), ["harima", "hoki"], tottoriArchives, copy("July 1578", "กรกฎาคม ค.ศ. 1578"), { season: "Summer", month: 7 }),
];

export const HISTORICAL_YEAR_LEDGER: HistoricalYearLedger[] = Array.from({ length: 1615 - 1467 + 1 }, (_, index) => {
  const year = 1467 + index;
  const recordIds = HISTORICAL_TIMELINE.filter((entry) => entry.year === year).map((entry) => entry.id);
  return { year, recordIds, status: recordIds.length ? "reviewed-events" : "no-reviewed-event" };
});

const aliases: Record<string, SengokuProvinceId> = {
  sakai: "izumi", saika: "izumi", izumi: "izumi", omi: "omi", "ōmi": "omi", owari: "owari", mikawa: "mikawa", iga: "iga", kii: "kii", yamashiro: "yamashiro", settsu: "settsu", musashi: "musashi", iyo: "iyo", shima: "shima", shinano: "shinano", kaga: "kaga", yamato: "yamato", kawachi: "kawachi", mino: "mino", harima: "harima", aki: "aki", satsuma: "satsuma", bungo: "bungo", hizen: "hizen", dewa: "dewa", mutsu: "mutsu",
};

export function timelineRegionKey(region: string): SengokuProvinceId {
  const normalized = region.toLowerCase();
  return Object.entries(aliases).find(([key]) => normalized.includes(key))?.[1] ?? "yamato";
}

export function timelineForCampaign(year: number, region: string) {
  const key = timelineRegionKey(region);
  return HISTORICAL_TIMELINE.filter((record) => record.year === year).map((record) => ({ ...record, relevance: record.regionKeys.includes(key) ? "regional" as const : "national" as const }));
}

export function historicalYearLedger(year: number) {
  return HISTORICAL_YEAR_LEDGER.find((entry) => entry.year === year) ?? { year, recordIds: [], status: "no-reviewed-event" as const };
}

export function historicalBriefForCampaign(campaign: { year: number; season: string; region: string; day: number; historicalDate?: { month: number; day: number; source: "player-confirmed" } }) {
  const ledger = historicalYearLedger(campaign.year);
  const records = timelineForCampaign(campaign.year, campaign.region);
  const exactRecords = campaign.historicalDate
    ? records.filter((entry) => entry.precision === "exact-date" && entry.month === campaign.historicalDate?.month && entry.day === campaign.historicalDate?.day)
    : [];
  const contextualRecords = records.filter((entry) => entry.precision !== "exact-date").slice(0, 4);
  const dateGate = campaign.historicalDate
    ? { kind: "player-confirmed" as const, value: `${campaign.year}-${String(campaign.historicalDate.month).padStart(2, "0")}-${String(campaign.historicalDate.day).padStart(2, "0")}` }
    : { kind: "synthetic-scene-day" as const, value: `${campaign.year} · ${campaign.season} · scene day ${campaign.day}` };
  return { ledger, dateGate, exactRecords, contextualRecords };
}

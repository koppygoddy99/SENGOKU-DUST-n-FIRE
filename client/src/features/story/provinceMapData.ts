export type InteractiveProvince = {
  id: string;
  en: string;
  th: string;
  jp: string;
  x: number;
  y: number;
  focus: { en: string; th: string };
};

const province = (id: string, en: string, th: string, jp: string, x: number, y: number, focusEn: string, focusTh: string): InteractiveProvince => ({
  id, en, th, jp, x, y, focus: { en: focusEn, th: focusTh },
});

/**
 * Pre-Meiji province names, positioned as interactive label/hit targets over
 * the user-authorized national map. This is a geographic layer, never a
 * daimyo-control layer. Coordinates are deliberately approximate label centers
 * on the supplied map artwork; the visible boundary linework stays in the art.
 */
export const INTERACTIVE_PROVINCES: readonly InteractiveProvince[] = [
  province("yamashiro", "Yamashiro", "ยามาชิโระ", "山城", 49, 64, "Capital approaches, court roads, and the Kyoto basin.", "ทางสู่ศูนย์กลางการเมืองและแอ่งเกียวโต."),
  province("yamato", "Yamato", "ยามาโตะ", "大和", 50, 70, "An inland basin shaped by temple roads and cultivated ground.", "แอ่งในแผ่นดินที่เชื่อมทางวัดและพื้นที่เพาะปลูก."),
  province("kawachi", "Kawachi", "คาวาจิ", "河内", 48, 70, "Lowland roads and river crossings east of Osaka Bay.", "ทางราบและทางข้ามน้ำทางตะวันออกของอ่าวโอซากะ."),
  province("izumi", "Izumi", "อิซุมิ", "和泉", 45.5, 72, "A coastal province south of the Yamato River, near port-facing routes.", "แคว้นชายฝั่งใต้แม่น้ำยามาโตะ เชื่อมเส้นทางเมืองท่า."),
  province("settsu", "Settsu", "เซ็ตสึ", "摂津", 46, 67, "The Osaka–Kobe plain, where river, road, and harbor routes meet.", "ที่ราบโอซากะ–โกเบ ที่ทางน้ำ ถนน และท่าเรือมาบรรจบกัน."),

  province("iga", "Iga", "อิกะ", "伊賀", 51, 66, "An inland basin linked to Ise, Ōmi, Yamato, and Yamashiro by passes.", "แอ่งในแผ่นดินที่เชื่อมอิเสะ โอมิ ยามาโตะ และยามาชิโระด้วยช่องเขา."),
  province("ise", "Ise", "อิเสะ", "伊勢", 64, 79, "Coastal and inland routes on the east side of the Kii Peninsula.", "เส้นทางชายฝั่งและเส้นทางด้านในทางตะวันออกของคาบสมุทรกิอิ."),
  province("shima", "Shima", "ชิมะ", "志摩", 68, 81, "A small indented peninsula facing Ise Bay and the sea.", "คาบสมุทรขนาดเล็กที่เว้าแหว่ง หันสู่ทะเลและอ่าวอิเสะ."),
  province("kii", "Kii", "กิอิ", "紀伊", 48, 77, "A broad, wooded peninsula with difficult southern routes.", "คาบสมุทรป่ากว้างที่มีเส้นทางใต้ยากลำบาก."),
  province("awaji", "Awaji", "อาวาจิ", "淡路", 50, 80, "Island passage between Honshū and Shikoku.", "เกาะที่เป็นทางผ่านระหว่างฮนชูและชิโกกุ."),

  province("omi", "Ōmi", "โอมิ", "近江", 53, 60, "Lake Biwa, its shore roads, and passes between central regions.", "ทะเลสาบบิวะ ทางเลียบฝั่ง และช่องเขาที่เชื่อมภาคกลาง."),
  province("wakasa", "Wakasa", "วากาสะ", "若狭", 60, 65, "A Sea of Japan coast linked southward through mountain routes.", "ชายฝั่งทะเลญี่ปุ่นที่เชื่อมลงใต้ผ่านเส้นทางภูเขา."),
  province("echizen", "Echizen", "เอจิเซ็น", "越前", 62, 62, "Northern coastal plain and the gateway to Hokuriku.", "ที่ราบชายฝั่งเหนือและประตูสู่โฮคุริคุ."),
  province("kaga", "Kaga", "คางะ", "加賀", 57, 52, "A Hokuriku coastal province between Echizen, Noto, Etchū, and Hida.", "แคว้นชายฝั่งโฮคุริคุระหว่างเอจิเซ็น โนโตะ เอ็ตจู และฮิดะ."),
  province("noto", "Noto", "โนโตะ", "能登", 69, 56, "The long peninsula reaching into the Sea of Japan.", "คาบสมุทรยาวที่ยื่นออกสู่ทะเลญี่ปุ่น."),
  province("etchu", "Etchū", "เอ็ตจู", "越中", 73, 59, "A Sea of Japan corridor between mountain country and the coast.", "ทางผ่านระหว่างภูเขากับชายฝั่งทะเลญี่ปุ่น."),
  province("echigo", "Echigo", "เอจิโงะ", "越後", 78, 57, "Northern Sea of Japan routes and a broad coastal plain.", "เส้นทางเหนือริมทะเลญี่ปุ่นและที่ราบชายฝั่งกว้าง."),
  province("sado", "Sado", "ซาโดะ", "佐渡", 76, 51, "An island off the Echigo coast, reached by sea crossings.", "เกาะนอกฝั่งเอจิโงะที่เข้าถึงด้วยการข้ามทะเล."),

  province("tanba", "Tanba", "ทัมบะ", "丹波", 56, 67, "Interior valleys and routes between the capital region and the San'in coast.", "หุบเขาด้านในและเส้นทางระหว่างเขตเมืองหลวงกับชายฝั่งซันอิน."),
  province("tango", "Tango", "ทังโกะ", "丹後", 54, 62, "A northern Kyoto coast of inlets and sea-facing roads.", "ชายฝั่งเหนือของเกียวโตที่มีอ่าวและเส้นทางริมทะเล."),
  province("tajima", "Tajima", "ทาจิมะ", "但馬", 51, 63, "Mountain routes and a rugged coast north of Harima.", "เส้นทางภูเขาและชายฝั่งขรุขระทางเหนือของฮาริมะ."),
  province("harima", "Harima", "ฮาริมะ", "播磨", 49, 76, "A Harima plain corridor between the Kinai and western Honshū.", "ทางผ่านที่ราบฮาริมะระหว่างคิไนกับฮนชูตะวันตก."),
  province("mimasaka", "Mimasaka", "มิมาซากะ", "美作", 45, 70, "An upland interior of passes between Harima and Bizen.", "ดินแดนสูงด้านในที่มีช่องเขาระหว่างฮาริมะและบิเซ็น."),
  province("bizen", "Bizen", "บิเซ็น", "備前", 45, 76, "Inland Sea shore and the eastern Okayama approaches.", "ชายฝั่งทะเลในและทางเข้าสู่โอกายามะด้านตะวันออก."),
  province("bitchu", "Bitchū", "บิตชู", "備中", 42, 74, "River valleys joining the Inland Sea and inland crossings.", "หุบแม่น้ำที่เชื่อมทะเลในกับทางข้ามด้านใน."),
  province("bingo", "Bingo", "บิงโก", "備後", 39, 75, "An Inland Sea coast with ports and westbound routes.", "ชายฝั่งทะเลในที่มีท่าเรือและเส้นทางไปตะวันตก."),
  province("aki", "Aki", "อากิ", "安芸", 35, 74, "A coastal and island-facing province on the western Inland Sea.", "แคว้นชายฝั่งและเกาะริมทะเลในตะวันตก."),
  province("suo", "Suō", "ซูโอะ", "周防", 29, 75, "The eastern Yamaguchi coast around Inland Sea passages.", "ชายฝั่งยามางุจิด้านตะวันออก รอบทางผ่านในทะเลใน."),
  province("nagato", "Nagato", "นากาโตะ", "長門", 26, 75, "The western tip of Honshū, facing straits and sea routes.", "ปลายตะวันตกของฮนชูที่หันสู่ช่องแคบและเส้นทางทะเล."),
  province("iwami", "Iwami", "อิวะมิ", "石見", 30, 66, "A Sea of Japan coast west of Izumo, backed by mountain country.", "ชายฝั่งทะเลญี่ปุ่นทางตะวันตกของอิซุโมะ มีภูเขาด้านหลัง."),
  province("izumo", "Izumo", "อิซุโมะ", "出雲", 34, 64, "A northern coast of plains, lakes, and sea approaches.", "ชายฝั่งเหนือที่มีที่ราบ ทะเลสาบ และทางออกสู่ทะเล."),
  province("hoki", "Hōki", "โฮกิ", "伯耆", 38, 63, "A central San'in coast beneath the Daisen mountain area.", "ชายฝั่งซันอินตอนกลางใต้แนวภูเขาไดเซ็น."),
  province("inaba", "Inaba", "อินาบะ", "因幡", 40, 66, "Eastern San'in routes between the coast and mountain passes.", "เส้นทางซันอินตะวันออกระหว่างชายฝั่งและช่องเขา."),
  province("oki", "Oki", "โอกิ", "隠岐", 31, 56, "Offshore islands in the Sea of Japan.", "หมู่เกาะนอกฝั่งในทะเลญี่ปุ่น."),

  province("iyo", "อิโยะ", "อิโยะ", "伊予", 38.5, 77.5, "The western Shikoku coast and ridges behind it.", "ชายฝั่งชิโกกุตะวันตกและแนวสันเขาด้านใน."),
  province("sanuki", "Sanuki", "ซานุกิ", "讃岐", 48, 80, "A northern Shikoku coast facing the Inland Sea.", "ชายฝั่งชิโกกุเหนือที่หันสู่ทะเลใน."),
  province("awa-shikoku", "Awa", "อาวะ", "阿波", 46, 83, "Eastern Shikoku routes toward the Naruto Strait.", "เส้นทางชิโกกุตะวันออกสู่ช่องแคบนารูโตะ."),
  province("tosa", "Tosa", "โทสะ", "土佐", 47, 90, "A Pacific-facing southern Shikoku province separated by mountains.", "แคว้นชิโกกุใต้หันสู่แปซิฟิกและถูกกั้นด้วยภูเขา."),

  province("chikuzen", "Chikuzen", "จิคุเซ็น", "筑前", 14, 74, "Northern Kyūshū coast and continental-facing sea routes.", "ชายฝั่งคิวชูเหนือและเส้นทางทะเลที่หันสู่ทวีป."),
  province("chikugo", "Chikugo", "จิคุโกะ", "筑後", 14, 80, "The river plain south of Chikuzen.", "ที่ราบแม่น้ำทางใต้ของจิคุเซ็น."),
  province("hizen", "Hizen", "ฮิเซ็น", "肥前", 7, 78, "Northwestern Kyūshū shores, bays, and island-facing routes.", "ชายฝั่งคิวชูตะวันตกเฉียงเหนือที่มีอ่าวและเส้นทางสู่หมู่เกาะ."),
  province("higo", "Higo", "ฮิโกะ", "肥後", 11, 85, "Central-western Kyūshū plains and inland routes.", "ที่ราบคิวชูตอนกลางตะวันตกและเส้นทางด้านใน."),
  province("buzen", "Buzen", "บูเซ็น", "豊前", 20, 78, "Northeastern Kyūshū approaches to the Inland Sea.", "ทางเข้าคิวชูตะวันออกเฉียงเหนือสู่ทะเลใน."),
  province("bungo", "Bungo", "บุงโงะ", "豊後", 21, 84, "Eastern Kyūshū bays and routes across the Bungo Channel.", "อ่าวคิวชูตะวันออกและเส้นทางข้ามช่องแคบบุงโงะ."),
  province("hyuga", "Hyūga", "ฮิวงะ", "日向", 24, 90, "Pacific coast and mountain corridors of eastern Kyūshū.", "ชายฝั่งแปซิฟิกและแนวทางภูเขาของคิวชูตะวันออก."),
  province("satsuma", "Satsuma", "ซัตสึมะ", "薩摩", 8, 94, "Southwestern Kyūshū coast and southern sea approaches.", "ชายฝั่งคิวชูตะวันตกเฉียงใต้และทางออกสู่ทะเลใต้."),
  province("osumi", "Ōsumi", "โอซูมิ", "大隅", 16, 95, "The southeastern tip of Kyūshū facing the Pacific.", "ปลายตะวันออกเฉียงใต้ของคิวชูที่หันสู่แปซิฟิก."),
  province("iki", "Iki", "อิกิ", "壱岐", 5, 70, "An island stepping-stone between Kyūshū and the Korean Strait.", "เกาะทางผ่านระหว่างคิวชูกับช่องแคบเกาหลี."),
  province("tsushima", "Tsushima", "สึชิมะ", "対馬", 1, 66, "A strait island route west of Kyūshū.", "เส้นทางเกาะในช่องแคบทางตะวันตกของคิวชู."),

  province("owari", "Owari", "โอวาริ", "尾張", 56, 69, "Western Aichi plain, including the Nagoya area and river approaches.", "ที่ราบไอจิฝั่งตะวันตก รวมพื้นที่นาโกยะและทางน้ำ."),
  province("mikawa", "Mikawa", "มิกาวะ", "三河", 58, 71, "Eastern Aichi rivers, coastal road, and routes toward Shinano.", "แม่น้ำและทางชายฝั่งไอจิตะวันออก เชื่อมสู่ชินาโนะ."),
  province("totomi", "Tōtōmi", "โทโตมิ", "遠江", 75, 75, "A Pacific coast corridor between Mikawa and Suruga.", "ทางผ่านชายฝั่งแปซิฟิกระหว่างมิกาวะกับซูรุกะ."),
  province("suruga", "Suruga", "ซูรุกะ", "駿河", 78, 72, "Suruga Bay, mountain foothills, and the approach to the Kantō side.", "อ่าวซูรุกะ เชิงเขา และทางเข้าสู่ฝั่งคันโต."),
  province("izu", "Izu", "อิซุ", "伊豆", 82, 76, "A peninsula and island-facing coast south of Suruga.", "คาบสมุทรและชายฝั่งสู่หมู่เกาะทางใต้ของซูรุกะ."),
  province("kai", "Kai", "ไค", "甲斐", 76, 69, "A landlocked mountain basin along the Fuji region.", "แอ่งภูเขาไร้ทางออกสู่ทะเลบริเวณฟูจิ."),
  province("sagami", "Sagami", "ซางามิ", "相模", 83, 71, "A bay and coast corridor west of the Kantō plain.", "ทางผ่านอ่าวและชายฝั่งทางตะวันตกของที่ราบคันโต."),
  province("musashi", "Musashi", "มูซาชิ", "武蔵", 71.5, 66.5, "The wide Kantō plain around later Edo and its river network.", "ที่ราบคันโตกว้างและเครือข่ายแม่น้ำรอบเอโดะในเวลาต่อมา."),
  province("kozuke", "Kōzuke", "โคซุเกะ", "上野", 79, 62, "Northern Kantō uplands and routes toward Shinano and Echigo.", "ที่สูงคันโตเหนือและเส้นทางสู่ชินาโนะกับเอจิโงะ."),
  province("shimotsuke", "Shimotsuke", "ชิโมสึเกะ", "下野", 84, 61, "Northern Kantō plains between mountain and river routes.", "ที่ราบคันโตเหนือระหว่างภูเขากับเส้นทางแม่น้ำ."),
  province("hitachi", "Hitachi", "ฮิตาจิ", "常陸", 89, 63, "Pacific-facing eastern Kantō routes.", "เส้นทางคันโตตะวันออกที่หันสู่แปซิฟิก."),
  province("shimosa", "Shimōsa", "ชิโมสะ", "下総", 88, 69, "Northern Bōsō and lowland routes east of Musashi.", "โบโซเหนือและเส้นทางที่ราบทางตะวันออกของมูซาชิ."),
  province("kazusa", "Kazusa", "คาซูสะ", "上総", 89, 74, "The middle Bōsō Peninsula, between Tokyo Bay and the Pacific.", "คาบสมุทรโบโซตอนกลาง ระหว่างอ่าวโตเกียวกับแปซิฟิก."),
  province("awa-boso", "Awa", "อาวะ", "安房", 88, 79, "The southern tip of the Bōsō Peninsula and sea crossings.", "ปลายใต้ของคาบสมุทรโบโซและเส้นทางข้ามทะเล."),
  province("mino", "Mino", "มิโนะ", "美濃", 66, 70, "A central plain and mountain-pass network between Owari and Ōmi.", "ที่ราบกลางและเครือข่ายช่องเขาระหว่างโอวาริกับโอมิ."),
  province("hida", "Hida", "ฮิดะ", "飛騨", 68, 66, "A high mountain interior, where passes control movement.", "พื้นที่ภูเขาสูงด้านใน ซึ่งช่องเขากำหนดการเดินทาง."),
  province("shinano", "Shinano", "ชินาโนะ", "信濃", 62, 60, "A wide highland province of basins, rivers, and mountain roads.", "แคว้นพื้นที่สูงกว้าง มีแอ่ง แม่น้ำ และทางภูเขา."),
  province("dewa", "Dewa", "เดวะ", "出羽", 83, 47, "Northern Honshū coast and interior mountain corridors.", "ชายฝั่งฮนชูเหนือและเส้นทางภูเขาด้านใน."),
  province("mutsu", "Mutsu", "มุตสึ", "陸奥", 88, 42, "The broad northern Honshū region beyond the central provinces.", "ดินแดนฮนชูเหนือกว้างใหญ่พ้นจากแคว้นภาคกลาง."),
];

export const PROVINCE_BY_ID = new Map(INTERACTIVE_PROVINCES.map((entry) => [entry.id, entry]));

export function provinceName(entry: InteractiveProvince, language: "en" | "th") {
  return language === "en" ? entry.en : entry.th;
}

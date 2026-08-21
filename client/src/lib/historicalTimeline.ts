import type { Season } from "@/lib/game";

export type TimelineKind = "battle" | "event";
export type DatePrecision = "year" | "season" | "month" | "exact-date";
export type TimelineCopy = { en: string; th: string };

export type HistoricalTimelineRecord = {
  id: string;
  kind: TimelineKind;
  year: number;
  precision: DatePrecision;
  season?: Season;
  month?: number;
  date: TimelineCopy;
  title: TimelineCopy;
  summary: TimelineCopy;
  regionKeys: string[];
  source: { label: string; url: string };
};

const source1569 = { label: "Sengoku Shogun Map · 1569", url: "https://ufirst.jp/sengoku-map/en/1569" };
const source1570 = { label: "Sengoku Shogun Map · 1570", url: "https://ufirst.jp/sengoku-map/en/1570#5.26/35.522/138.094/0/30" };

/**
 * Reviewed, finite historical context for the currently supported campaign years.
 * This is not a territorial simulator and never mutates roll, mission, or player state.
 */
export const HISTORICAL_TIMELINE: HistoricalTimelineRecord[] = [
  {
    id: "1569-honkokuji-incident", kind: "event", year: 1569, precision: "year", date: { en: "1569 · Eiroku 12", th: "ค.ศ. 1569 · รัชศกเอโรคุ 12" },
    title: { en: "Honkoku-ji Incident", th: "เหตุการณ์ฮงโคคุจิ" },
    summary: { en: "The year view records an attack on Ashikaga Yoshiaki's temporary residence at Honkoku-ji and its defense before Nobunaga returned to Kyoto.", th: "บันทึกประจำปีระบุการโจมตีที่พำนักชั่วคราวของอาชิคางะ โยชิอากิ ณ ฮงโคคุจิ และการตั้งรับก่อนโนบุนางะกลับถึงเกียวโต" },
    regionKeys: ["yamashiro"], source: source1569,
  },
  {
    id: "1569-nijo-palace", kind: "event", year: 1569, precision: "year", date: { en: "1569 · month not specified", th: "ค.ศ. 1569 · ไม่ระบุเดือน" },
    title: { en: "Nijō Palace built for Ashikaga Yoshiaki", th: "การสร้างตำหนักนิโจสำหรับอาชิคางะ โยชิอากิ" },
    summary: { en: "The source lists construction of a fortified Nijō residence for the shogun; it does not provide a month, so this record is deliberately year-level only.", th: "แหล่งข้อมูลระบุการสร้างที่พำนักนิโจที่มีการป้องกันสำหรับโชกุน แต่ไม่ให้เดือน จึงแสดงเหตุการณ์นี้ในระดับปีเท่านั้น" },
    regionKeys: ["yamashiro"], source: source1569,
  },
  {
    id: "1570-kanegasaki-retreat", kind: "event", year: 1570, precision: "month", season: "Spring", month: 4, date: { en: "Spring · month 4", th: "วสันต์ · เดือน 4" },
    title: { en: "Retreat at Kanegasaki", th: "การถอยทัพที่คาเนงาซากิ" },
    summary: { en: "The year view places the retreat during the Echizen campaign after Azai Nagamasa's defection became apparent.", th: "หน้าปีระบุการถอยทัพระหว่างศึกเอจิเซ็น หลังการแตกจากฝ่ายของอาซาอิ นางามาซะปรากฏชัด" },
    regionKeys: ["omi"], source: source1570,
  },
  {
    id: "1570-anegawa", kind: "battle", year: 1570, precision: "exact-date", season: "Summer", month: 7, date: { en: "30 July 1570", th: "30 กรกฎาคม ค.ศ. 1570" },
    title: { en: "Battle of Anegawa", th: "ศึกอาเนงาวะ" },
    summary: { en: "The Oda–Tokugawa alliance defeated the Azai–Asakura alliance in Ōmi; the source notes that the Azai were not destroyed by the battle.", th: "พันธมิตรโอดะ–โทกูงาวะชนะพันธมิตรอาซาอิ–อาซากูระในโอมิ โดยแหล่งข้อมูลระบุว่าอาซาอิไม่ได้ถูกทำลายลงด้วยศึกครั้งนี้" },
    regionKeys: ["omi"], source: source1570,
  },
  {
    id: "1570-ishiyama-war", kind: "event", year: 1570, precision: "month", season: "Summer", month: 8, date: { en: "Summer · month 8", th: "คิมหันต์ · เดือน 8" },
    title: { en: "Outbreak of the Ishiyama War", th: "การเริ่มสงครามอิชิยามะ" },
    summary: { en: "The source records the rise of Ishiyama Hongan-ji against Nobunaga in Settsu, beginning a prolonged conflict.", th: "แหล่งข้อมูลบันทึกการลุกขึ้นของอิชิยามะฮงกันจิในเซ็ตสึเพื่อต่อต้านโนบุนางะ อันเป็นจุดเริ่มของความขัดแย้งยืดเยื้อ" },
    regionKeys: ["settsu"], source: source1570,
  },
  {
    id: "1570-noda-fukushima", kind: "battle", year: 1570, precision: "month", season: "Autumn", month: 9, date: { en: "Autumn · month 9", th: "สารท · เดือน 9" },
    title: { en: "Battle of Noda–Fukushima", th: "ศึกโนดะ–ฟูกูชิมะ" },
    summary: { en: "The year view places fighting in Settsu around the strongholds of Noda and Fukushima during the wider conflict.", th: "หน้าปีวางการสู้รบในเซ็ตสึรอบฐานที่มั่นโนดะและฟูกูชิมะในบริบทความขัดแย้งที่กว้างกว่า" },
    regionKeys: ["settsu"], source: source1570,
  },
  {
    id: "1570-siege-of-shiga", kind: "battle", year: 1570, precision: "month", season: "Autumn", month: 10, date: { en: "Autumn · month 10", th: "สารท · เดือน 10" },
    title: { en: "Siege of Shiga", th: "การล้อมชิงะ" },
    summary: { en: "The source describes fighting near Sakamoto–Ōtsu in Ōmi, with the situation continuing into the following year.", th: "แหล่งข้อมูลอธิบายการปะทะใกล้ซากาโมโตะ–โอสึในโอมิ ซึ่งสถานการณ์ดำเนินต่อไปถึงปีถัดไป" },
    regionKeys: ["omi"], source: source1570,
  },
];

export function timelineRegionKey(region: string) {
  const normalized = region.toLowerCase();
  if (normalized.includes("sakai") || normalized.includes("izumi") || normalized.includes("ซาไก") || normalized.includes("อิซุมิ")) return "izumi";
  const known = ["mikawa", "omi", "owari", "iga", "koga", "kii", "yamashiro", "settsu", "musashi", "iyo", "shima", "shinano", "kaga", "yamato", "kawachi"];
  return known.find((key) => normalized.includes(key)) ?? "yamato";
}

export function timelineForCampaign(year: number, region: string) {
  const key = timelineRegionKey(region);
  return HISTORICAL_TIMELINE.filter((record) => record.year === year).map((record) => ({ ...record, relevance: record.regionKeys.includes(key) ? "regional" as const : "national" as const }));
}

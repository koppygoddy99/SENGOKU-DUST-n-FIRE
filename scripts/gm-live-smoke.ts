import { analyzeWithGM, resolveWithGM } from "../server/gm";

const context = {
  campaign: { title: "Live GM test", year: 1578, season: "Summer", region: "Mikawa", location: "ตลาดหน้าด่าน", warShadow: 3, day: 1 },
  character: { name: "ซาโตะ", occupation: "ทหารเดินเท้า", origin: "ชายแดน", strengths: "อ่านเส้นทางหนีได้ไว", weakness: "ติดหนี้คนเรือ", attributes: { body: 2, hand: 2, wit: 3, mind: 2, heart: 2 }, masteries: [{ name: "ตาไว", level: 2, source: "เวรยามชายแดน" }] },
  currentScene: { title: "ค่าจ้างระหว่างทาง", location: "ตลาดหน้าด่าน", summary: "เสมียนกำลังจะปิดบัญชีข้าว ขณะที่ทหารด่านเริ่มถามหาที่มาของเจ้า", pressure: "พยานคนหนึ่งกำลังฟัง", declaredChoices: ["ขอดูบัญชี", "ถามคนเรือ"] },
  activeMission: { title: "เปิดทางข้ามฟาก", giver: "คนเรือ", objective: "หาใบผ่านทางก่อนค่ำ", deadline: "ก่อนฟ้ามืด", reward: "เส้นทางลับ" },
  socialState: { honor: 2, influence: 1, stain: 0, rumors: [], oaths: [], debts: ["ติดหนี้คนเรือ"] },
  recentMemories: [],
};

const analysis = await analyzeWithGM({ action: "ข้าจะยื่นบัญชีข้าวให้เสมียนดู แล้วขอเวลาเพิ่มก่อนพวกทหารจะเข้ามาถาม", language: "th", context });
const resolution = await resolveWithGM({ language: "th", context, action: "ข้าจะยื่นบัญชีข้าวให้เสมียนดู แล้วขอเวลาเพิ่มก่อนพวกทหารจะเข้ามาถาม", roll: { outcome: "success_with_cost", total: 16, difficulty: analysis.difficulty, summary: "เสมียนยอมฟัง", consequence: "ทหารที่ด่านจำหน้าของเจ้าได้" } });

console.log(JSON.stringify({ analysis: { axis: analysis.axis, difficulty: analysis.difficulty, intent: analysis.intentSummary }, resolution: { sceneTitle: resolution.sceneTitle, paragraphs: resolution.narration.length, choices: resolution.nextChoices.length, memoryTone: resolution.memory.tone } }, null, 2));

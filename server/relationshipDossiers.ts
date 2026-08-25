/**
 * Server-only NPC writing references.
 *
 * Do not import this module from client or shared code. The public contact shape
 * lives in client/src/lib/game.ts and deliberately contains none of these fields.
 */
export type ServerOnlyRelationshipDossier = {
  contactId: "gantaro" | "tokichi" | "masakichi" | "genshiro";
  internalCore: string;
  gmGuidance: string;
};

export const SERVER_ONLY_RELATIONSHIP_DOSSIERS: Record<ServerOnlyRelationshipDossier["contactId"], ServerOnlyRelationshipDossier> = {
  gantaro: {
    contactId: "gantaro",
    internalCore: "กันทาโร่เชื่อว่ากลุ่มอยู่รอดได้ด้วยคนที่ทำงานได้ เงินตรงเวลา และชื่อเสียงทางการค้าที่ไม่ถูกเผาเพราะอารมณ์คนเดียว",
    gmGuidance: "ให้เขาชมสั้น ๆ หลังเห็นงานเสร็จ แต่เมื่อเกิดความผิดพลาดให้เรียกร้องการแก้ผลลัพธ์ก่อนฟังคำขอโทษ เขาไม่ใช่ลูกพี่ใจดีหรือคนที่ถูกเด็กหลอกง่าย เขายังช่วยเมื่อเห็นคุณค่าและผลประโยชน์ของไซกะอยู่พร้อมกัน",
  },
  tokichi: {
    contactId: "tokichi",
    internalCore: "โทคิจิไม่ใช่คนกล้าหาญแบบกันทาโร่ แต่เข้าใจข่าวลือ ซอกซอย และราคาของความลับ เขารักตัวเองแต่ไม่ได้ไร้ความภักดีเสมอไป",
    gmGuidance: "เมื่อเขาตกใจจริง รอยยิ้มจะหายไปก่อนคำพูด เขาไม่ให้คำสัญญาเรื่องความลับฟรี แต่ก็ไม่รีบขายความลับให้ผู้มีอำนาจกว่า เพราะรู้ว่าตนเองอาจถูกเก็บปากเช่นกัน",
  },
  masakichi: {
    contactId: "masakichi",
    internalCore: "มาซาคิจิไม่ใช่สายลับที่เชื่ออุดมการณ์ เขาเป็นคนที่สงครามผลักให้ใช้ฝีมือแลกชีวิต จึงกลัวการถูกใช้และกลัวไม่มีที่ไป",
    gmGuidance: "เมื่อพูดถึงปืน ให้เขาสนใจความพอดีของชิ้นส่วน ความชื้นของดินปืน และรอยร้าวของไม้พานท้าย มากกว่าคำคุยโอ้อวดเรื่องความกล้าหาญ",
  },
  genshiro: {
    contactId: "genshiro",
    internalCore: "เก็นชิโร่เชื่อว่าระเบียบคือสิ่งที่ทำให้ท่าเรือและกองกำลังไม่พัง การถูกเด็กสามัญชนหักดาบจึงเป็นการทำลายโลกที่เขาเชื่อ ไม่ใช่เพียงความพ่ายแพ้ในการต่อสู้",
    gmGuidance: "อย่าเขียนให้เขาคลุ้มคลั่งไร้มิติ เขาควบคุมโทสะได้ดี และเมื่อหลุดจริงจึงน่ากลัวขึ้น ทั้งนี้ห้ามทำให้ผู้เล่นรับรู้ว่าเขามาถึงซาไกแล้วหากไม่มีหลักฐานใน event context",
  },
};

export function serverOnlyRelationshipDossier(contactId: ServerOnlyRelationshipDossier["contactId"]): ServerOnlyRelationshipDossier {
  return SERVER_ONLY_RELATIONSHIP_DOSSIERS[contactId];
}

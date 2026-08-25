export type ManagementAudience = "player" | "admin";

export type ManagementItemId =
  | "profile"
  | "usage"
  | "billing"
  | "app-settings"
  | "access"
  | "analytics"
  | "admin"
  | "guides"
  | "privacy";

export type ManagementMenuItem = {
  id: ManagementItemId;
  en: string;
  th: string;
  groupEn: string;
  groupTh: string;
  audience: ManagementAudience;
  descriptionEn: string;
  descriptionTh: string;
  supportsEn: string[];
  supportsTh: string[];
  noteEn?: string;
  noteTh?: string;
};

export type ManagementMenuSection = { id: "account" | "workspace" | "resources"; en: string; th: string; items: ManagementMenuItem[] };

const sections: ManagementMenuSection[] = [
  { id: "account", en: "Account", th: "บัญชี", items: [
    { id: "profile", en: "Profile", th: "โปรไฟล์", groupEn: "Account", groupTh: "บัญชี", audience: "player", descriptionEn: "Account identity and personal preferences will appear here when account records are connected.", descriptionTh: "ข้อมูลบัญชีและการตั้งค่าส่วนตัวจะแสดงที่นี่เมื่อเชื่อมข้อมูลบัญชีแล้ว", supportsEn: ["Display identity", "Account preferences", "Connected-account status"], supportsTh: ["ตัวตนที่แสดง", "การตั้งค่าบัญชี", "สถานะการเชื่อมบัญชี"] },
    { id: "usage", en: "Plan & usage", th: "แพ็กเกจและการใช้งาน", groupEn: "Account", groupTh: "บัญชี", audience: "player", descriptionEn: "Plan information and usage history need an authenticated account before they can be shown accurately.", descriptionTh: "ข้อมูลแพ็กเกจและประวัติการใช้งานต้องอาศัยบัญชีที่ยืนยันตัวตนก่อนจึงแสดงได้อย่างถูกต้อง", supportsEn: ["Plan entitlement", "Usage history", "Service notices"], supportsTh: ["สิทธิ์ของแพ็กเกจ", "ประวัติการใช้งาน", "ประกาศของบริการ"] },
    { id: "billing", en: "Billing & invoices", th: "การเรียกเก็บเงินและใบเสร็จ", groupEn: "Account", groupTh: "บัญชี", audience: "player", descriptionEn: "Billing is not connected in this prototype. No payment method, price, invoice, or charge is available from this page.", descriptionTh: "ต้นแบบนี้ยังไม่เชื่อมระบบเรียกเก็บเงิน หน้านี้ไม่มีวิธีชำระเงิน ราคา ใบเสร็จ หรือการเรียกเก็บเงินจริง", supportsEn: ["Billing history", "Invoice access", "Payment-method controls"], supportsTh: ["ประวัติการเรียกเก็บ", "การเข้าถึงใบเสร็จ", "การจัดการวิธีชำระเงิน"], noteEn: "No payment action is available.", noteTh: "ไม่มีการชำระเงินจริงจากหน้านี้" },
  ] },
  { id: "workspace", en: "Workspace", th: "พื้นที่จัดการ", items: [
    { id: "app-settings", en: "Application settings", th: "การตั้งค่าแอป", groupEn: "Workspace", groupTh: "พื้นที่จัดการ", audience: "player", descriptionEn: "Application-level settings will stay separate from campaign reading and play settings.", descriptionTh: "การตั้งค่าระดับแอปจะแยกจากการตั้งค่าการอ่านและการเล่นของแคมเปญ", supportsEn: ["Application defaults", "Display preferences", "Service connections"], supportsTh: ["ค่าเริ่มต้นของแอป", "การตั้งค่าการแสดงผล", "การเชื่อมต่อบริการ"] },
    { id: "access", en: "Access & roles", th: "สิทธิ์และบทบาท", groupEn: "Workspace", groupTh: "พื้นที่จัดการ", audience: "admin", descriptionEn: "Role policies are reserved for administrators. This screen is only a future-ready outline, not a permission editor.", descriptionTh: "นโยบายสิทธิ์สงวนไว้สำหรับผู้ดูแล หน้านี้เป็นเพียงโครงสำหรับอนาคต ไม่ใช่เครื่องมือแก้สิทธิ์จริง", supportsEn: ["Role policy overview", "Workspace membership", "Server-enforced access rules"], supportsTh: ["ภาพรวมนโยบายบทบาท", "สมาชิกพื้นที่จัดการ", "กฎสิทธิ์ที่ server ตรวจจริง"], noteEn: "A browser UI alone never grants a role.", noteTh: "UI ในเบราว์เซอร์ไม่สามารถมอบสิทธิ์ได้ด้วยตัวเอง" },
    { id: "analytics", en: "Analytics & visits", th: "สถิติและผู้เข้าชม", groupEn: "Workspace", groupTh: "พื้นที่จัดการ", audience: "admin", descriptionEn: "Analytics will appear only when privacy-reviewed measurements are connected. This prototype intentionally shows no invented counts.", descriptionTh: "สถิติจะปรากฏเมื่อเชื่อมข้อมูลที่ผ่านการทบทวนความเป็นส่วนตัวแล้ว ต้นแบบนี้จงใจไม่สร้างตัวเลขขึ้นมาเอง", supportsEn: ["Privacy-aware visits", "Campaign activity aggregates", "Operational health signals"], supportsTh: ["ผู้เข้าชมที่คำนึงถึงความเป็นส่วนตัว", "ภาพรวมกิจกรรมแคมเปญ", "สัญญาณสุขภาพระบบ"], noteEn: "No visitor data is shown in this prototype.", noteTh: "ต้นแบบนี้ไม่แสดงข้อมูลผู้เข้าชม" },
    { id: "admin", en: "Admin Console", th: "คอนโซลผู้ดูแล", groupEn: "Workspace", groupTh: "พื้นที่จัดการ", audience: "admin", descriptionEn: "A private operations surface will gather health, audit, and content controls after secure server authorization is connected.", descriptionTh: "พื้นที่ปฏิบัติการส่วนตัวจะรวมสถานะระบบ การตรวจสอบ และการควบคุมเนื้อหาเมื่อเชื่อมสิทธิ์ฝั่ง server อย่างปลอดภัย", supportsEn: ["Operational overview", "Audit review", "Content controls"], supportsTh: ["ภาพรวมการปฏิบัติการ", "การตรวจสอบบันทึก", "การควบคุมเนื้อหา"], noteEn: "No secret, credential, or player record is exposed here.", noteTh: "หน้านี้ไม่เปิดเผย secret, credential หรือบันทึกผู้เล่น" },
  ] },
  { id: "resources", en: "Resources", th: "ทรัพยากร", items: [
    { id: "guides", en: "Guides & support", th: "คู่มือและความช่วยเหลือ", groupEn: "Resources", groupTh: "ทรัพยากร", audience: "player", descriptionEn: "Guidance will collect practical help for beginning a campaign, keeping records, and finding support when service channels are ready.", descriptionTh: "คู่มือจะรวมความช่วยเหลือสำหรับเริ่มแคมเปญ เก็บบันทึก และขอความช่วยเหลือเมื่อช่องทางบริการพร้อม", supportsEn: ["Getting-started guidance", "Record-keeping help", "Support channels"], supportsTh: ["คู่มือเริ่มต้น", "ความช่วยเหลือเรื่องบันทึก", "ช่องทางความช่วยเหลือ"] },
    { id: "privacy", en: "Privacy & terms", th: "ความเป็นส่วนตัวและข้อกำหนด", groupEn: "Resources", groupTh: "ทรัพยากร", audience: "player", descriptionEn: "This page will explain data boundaries in plain language when account services are introduced.", descriptionTh: "หน้านี้จะอธิบายขอบเขตข้อมูลด้วยภาษาที่เข้าใจง่ายเมื่อเปิดใช้บริการบัญชี", supportsEn: ["Data-boundary explanation", "Retention information", "Terms and policy links"], supportsTh: ["คำอธิบายขอบเขตข้อมูล", "ข้อมูลการเก็บรักษา", "ลิงก์ข้อกำหนดและนโยบาย"], noteEn: "Campaign records currently remain in this browser unless a future service says otherwise.", noteTh: "ปัจจุบันบันทึกแคมเปญอยู่ในเบราว์เซอร์นี้ เว้นแต่บริการในอนาคตระบุเป็นอย่างอื่น" },
  ] },
];

export function managementMenuFor(isAdmin: boolean): ManagementMenuSection[] {
  return sections
    .map((section) => ({ ...section, items: section.items.filter((item) => item.audience === "player" || isAdmin) }))
    .filter((section) => section.items.length > 0);
}

export function managementItemFor(id: ManagementItemId | null, isAdmin: boolean): ManagementMenuItem | undefined {
  if (!id) return undefined;
  return managementMenuFor(isAdmin).flatMap((section) => section.items).find((item) => item.id === id);
}

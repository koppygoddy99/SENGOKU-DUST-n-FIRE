# Backend Cost Estimate: Dust & Fire

**สถานะ:** สมมติฐานเพื่อวางแผน ไม่ใช่ใบเสนอราคา  
**วันที่อ้างอิง:** 25 สิงหาคม 2026 (GMT+7)

## ต้นทุน AI ต่อหนึ่งตา

โมเดลประมาณการใช้ราคามาตรฐาน GPT-5 mini: input US$0.25 และ output US$2.00 ต่อ 1 ล้าน tokens [1] [2]

| ตัวแปร | สมมติฐาน |
|---|---:|
| AI calls ต่อหนึ่ง AI-assisted turn | 2 calls |
| Input รวมต่อหนึ่งตา | 6,500 tokens |
| Output รวมต่อหนึ่งตา | 1,600 tokens |
| อัตราแปลงเพื่อทำงบ | 33.00 THB / USD |
| usage reserve | 50% |

สูตรฐานคือ `(6,500 × 0.25 / 1,000,000 + 1,600 × 2.00 / 1,000,000) × 33 = 0.159225 บาท/ตา` และใช้ **0.24 บาท/ตา** หลังบวก reserve 50%.

## ค่าเดินระบบรายเดือน

| ระดับ | ผู้เล่น × ตา/เดือน | AI พร้อม reserve | Fixed operations allowance | รวมต่อเดือน |
|---|---:|---:|---:|---:|
| MVP | 100 × 30 | 717 บาท | 2,000–6,000 บาท | 2,700–6,700 บาท |
| Active community | 500 × 60 | 7,165 บาท | 6,000–15,000 บาท | 13,000–22,000 บาท |
| Growing service | 2,000 × 80 | 38,214 บาท | 20,000–50,000 บาท | 58,000–88,000 บาท |

Fixed operations เป็นงบประมาณสำหรับ hosting, database/storage, monitoring, backup, domain/email และ network ใช้งานประกอบ; ไม่ใช่ราคา provider รายใด และไม่รวมค่าบริการของแพลตฟอร์มที่กำลังโฮสต์โครงการนี้.

## ค่าแรงพัฒนาเพื่อวาง scope

| ขอบเขต | วิธีประมาณ | รวม contingency 15% |
|---|---|---:|
| ต่อจาก codebase ปัจจุบันจนพร้อมเปิดใช้ | 55–75 person-days × 3,500 บาท/วัน | 221,375–301,875 บาท |
| ทำผลิตภัณฑ์เทียบเท่าจากศูนย์ | frontend/game, backend/AI, historical research, QA/release | 828,000–1,184,500 บาท |

ตัวเลขเป็นแบบจำลอง person-day ไม่ใช่ benchmark ค่าแรงตลาดหรือการเสนอรับงาน. ค่าใช้จริงจะเพิ่มตาม native app, cloud sync, payment, SLA, 24/7 support, legal review, สิทธิ์ asset และการตรวจประวัติศาสตร์โดยผู้เชี่ยวชาญ.

## References

[1]: https://developers.openai.com/api/docs/models/gpt-5-mini "OpenAI: GPT-5 Mini model and pricing"
[2]: https://developers.openai.com/api/docs/pricing "OpenAI API pricing"

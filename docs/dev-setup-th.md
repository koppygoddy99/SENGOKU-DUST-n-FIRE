# เริ่มพัฒนาในเครื่องและการทดสอบ

## ข้อกำหนดเบื้องต้น

- Node.js 22 หรือใหม่กว่า
- pnpm 10
- ตัวแปรระบบ Manus สำหรับ OAuth, database และ built-in services เมื่อต้องทดสอบ auth/AI GM จริง

```bash
pnpm install
pnpm dev
```

Development server เริ่มจาก `server/_core/index.ts` และให้ Vite ส่งหน้า React ผ่าน Express. ห้าม commit ไฟล์ `.env` หรือ token ใด ๆ ลง repository.

## คำสั่งสำคัญ

| คำสั่ง | หน้าที่ |
|---|---|
| `pnpm check` | ตรวจ TypeScript |
| `pnpm test` | รัน Vitest ทั้งชุด |
| `pnpm test:play-dice-flow` | ตรวจ browser flow ลูกเต๋าหมุน → สูตรผล → Narrative Outcome |
| `pnpm test:mobile-keyboard` | ตรวจ keyboard flow บนมือถือ |
| `pnpm test:campaign-layout` | ตรวจ Campaign Command ไม่เกิด horizontal overflow |
| `pnpm test:market-mobile-layout` | ตรวจ Market Hub บน 375px |
| `pnpm db:push` | generate และ apply Drizzle migrations เมื่อมี schema change |

ก่อนแก้ schema ให้ตรวจ `drizzle/schema.ts`, สร้าง migration, อ่าน SQL ที่สร้าง และ apply ผ่าน workflow ที่เหมาะสม หลีกเลี่ยงการทำลายข้อมูลโดยไม่จำเป็น

## การทดสอบและเกณฑ์ส่งมอบ

งานที่เปลี่ยนกติกา UI หรือ flow ต้องเพิ่ม regression ที่ใกล้กับพฤติกรรมจริงที่สุด และตรวจอย่างน้อย:

```bash
pnpm check
pnpm test
pnpm test:play-dice-flow
pnpm test:mobile-keyboard
pnpm test:campaign-layout
pnpm test:market-mobile-layout
```

ผลที่เกี่ยวกับ layout หรือจังหวะ Play ต้องมี visual review เพิ่มเติมบน desktop และ mobile. Screenshot ไม่ทดแทน unit/browser tests แต่ช่วยยืนยันสิ่งที่ผู้เล่นเห็นจริง

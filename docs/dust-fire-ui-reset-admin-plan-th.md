# Dust & Fire: Sengoku Stories
## แผนรีเซ็ต UI/Tabletop และ Admin Console

**สถานะ:** แผนดำเนินงานฉบับควบคุมการพัฒนา  
**ภาษาเอกสาร:** ไทย  
**ขอบเขต:** ผู้เล่นหนึ่งคน, หนึ่งตัวละคร, หนึ่งแคมเปญที่เล่นอยู่, Local Save เป็นหลัก และ AI GM เป็นผู้ช่วยบรรยาย ไม่ใช่ผู้ตัดสินกติกา  
**ผู้จัดทำ:** Manus AI  

---

## บทสรุปสำหรับเจ้าของเกม

งานรีเซ็ตครั้งนี้จะ **ไม่แก้ด้วยการเติมกล่อง เติมไอคอน หรือเพิ่มแถบสี** เพราะปัญหาหลักของหน้าจอเดิมไม่ใช่ “ข้อมูลน้อย” แต่คือข้อมูลสำคัญและข้อมูลบันทึกถูกวางให้มีน้ำหนักเท่ากัน จึงทำให้เกมที่ควรเหมือนโต๊ะเล่นนิยายกลับดูเป็นเว็บจัดการข้อมูลทั่วไป

ทิศทางใหม่คือให้ Dust & Fire เป็น **Sengoku archival tabletop** อย่างมีวินัย ผู้เล่นต้องเห็นเพียงสิ่งที่ช่วยให้ตัดสินใจในขณะนั้น อ่านผลที่เพิ่งเกิดขึ้น หรือกลับเข้าเรื่องต่อได้ ส่วนข้อมูลประวัติ รายละเอียดกติกา และบันทึกจะถูกย้ายเป็นชั้นรองที่เปิดดูได้เมื่อจำเป็น

> ผู้เล่นประกาศเจตนาด้วยหนึ่งประโยค กติกาประเมินความเสี่ยง ลูกเต๋าตัดสินผล และโลกจดจำต้นทุนของการตัดสินใจนั้น

การเรียกใช้แนวคิด `/game-dev` ในรอบนี้หมายถึงการใช้ **วินัยการผลิตเกม** ได้แก่ visual target, risk slice, asset plan, separation of concerns และ screenshot-based verification ไม่ใช่การเปลี่ยนเกม tabletop นี้ให้กลายเป็นเกม 3D หรือ action game ด้วย Babylon.js เพราะแกนที่ทำงานจริงอยู่แล้วคือ React, 2d12 engine, Local Save และ narrative flow ซึ่งเหมาะกับเกมอ่าน-คิด-ทอยมากกว่า

| สิ่งที่คงไว้ | สิ่งที่จะรีเซ็ต | สิ่งที่ยังไม่ทำในรอบนี้ |
|---|---|---|
| กติกา 2d12, `resolveRoll()`, `applyRoll()`, Momentum, Local Save, AI fallback, Campaign Library | โครงนำทาง, ลำดับข้อมูล, copy, visual tokens, surface, page layout, review route, review capture | Multiplayer, party, chat, shared campaign, cloud sync จริง, Drive backup จริง, ระบบจัดการผู้ใช้เชิงลึกที่ยังไม่มีข้อมูลรองรับ |

---

## 1. เอกสารต้นทางและข้อกำหนดที่มีผลบังคับ

แผนนี้ใช้เอกสารของผู้ใช้สองฉบับเป็นข้อกำหนดหลัก ได้แก่ **Dust & Fire: Sengoku Tabletop UI Reset** และ **Dust & Fire: Per-Page Design Placement Blueprint** โดยเอกสารแรกระบุสิ่งที่ต้องหยุดทำและลำดับการแก้ ส่วนเอกสารหลังล็อก grid, ลำดับการมองเห็น, ตำแหน่งงานอาร์ต, CTA และข้อห้ามของแต่ละหน้า

แนวคิดเก่าที่ต้องเลิกคือการใช้ card สีขาวแบบเดียวเต็มหน้า, เส้น navy หนาหนักซ้ำทุกกล่อง, progress bar ใน navigation, ปุ่ม generic เช่น `Continue` หรือ `Load`, และป้าย dev-state ที่เด่นกว่าบริบทของเรื่อง ผู้เล่นไม่ควรถูกบอกว่าอยู่ใน “UI Preview” เมื่อกำลังควรอ่านแรงกดดันของฉากอยู่

### 1.1 ผลตรวจ baseline ปัจจุบัน

| หัวข้อ | สถานะที่ตรวจได้ | ผลต่อแผน |
|---|---|---|
| กติกาและ Local Save | ผ่าน regression 51 รายการ และ TypeScript ผ่าน ณ จุดเริ่มต้นการรีเซ็ต | ต้องรักษา state authority เดิม และห้ามย้ายการคำนวณลูกเต๋าเข้า UI |
| โครงโมดูล | Story Map, Play Scene และ Chronicle ถูกแยกเป็น feature แล้ว แต่ `Home.tsx` ยังเป็น shell ที่ใหญ่ | เริ่มจากแยก shell/navigation/route manifest ก่อนเกลารายหน้า |
| ชุดภาพ review | ชื่อไฟล์, URL และหน้าที่ถูกจับไม่ตรงกันหลายจุด | ต้องหยุดส่งภาพ review ใหม่จนมี manifest และ state seed ที่กำหนดตายตัว |
| Player UI | ยังใช้ sidebar ที่แสดงข้อมูลย่อยและ nested menu มากเกินไป | เปลี่ยนเป็น navigation ระดับ Story / Prepare / Chronicle / More พร้อมเปิดเฉพาะกลุ่มที่เกี่ยวข้อง |
| Admin | มี role `admin` ใน user schema และมี dashboard shell ใน template แต่ยังไม่มี route หรือหน้า Admin จริง | สร้าง Admin Console แยกจาก player UI พร้อม client gate และ server-side guard ก่อนมี action สำคัญ |

---

## 2. หลักการออกแบบใหม่ที่ห้ามละเมิด

### 2.1 One-question rule

ทุกหน้าต้องตอบคำถามสำคัญเพียงหนึ่งข้อใน viewport แรก หน้าที่ทำให้ผู้เล่นตอบคำถามนี้ไม่ได้ถือว่ายังออกแบบไม่เสร็จ แม้จะมีข้อมูลครบแล้วก็ตาม

| พื้นที่ | คำถามหลัก | CTA หลักตัวอย่าง |
|---|---|---|
| Campaign Command | ตอนนี้โลกกำลังกดดันอะไร และควรกลับไปทำอะไรต่อ | `กลับสู่ด่านซาไก` |
| Play Scene | ฉันจะทำอะไร และสิ่งนั้นเสี่ยงอย่างไร | `ดูความเสี่ยง` หรือ `ทอย 2d12` ตาม state |
| Missions | งานใดสำคัญที่สุดก่อนเส้นตาย | `กลับไปทำภารกิจนี้` |
| Market | ตอนนี้จะซื้อ จ้าง หรือขอข่าวอะไร และต้องแลกอะไร | `รับยาโดยให้กันทาโร่ค้ำ` |
| Gear | ของชิ้นใดช่วยฉากต่อไป | `นำไปใช้ในฉาก` เมื่อมี rule loop จริง |
| Chronicle | สิ่งที่ทำไปเปลี่ยนเรื่องอย่างไร | `อ่าน Leaf นี้` |
| Save / Load | ใบใดปลอดภัย และจะย้อนกลับไปตรงไหน | `บันทึก Leaf ปัจจุบัน` หรือ `กลับไปยัง Leaf นี้` |

### 2.2 ชั้นข้อมูลสามระดับ

| ชั้น | หน้าที่ | จำนวนที่ควรเห็นทันที |
|---|---|---|
| **Primary** | การตัดสินใจหนึ่งอย่างหรือ CTA หลัก | 1 จุดต่อ viewport |
| **Context** | ข้อมูลที่ทำให้ตัดสินใจได้ดีขึ้น | 3–5 จุด |
| **Record** | ประวัติ รายละเอียดกติกา ข้อมูลเก่า | ซ่อนไว้ใน drawer, accordion, tab หรือหน้ารอง |

Primary ห้ามแข่งขันกับ Record โดยเฉพาะ Play, Chronicle, Market และ Save หากผู้เล่นต้องอ่าน 5–10 กล่องก่อนรู้ว่าควรกดอะไร แสดงว่าหน้านั้นละเมิดหลักนี้

### 2.3 กติกาภาพและวัสดุ

พื้นฐานของทุกหน้าคือกระดาษงาช้าง, หมึก navy, เส้น mist อ่อน และ accent หลักเพียงหนึ่งสีที่สัมพันธ์กับงานนั้น สีแดงครั่งใช้กับการกระทำที่เปลี่ยนเรื่องหรือภัยใกล้ตัว สี ochre ใช้กับราคา หนี้ และกำหนดชำระ สี moss/teal ใช้กับสถานะปลอดภัยหรือยืนยันสำเร็จ

งานอาร์ตต้องเป็นคนละสิ่งกับ UI: art จะบอกสถานที่ ฤดู แรงกดดัน หรือพิธีกรรมการทอย ขณะที่ UI ต้องบอกข้อมูลและทางเลือกอย่างชัดเจน จึงอนุญาต hero art เพียงหนึ่งจุดต่อหน้า และห้ามสร้างภาพคน, portrait, crest ตระกูลจริง หรือข้อความสำคัญที่ฝังอยู่ในภาพ

---

## 3. Global Player Shell ที่จะใช้ใหม่

### 3.1 Desktop frame

หน้าผู้เล่นจะยึด artboard review 1440 × 960px ใช้ top bar สูง 72px, navigation rail กว้าง 72px เมื่อพับ และ 224px เมื่อขยาย เนื้อหาอยู่ใน frame กว้างประมาณ 1120px พร้อม gutter 24px และ section gap 32px

| Zone | เนื้อหา | กฎการใช้งาน |
|---|---|---|
| Brand + Seal | Dust & Fire, ตราครั่งดั้งเดิมของเกม | ไม่มี icon อื่นแย่งความเด่น |
| Campaign Context | ปี · ฤดู · สถานที่ | คลิกกลับ Campaign Command ได้ |
| Utilities | สถานะการบันทึก, ภาษา, Settings | ไม่แสดงเครดิตหรือป้าย preview ใน player shell |
| Rail | Story, Prepare, Chronicle, More | แสดงเฉพาะกลุ่ม active และไม่เปิด submenu ทุกกลุ่มพร้อมกัน |

### 3.2 Player navigation ใหม่

| กลุ่ม | รายการ | ความหมาย |
|---|---|---|
| **Story** | Campaign Command, Play Scene, Missions | “โลกกำลังกดดันอะไร และจะทำอะไรต่อ” |
| **Prepare** | Character, Gear, Market, Services, Debts & Favors | “ฉันมีอะไร ติดต่อใคร และแลกอะไรได้” |
| **Chronicle** | Campaign Library, Chronicle, World Archive | “เรื่องที่ผ่านมาเปลี่ยนโลกอย่างไร และรู้อะไรแล้ว” |
| **More** | Save, Load, Settings, Help | “เก็บรักษาและปรับห้องอ่าน” |

เมนู Admin ไม่อยู่ใน rail ของผู้เล่น และไม่ควรมีอยู่ใน mobile bottom navigation ผู้ดูแลที่มีสิทธิ์จะเห็นลิงก์เล็กในส่วน utilities หรือ account menu เท่านั้น เพื่อไม่ทำให้เกมกลายเป็น dashboard

### 3.3 Mobile frame

มือถือใช้ bottom navigation 4 จุดตามกลุ่มข้างต้น ไม่มี rail ถาวร, ไม่มี table ที่เกินสองคอลัมน์, ทุก tap target อย่างน้อย 44px และ Play Scene มี sticky action dock ที่ไม่หลุดใต้ fold แม้เปิดตัวอักษรใหญ่

---

## 4. Route-to-Screen Manifest: ประตูก่อนเริ่มงานภาพรอบใหม่

ก่อนแก้สี ระยะ หรือ asset จะสร้าง manifest ที่บังคับให้ 1 route = 1 page id = 1 heading = 1 seed state = 1 screenshot filename หน้าจอ review จะตั้ง state จาก query โดยไม่พึ่ง localStorage หรือ state ที่เหลือจาก route ก่อนหน้า

| Screenshot | Review route | Page title ที่ต้องเห็น | Seed state | เป้าหมายการตรวจ |
|---|---|---|---|---|
| `01-campaign-library.png` | `?review=campaigns` | Campaign Library | Saika library | Resume card และ New Story CTA |
| `02-new-campaign.png` | `?review=start` | New Campaign | Step 1 / fixed draft | Step rail กับ preview paper |
| `03-campaign-command.png` | `?review=home` | Campaign Command | Saika active mission | map, pressure, return-to-scene CTA |
| `04-play-scene.png` | `?review=play` | Play Scene | Pre-roll scene | prose surface และ action dock |
| `05-missions.png` | `?review=missions` | Missions | active + at-risk | mission priority และ consequence |
| `06-gear.png` | `?review=gear` | Carried Gear | Saika inventory | gear relevance ไม่ใช่ grid สถิติ |
| `07-market.png` | `?review=market` | This Market | Sakai offers | offer ที่ใช้ได้จริงหรือชัดว่า reference |
| `08-services.png` | `?review=services` | Services & Hands | service records | provider strip และ witness risk |
| `09-debts-favors.png` | `?review=obligations` | Debts & Favors | open obligations | thread map และ action ที่ซื่อสัตย์ |
| `10-exchange-history.png` | `?review=exchanges` | Exchange History | transaction history | timeline ไม่ใช่ card grid |
| `11-character.png` | `?review=character` | Character Dossier | Sanefuyu | relevant strengths / current condition |
| `12-chronicle.png` | `?review=log&reader=library` | Chronicle | selected leaf | leaf shelf กับ novel preview |
| `13-world-archive.png` | `?review=archive` | World Archive | discovered knowledge | map, fog และ knowledge cards |
| `14-save-game.png` | `?review=save` | Campaign Safekeeping | populated + empty slots | state ของ save ถูกต้อง |
| `15-load-game.png` | `?review=load` | Return to a Recorded Leaf | auto + manual slots | restore confirmation entry |
| `16-settings.png` | `?review=settings` | Arrange Your Reading Room | accessible defaults | section grouping และ danger zone ใต้ fold |

ทุก capture ต้องผ่าน route, title, content และ file-name check ก่อนเขียน ZIP ใหม่ ระบบจะเพิ่ม automated test เพื่อป้องกันความผิดพลาดซ้ำ และภาพ review ต้องทำหลัง route seed ถูกล็อกแล้วเท่านั้น

---

## 5. แผนหน้าผู้เล่นตามลำดับที่ต้องสร้าง

### 5.1 Campaign Command / Story Map — ลำดับแรก

Campaign Command คือหน้าที่ต้องทำให้ผู้เล่นรู้สึกว่าอยู่ในเกม tabletop ตั้งแต่แรกเห็น ไม่ใช่หน้าสรุป metrics แผนที่จะเป็น parchment base ที่มี marker, route, fog และ pressure layer ซึ่ง derive จาก `GameState` เท่านั้น แผนที่ไม่อ้างว่าเป็นแผนที่ประวัติศาสตร์ครบถ้วน และไม่มี label ฝังใน artwork

ใน viewport แรกต้องมี map เป็น hero เดียว, แรงกดดันของ mission 1 ประโยค, last consequence สั้น และ CTA เดียวที่ใช้ชื่อสถานที่จริงในแคมเปญ เช่น `กลับสู่ด่านซาไก` ข้อมูลบาดแผล ค่าสติ และแรงฮึดจะย้ายเป็น Current Condition strip ขนาดเล็ก แทนการติดอยู่ทุกหน้าบน rail

### 5.2 Play Scene — ลำดับที่สอง

Play เป็นผืนกระดาษอ่านหลักเพียงหนึ่งผืน ข้อความฉากใช้ serif ที่อ่านไทยได้จริง, line-height สูง และไม่มี scroll ซ้อนในกล่องเล็ก Action Dock จะติดด้านล่างเฉพาะหน้า Play มี state ที่แน่นอนดังนี้: ready, risk-preview, rolling, momentum-offer, resolved, saved และ safe error fallback

| State | สิ่งที่ผู้เล่นเห็น | CTA หลัก |
|---|---|---|
| Ready | ฉาก, tension, ช่องประกาศเจตนา | `ดูความเสี่ยง` |
| Risk preview | ความเสี่ยงเป็นภาษาคน, สิ่งที่จะนับเป็นบริบท, detail drawer | `ยืนยันการกระทำ` |
| Roll | dice tray ไม้/ผ้า navy และค่าลูกเต๋าที่ accessible | `ทอย 2d12` |
| Momentum offer | ผลเบื้องต้น + ต้นทุนแรงฮึด | `ใช้แรงฮึด` หรือ `รับผลนี้` |
| Resolved | ผลกติกา, ผลเรื่อง, สิ่งที่โลกจำ | `เล่นฉากต่อ` |
| Fallback | AI ไม่พร้อม แต่ Local Trial บันทึกได้จริง | `ทอยในเครื่อง` |

AI GM ไม่เปลี่ยน total, DN, margin, credit หรือ resource ที่ deterministic engine ควบคุมอยู่แล้ว ป้าย technical fallback จะไม่แข่งขันกับชื่อฉาก และจะปรากฏแบบ context-specific เมื่อต้องมีผลต่อการกระทำเท่านั้น

### 5.3 Missions และ Chronicle — ลำดับที่สาม

Missions แสดงงาน active หนึ่งงานอย่างเด่น พร้อมเส้นตายและสิ่งที่จะเกิดหากปล่อยไว้ งานอื่นเป็น record layer ที่พับได้ Chronicle ใช้ leaf shelf 3–5 ใบและ selected leaf เพียงหนึ่งใบใน viewport แรก Reader Mode ลด mechanics เหลือการเปิด drawer “แสดงรายละเอียดการทอย” และขยายความกว้าง prose เป็น 760–820px

### 5.4 Prepare systems — ลำดับที่สี่

Character, Gear, Market, Services, Debts & Favors และ Exchange History จะไม่ใช้ card grid หน้าตาเดียวกันอีกต่อไป โดยยึดรูปแบบตามหน้าที่ดังนี้

| หน้า | รูปแบบหลัก | สิ่งที่ห้ามแสร้งทำ |
|---|---|---|
| Character | dossier hero + tabs + “How this matters now” | score bar หรือ parser note ในพื้นที่หลัก |
| Gear | gear ledger แบบแถวที่บอก relevance ของฉาก | ปุ่ม equip/use หากไม่มี loop จริง |
| Market | offer ที่มี price / condition / availability ต่างกัน | `TAKE OFFER` ซ้ำทุกแถว |
| Services | provider strip 3 แถวต่อ viewport | ปุ่มจ้างทันทีเมื่อ engine ยังไม่รองรับ |
| Debts & Favors | thread/knot map + social-knot rows | network graph แบบ enterprise หรือ bond points ปลอม |
| Exchange History | vertical timeline | card จำนวนมากที่บอกสิ่งเดียวกัน |

### 5.5 World Archive, Save, Load และ Settings — ลำดับสุดท้ายของ player UI

World Archive แสดงสิ่งที่ตัวละครรู้ ไม่ใช่สารานุกรมที่ผู้เล่นรู้ทั้งหมด Save และ Load ใช้คำว่า **Campaign Safekeeping** เพื่อไม่ปิดทาง Google Drive backup ในอนาคต แต่ UI จะไม่บอกว่ามี sync จริงจนกว่าจะมีระบบรองรับ Save slot ต้องเห็นแตกต่างชัดเจนระหว่าง auto, manual, empty, cloud-backed และ sync-error

Settings คือ “ห้องอ่าน” แบ่ง Reading Room, Story Engine, Safekeeping, Accessibility และ Danger Zone การ reset ต้องอยู่ใต้ fold พร้อม confirmation และทางเลือก export ก่อนเสมอ

---

## 6. Asset Plan: ผลิต art ให้ทำหน้าที่ ไม่ใช่แปะตกแต่ง

การผลิต asset จะตาม pipeline เกม: visual target → asset list → upload เป็น managed web assets → wire เข้า component → screenshot verify งานอาร์ตต้องเป็นของดั้งเดิม ไม่มีตัวละคร/คน ไม่มี crest ตระกูลจริง และไม่มีข้อความผู้ใช้ที่ฝังในภาพ

| Asset | รูปแบบ | หน้าที่ | หน้าใช้ |
|---|---|---|---|
| Paper fiber | seamless transparent WebP/PNG | ให้วัสดุกระดาษโดยไม่รบกวนตัวอักษร | global canvas |
| Seasonal ink wash 6 ชุด | transparent PNG/WebP | บอกฤดูและแรงกดดัน | command, play, chronicle |
| Location vignette 8 ชุด | transparent PNG/WebP | บอกที่โดยไม่มีคน | library, play, map |
| Map base | static base + semantic HTML marker layer | บอก route/fog/current place จาก state | command, archive |
| Semantic seals 12 ชุด | SVG | witness, debt, oath, injury, mission, safe, unknown | ledger และ record views |
| Starting-path objects | SVG/PNG | ทำให้ starter path มี material identity | new campaign |
| Dice tray | CSS + art texture + HTML values | ทำให้ roll เป็น ritual ที่อ่านได้ | play, command |
| Chapter leaves | SVG/PNG | ทำให้ Chronicle เป็นห้องสมุดนิยาย | chronicle, campaign library |

---

## 7. Admin Console: แยกพื้นที่ผู้ดูแลออกจากโลกของผู้เล่น

### 7.1 วัตถุประสงค์และขอบเขต

Admin Console เป็นเครื่องมือดูแลแอป ไม่ใช่เมนูในเกม จึงใช้ dashboard shell ที่แยก route, design token และ navigation ออกจาก player shell ผู้เล่นทั่วไปจะไม่เห็นลิงก์นี้ และการพิมพ์ URL ตรงต้องถูกปฏิเสธที่ server-side ไม่ใช่ซ่อนปุ่มอย่างเดียว

ในรอบแรก Admin Console จะทำหน้าที่เป็น **operational visibility และ content safety** ก่อน ไม่เป็นระบบแก้ไขข้อมูลผู้เล่นข้ามสิทธิ์ และไม่แสดงข้อมูลเกินกว่าที่ schema/Local Save/ระบบที่มีอยู่รองรับจริง

### 7.2 Route และสิทธิ์

| Route | สิทธิ์ | หน้าที่ |
|---|---|---|
| `/admin` | `admin` | Overview และ operational health |
| `/admin/campaigns` | `admin` | แสดงเฉพาะ campaign metadata ที่ระบบ persist จริงในอนาคต |
| `/admin/content` | `admin` | ตรวจ historical boundary, content packs, writing/safety checklist |
| `/admin/operations` | `admin` | AI status, fallback rate, save/schema health, feature flags ที่รองรับจริง |
| `/admin/audit` | `admin` | immutable audit events ของ action ผู้ดูแล |
| `/admin/settings` | `admin` | การตั้งค่าระดับแอปที่มี backend contract รองรับ |

การป้องกันใช้สามชั้น: route guard ฝั่ง client เพื่อประสบการณ์ใช้งาน, `adminProcedure` ฝั่ง tRPC เพื่อป้องกัน API, และ audit record สำหรับ action ที่เปลี่ยนการตั้งค่าหรือ content ผู้ใช้ `role = user` ต้องได้รับหน้าจอ access denied ที่ไม่เผยข้อมูลผู้ดูแล

### 7.3 Information architecture ของ Admin Console

| Section | คำถามที่ต้องตอบ | ข้อมูล/การกระทำที่อนุญาตรอบแรก |
|---|---|---|
| Overview | แอปพร้อมให้เล่นหรือมีส่วนใดเสี่ยง | health summaries, test/build status ที่อ่านได้, active feature inventory |
| Campaign Oversight | campaign data ปลอดภัยและ schema สอดคล้องหรือไม่ | schema version, migration/normalization status, aggregate counts เมื่อมี database จริง |
| Content & History | เนื้อหาใดต้องตรวจ historical boundary หรือ safety | fact/context/fiction status, unsupported claims queue, content source status |
| AI Operations | AI GM ใช้ได้หรือ fallback ทำงานหรือไม่ | provider availability, timeout/fallback totals, no raw secret display |
| Safekeeping | Local/Drive backup feature พร้อมระดับใด | save contract, export/import status, backup integration readiness |
| Audit Log | ใครเปลี่ยนสิ่งใด เมื่อใด | append-only action metadata ไม่มี secrets หรือ narrative ส่วนตัวเกินจำเป็น |
| App Settings | เปิด/ปิดเฉพาะ feature ที่ implementation รองรับ | feature flags, locale defaults, service notices; destructive actions ต้อง confirm |

### 7.4 สิ่งที่ Admin Console ต้องไม่ทำ

Admin Console จะไม่ทำสิ่งต่อไปนี้จนกว่าจะมี schema, policy และ server contract ที่พิสูจน์ได้: แก้ Local Save ของผู้เล่นจากระยะไกล, อ่าน narrative ส่วนตัวของผู้เล่นโดยไม่มี policy, เปลี่ยนผลทอย, เติม/หักเครดิตด้วยมือ, เปิดดู secrets, ปลอมว่า Drive backup หรือ AI health ทำงานทั้งที่ไม่มี service, หรือแสดง analytics ที่ไม่มีข้อมูลจริง

---

## 8. Data Ownership และขอบเขตความปลอดภัย

| เจ้าของข้อมูล | ความรับผิดชอบ | สิ่งที่ UI ห้ามทำ |
|---|---|---|
| `client/src/lib/game.ts` | กติกา, GameState, transition ที่ deterministic | คำนวณผลทอยซ้ำใน component |
| Player shell | route, Local Save restoration, language และ cross-feature navigation | เขียน outcome/transaction เองโดยข้าม engine |
| Feature component | render derived view และขอ transition ผ่าน callback | อ้างว่ามี action loop ทั้งที่ไม่มี |
| Server tRPC | user identity, role, admin-only data/action | รับรองผลกติกาที่ควรเป็น deterministic client engine |
| Admin Console | operational visibility และ action ที่ผ่าน policy | เปิดเผย secret, ข้อมูลผู้เล่นเกินสิทธิ์ หรือเปลี่ยน roll result |

---

## 9. ลำดับการดำเนินงานและ risk slices

### Slice A — Repair the review foundation

เริ่มด้วย page registry/route manifest, fixed seed states, page titles และ test ที่ยืนยันชื่อไฟล์ภาพตรงกับ content จากนั้นลบ dev-state labels ออกจาก player UI และวาง global token / typography / button / drawer pattern ใหม่ งานนี้ต้องเสร็จก่อน capture รอบถัดไป

### Slice B — Rebuild the player loop

ทำ Campaign Command ก่อน แล้วตามด้วย Play Scene, dice/Momentum/outcome, Missions และ Chronicle เป้าหมายคือผู้เล่นเปิดเกมแล้วรู้ว่าควรกลับไปไหน พิมพ์อะไร ผลลัพธ์คืออะไร และโลกจำอะไร โดยไม่ต้องค้นหาเมนู

### Slice C — Rebuild preparation and records

ทำ Character, Gear, Market, Services, Debts, Exchange History, Archive, Save/Load และ Settings ตาม one-question rule ทุก action ที่ไม่มี loop จริงต้องเปลี่ยนเป็น `ดูเงื่อนไข` หรือ `นำไปเจรจาในฉาก`

### Slice D — Add administration safely

เพิ่ม top-level routing, Admin Console shell, role-based menu visibility และ `adminProcedure` จากนั้นต่อเฉพาะ read-only operational views ที่มี data source จริงก่อน จึงค่อยเพิ่ม audited settings action ทีละรายการหลัง test ครบ

### Slice E — Verify with the picture

ตรวจ desktop 1440px, mobile 390px, tablet 768px, Thai/English, dark room, font size large, reduced motion และ keyboard navigation จากนั้นเล่น flow จริง: New Campaign → Play → risk → roll → Momentum → outcome → mission → market → chronicle → save → load ทุกภาพใหม่ต้องผ่าน manifest gate ก่อนรวม ZIP

---

## 10. เกณฑ์ตรวจรับก่อนส่ง review รอบใหม่

| หมวด | ผ่านเมื่อ |
|---|---|
| Route integrity | URL, page id, heading, seed state, screenshot name และ content ตรงกัน |
| Tabletop identity | มี paper/ink/seal/map/dice/chapter anchor ในหน้าที่ควรมี โดยไม่รก |
| Hierarchy | viewport แรกมี hero หนึ่งจุดและ CTA fill หนึ่งปุ่ม |
| Readability | prose ไทยอ่านได้ยาว, ไม่มี scroll ซ้อน, metadata ไม่ชน text size ใหญ่ |
| Truthfulness | action ที่ยังไม่มี engine loop ถูกติด label ว่า planning/reference ไม่ใช่ปุ่มหลอก |
| Locale | TH และ EN ไม่ปนกันใน interaction เดียว |
| Core rules | UI ไม่ให้ Momentum ก่อน roll และ AI ไม่เปลี่ยนผล deterministic |
| Admin safety | ผู้เล่นทั่วไปไม่เห็น/เข้าถึง admin data และ API admin ปฏิเสธ role ที่ไม่ใช่ admin |
| Accessibility | focus, contrast, reduced motion, keyboard และ dice announcement ทำงาน |

### 10.1 เกณฑ์ตรวจรับรายหน้า

ตารางนี้เป็น acceptance criteria ระดับหน้าจอ การตรวจแต่ละครั้งต้องทดสอบจาก route และ seed state ที่ manifest ระบุ ไม่ใช้ภาพที่ค้างมาจาก route ก่อนหน้า

| หน้า | ผ่านเมื่อ | ไม่ผ่านเมื่อ |
|---|---|---|
| 01 Campaign Library | มี Resume card หนึ่งใบที่บอกชื่อแคมเปญ สถานที่ ผลล่าสุด และ CTA ที่พากลับสู่ฉากได้จริง; แคมเปญอื่นไม่เกินสามใบต่อแถว | เป็นตารางเซฟ, มี CTA generic, หรือไม่มีทางกลับเข้าเรื่องในคลิกเดียว |
| 02 New Campaign | มี step rail 4 ขั้น, ฟอร์มหนึ่งขั้นต่อ viewport และ preview paper ที่สะท้อน year/season/place/path จริง; Winter เลือกได้ | มี dropdown ยาวแทนจุดเริ่มเรื่อง, แสดงฟอร์มยาวทุกขั้นพร้อมกัน, หรือ CTA เริ่มเรื่องก่อน preview ครบ |
| 03 Campaign Command | map เป็น hero เดียว, current place/mission/pressure/last consequence derive จาก `GameState`, และ CTA พากลับ Play ได้ | ใช้ map ว่างหรือ abstract placeholder, แสดง metrics แข่งกับ action, หรือ CTA ไม่เชื่อม scene จริง |
| 04 Play Scene | prose อยู่บน reading surface เดียว, Action Dock sticky, flow risk → roll → Momentum → outcome ทำงานโดยไม่เปลี่ยนหน้า, ไม่มี scroll ซ้อน | ต้องเลื่อนหา CTA, มีกล่อง prose ซ้อน, Momentum ใช้ก่อน roll, หรือ AI เปลี่ยน deterministic result |
| 05 Missions | active/at-risk mission เด่นหนึ่งงานพร้อม deadline และ consequence; งานเก่าเป็น record layer | ภารกิจทุกใบมีน้ำหนักเท่ากัน, ไม่มีแรงกดดัน, หรือปุ่มทำ action ที่ engine ไม่มี |
| 06 Carried Gear | item บอกสถานะ carried/equipped/borrowed/damaged และ relevance ต่อฉาก; control ทำงานเฉพาะ loop ที่มีจริง | ใช้ stat grid ซ้ำ, มีปุ่ม equip/use ปลอม, หรือไม่บอกว่า item ใดช่วยฉากได้ |
| 07 This Market | offer บอกสิ่งที่ได้รับ ราคา เงื่อนไข และ availability; CTA ใช้คำตามผลลัพธ์ | ทุกรายการเป็น row/card เดียวกัน, ใช้ `TAKE OFFER`, หรือซื้อได้ทั้งที่ state ไม่พอ |
| 08 Services & Hands | service strip แสดง provider seal, เงื่อนไข, ราคา, เวลา, witness risk และ `คุยเงื่อนไข`; จำกัดสามรายการใน viewport | ใช้ portrait คน, จ้างทันทีโดยไม่มี rule loop, หรือซ่อน risk ที่มีผลต่อเรื่อง |
| 09 Debts & Favors | มี thread/knot map ที่อ่านง่าย, open obligations มี holder/สิ่งที่ติดค้าง/due/witness/action และ record ถูกพับ | เป็น enterprise node graph, แสดง bond points ปลอม, หรือมี CTA settlement ที่ state ทำไม่ได้ |
| 10 Exchange History | เป็น vertical timeline; entry มี Leaf/time, counterpart, exchange, consequence; รายละเอียดเปิด drawer ได้ | เป็น grid card ซ้ำจำนวนมาก, Leaf เป็น headline แข่งกับเรื่อง, หรือแสดงประวัติที่ไม่มี transaction source |
| 11 Character Dossier | hero มี seal/name/path/current tension; tab หลักมี Traits, Masteries, Gear, Ties, Social Record และ side panel อธิบาย relevance ปัจจุบัน | trait เป็นห้ากล่องเท่ากัน, parser note เด่นกว่าเรื่อง, หรือมี progress bar ที่ไม่สื่อผลต่อการเล่น |
| 12 Chronicle | leaf shelf 3–5 ใบ, selected leaf หนึ่งใบ, preview ไม่ซ้ำ full prose; Reader Mode ซ่อน mechanics โดยยังเปิดดูได้ | full prose ซ้ำสองจุด, card library กลายเป็น dashboard, หรือ Reader Mode ทำให้ย้อนกลับ Chronicle ไม่ได้ |
| 13 World Archive | map/fog แสดง knowledge ที่ตัวละครค้นพบจริง; knowledge cards ไม่เกินสามประเภทเด่น และ fact boundary เปิดดูได้ | เปิดเผยข้อมูลที่ตัวละครไม่รู้, fog เป็นกล่องเทา, หรือใช้ portraits เป็นคนสำคัญ |
| 14 Save Game | แยก auto/manual/empty/backup status ชัด, empty slot ไม่มี Load, reset อยู่ห่างจาก save CTA | save/load ปนกัน, empty slot โหลดได้, หรือ reset อยู่ viewport แรกโดยไม่มี confirmation |
| 15 Load Game | auto และ manual leaf มี location/leaf/last consequence/timestamp; action เปิด confirmation ที่อธิบายผลของ restore | โหลดทันทีโดยไม่เตือน, slot ว่างกดได้, หรือบอกว่า Drive sync จริงเมื่อยังไม่มี backend |
| 16 Settings | กลุ่ม Reading Room, Story Engine, Safekeeping, Accessibility, Danger Zone ชัด; ทุก toggle/segmented control กดได้จริง | ทุก setting เป็น row หน้าตาเดียว, toggle ปลอม, หรือ danger zone อยู่ต้นหน้า |

---

## 11. Deliverables ที่จะส่งในงานรีเซ็ต

1. Route-to-screen manifest และ fixed review seeds
2. Global player shell ใหม่ พร้อม Story / Prepare / Chronicle / More
3. Visual token system, page surface pattern, button / seal / drawer states
4. Player page refactor ตามลำดับ Campaign Command → Play → Missions → Chronicle → Prepare → Utility
5. Original art asset manifest พร้อม managed storage paths หลังสร้าง asset จริง
6. Admin Console แยก route, role guard, operational overview และ audit foundation
7. Regression tests สำหรับ routes, role gates, rule integrity และ review manifest
8. ชุดภาพ review ที่มีชื่อและหน้าตรงกัน พร้อม checklist pass/fail

---

## ภาคผนวก A — การตัดสินใจที่ต้องรักษาไว้

* เกมเป็น single-player และ local-first; ไม่มี lobby หรือ social UI
* ผู้เล่นประกาศการกระทำหนึ่งประโยคก่อนเห็นการคำนวณละเอียด
* ฤดูหนาวต้องเป็นตัวเลือกที่ถูกต้องใน campaign setup และต้องแสดงอย่างสอดคล้องใน UI
* ความจริงทางประวัติศาสตร์, contextual play และ campaign fiction ต้องแยก label ชัดเจน
* AI GM มีไว้เพื่อ narrative assistance; ผลทางกลไกต้องมาจาก engine เดิม
* ภาพและ asset ไม่ใช้คน/portrait เพื่อเว้นพื้นที่ให้จินตนาการของผู้เล่น
* Local Trial ต้องช่วยให้เล่นต่อและบันทึกได้โดยไม่หักเครดิตเมื่อ AI ไม่พร้อม

## ภาคผนวก B — แหล่งต้นทางของแผน

| เอกสาร | บทบาทในแผน |
|---|---|
| `Dust&FireSengokuTabletopUIReset.md` | กฎรีเซ็ต, acceptance gate, visual/interaction constraints, implementation sequence |
| `Dust&FirePer-PageDesignPlacementBlueprint.md` | artboard, layout grid, page placement, CTA lock, asset master map, review checklist |
| `PLAN.md`, `STRUCTURE.md`, `MEMORY.md`, `ASSETS.md` ใน project | ขอบเขต gameplay ที่ทำงานจริง, data ownership, module boundary และ asset constraints ที่ต้องรักษา |

> เอกสารนี้เป็นแผนควบคุมงาน ไม่ใช่คำยืนยันว่าทุก feature ในอนาคตทำงานแล้ว การนำ UI ไปแสดงจะเกิดขึ้นเฉพาะเมื่อมี data binding และ rule loop รองรับจริงเท่านั้น

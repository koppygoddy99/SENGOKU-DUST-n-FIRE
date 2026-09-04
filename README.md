# Dust & Fire: Sengoku Stories

## Overview

Tabletop RPG เชิงนิยายประวัติศาสตร์ในบริบทญี่ปุ่นยุคเซ็นโกคุ ผู้เล่นประกาศเจตนาเพียงหนึ่งประโยค ระบบเลือก Stat/Mastery/Context/DN ให้เอง แล้วทอย `2d12` ตามสูตร canonical เพื่อตัดสินผลที่โลกจดจำและตอบกลับ

Deterministic engine ฝั่ง client (`client/src/lib/game/**`) เป็นผู้ตัดสินผลทอยและ state เสมอ ส่วน AI GM เป็นเพียงผู้วิเคราะห์และเล่าเรื่อง ไม่มีสิทธิ์แก้ผลเชิงกล

เกมใช้ Local Save-first: GameState และประวัติแคมเปญทั้งหมดเก็บใน browser เป็นหลัก ส่วน Drizzle/MySQL ใน server รองรับ user/auth service

### เอกสารเชิงลึก

- [docs/gameplay-loop-th.md](docs/gameplay-loop-th.md) — วงจรการเล่น, กติกา 2d12, DN และ Margin
- [docs/character-systems-th.md](docs/character-systems-th.md) — Blood/Focus, Mastery และ Stat growth
- [docs/campaign-and-save-th.md](docs/campaign-and-save-th.md) — สถานะแคมเปญและการบันทึก
- [docs/ai-gm-guardrails-th.md](docs/ai-gm-guardrails-th.md) — AI GM และ historical guardrails
- [docs/dev-setup-th.md](docs/dev-setup-th.md) — เริ่มพัฒนาในเครื่อง, คำสั่งสำคัญ, การทดสอบ
- [docs/project-status-th.md](docs/project-status-th.md) — อัปเดตระบบใหญ่ล่าสุดและสถานะปัจจุบัน
- [docs/repo-policy-th.md](docs/repo-policy-th.md) — GitHub sync policy, เอกสารสำคัญ, License และ Asset manifest

## Tech stack

| ชั้นระบบ | เทคโนโลยี (จาก package.json) |
|---|---|
| Client | React `^19.2.1`, TypeScript `5.9.3`, Vite `^7.1.7`, Tailwind CSS `^4.1.14` + shadcn/Radix UI, TanStack React Query `^5.90.2`, tRPC React bindings |
| Game rules | โมดูล pure TypeScript ที่ `client/src/lib/game/**` (core.ts, state.ts, engine.ts) — deterministic ทั้งหมด |
| Server | Express `^4.21.2` + tRPC `^11.6.0` (Node.js 22+): auth, AI GM (`server/gm.ts`), timeline, admin |
| AI / LLM | LLM invocation ผ่าน `server/_core/llm.ts` — เสนอ content เท่านั้น ไม่ตัดสินผล |
| Persistence | Browser Local Save เป็นหลัก; Drizzle ORM `^0.44.5` + MySQL (`mysql2 ^3.15.0`, `drizzle/schema.ts`) |
| Testing | Vitest `^2.1.4`, Playwright `^1.62.1` (`tests/`), smoke scripts (`scripts/`) |
| Tooling | pnpm `10.4.1` (packageManager), esbuild, Drizzle Kit `^0.31.4`, Prettier |

## Project tree

```text
SENGOKU-DUST-n-FIRE/
├── client/src/                  # React client application
│   ├── App.tsx                  # entry composition
│   ├── pages/                   # Home shell, MarketHub, CampaignsView, AdminConsole
│   ├── features/                # play, story, chronicle, relationships, powerRumor, navigation, management, shared
│   ├── lib/game/                # deterministic game contract: types/, core.ts, state.ts, engine.ts, data.ts
│   ├── lib/                     # randomEvents, worldEvents, regionInitialState, powerRumor, i18n, trpc
│   ├── components/              # DashboardLayout, shadcn ui components
│   └── public/assets/           # maps และ asset runtime files
├── server/                      # Express/tRPC server
│   ├── gm.ts                    # AI GM analysis/narrative contract
│   ├── timeline.ts              # historical timeline boundary
│   ├── routers.ts               # tRPC procedures
│   ├── relationshipAnalyzer.ts / relationshipDossiers.ts  # server-side relationship analysis
│   ├── starterProfiles.ts       # starter-profile procedures
│   ├── admin.ts                 # admin operations
│   ├── db.ts / storage.ts       # database helpers
│   ├── types/                   # server type definitions
│   └── _core/                   # trpc, context, env, llm, oauth, vite middleware, entry index.ts
├── shared/                      # client/server contracts และ shared data
│   ├── ai-gm.ts                 # AI GM contract types
│   ├── narrativeRuntime.ts / narrativeStyle.ts / narrativeGoldenExamples.ts
│   ├── historicalTimeline.ts    # historical facts
│   ├── sengokuSocialFacts.ts
│   ├── types.ts / const.ts
│   └── data/                    # staged data files (ไม่ได้เชื่อมใช้งาน runtime)
├── drizzle/                     # MySQL/Drizzle schema + generated migration SQL
├── tests/                       # Playwright browser-flow regressions
├── scripts/                     # smoke checks, i18n extract/check, utility scripts
├── docs/                        # source-of-truth guides, contracts, audits, proposals, team handbooks
├── notes/                       # dated working notes/audits (reference เท่านั้น ไม่ใช่ runtime code)
├── data/                        # static data sets เช่น sengoku-66-provinces (ไม่ได้เชื่อมใช้งาน runtime)
├── schemas/                     # JSON schemas เช่น sengoku_world_state.schema.json (ไม่ได้เชื่อมใช้งาน runtime)
└── PROJECT_ROADMAP.md           # roadmap, push protocol และ VERSION HISTORY
```

หมายเหตุ: `schemas/` และ `data/` **ไม่ได้เชื่อมใช้งาน runtime** (ไม่มี code path ที่ import ใช้)

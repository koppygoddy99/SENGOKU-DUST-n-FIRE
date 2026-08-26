import { describe, expect, it } from "vitest";
import {
  activeMainMission,
  applyMissionDirective,
  createSaikaSafehouseDemo,
  missionDirectiveIsCanonConsistent,
  normalizeGameState,
  visibleSideLeads,
  type MissionDirectiveInput,
} from "./game";

const replacement = {
  title: "ทางน้ำที่ต้องแลกด้วยชื่อ",
  giver: "คนเรือเก่า",
  objective: "พาคนที่ผู้เล่นเลือกคุ้มกันออกจากท่าโดยทิ้งร่องรอยให้น้อยที่สุด",
  pressure: "ด่านเรือเพิ่มการตรวจและชื่อของผู้เล่นเริ่มถูกถามหา",
  deadline: "ก่อนน้ำขึ้นครั้งถัดไป",
  reward: "เส้นทางน้ำและคำรับรองจากคนเรือ",
  risk: "คนของด่านจำชื่อและเรือที่เกี่ยวข้องได้",
  options: ["ถามคนเรือ", "ซ่อนคนในสินค้า", "ใช้ทางน้ำแคบ"],
  canonTerms: ["กันทาโร่", "ไซกะ"],
};

describe("mission threads and canon guards", () => {
  it("upgrades malformed legacy saves to one open Main Thread and hidden excess leads", () => {
    const game = createSaikaSafehouseDemo();
    const legacy = {
      ...game,
      schemaVersion: 7,
      missions: [
        { ...game.missions[0], role: undefined, visibility: undefined },
        { ...game.missions[0], id: "legacy-main-two", title: "งานเก่าที่สอง", role: "main" as const, visibility: "visible" as const },
        { ...game.missions[0], id: "legacy-side-one", title: "ร่องรอยหนึ่ง", role: "side" as const, visibility: "visible" as const },
        { ...game.missions[0], id: "legacy-side-two", title: "ร่องรอยสอง", role: "side" as const, visibility: "visible" as const },
        { ...game.missions[0], id: "legacy-side-three", title: "ร่องรอยสาม", role: "side" as const, visibility: "visible" as const },
      ],
    };
    const normalized = normalizeGameState(legacy);
    expect(activeMainMission(normalized)?.id).toBe(game.missions[0].id);
    expect(visibleSideLeads(normalized)).toHaveLength(2);
    expect(normalized.missions.find((mission) => mission.id === "legacy-side-three")?.visibility).toBe("hidden");
  });

  it("replaces the Main Thread only through a post-roll directive and raises its deterministic progress requirement", () => {
    const game = createSaikaSafehouseDemo();
    const main = activeMainMission(game)!;
    const directive: MissionDirectiveInput = { kind: "replace_main", targetMissionId: main.id, reason: "ผู้เล่นเลือกพาคนออกจากซาไกแทนการรักษาผลประโยชน์เดิม", evidence: ["ผลทอยที่บันทึกแล้ว", "คำประกาศเจตนา"], replacement };
    const applied = applyMissionDirective(game, directive);
    const nextMain = activeMainMission(applied.state)!;
    expect(applied.notice).toMatchObject({ kind: "main-replaced", title: replacement.title });
    expect(game.missions[0].state).toBe("offered");
    expect(applied.state.missions.find((mission) => mission.id === main.id)).toMatchObject({ state: "retired", supersededBy: nextMain.id });
    expect(nextMain).toMatchObject({ role: "main", visibility: "visible", challenge: "elevated", progress: { required: 3 } });
  });

  it("keeps Side Leads hidden until a separate reveal directive and never exceeds two visible leads", () => {
    const game = createSaikaSafehouseDemo();
    const created = applyMissionDirective(game, { kind: "create_hidden_side", targetMissionId: null, reason: "มีคนพบรอยเชือกที่ท่าเรือ", evidence: ["ร่องรอยในฉาก"], replacement });
    const hidden = created.state.missions.find((mission) => mission.role === "side")!;
    expect(visibleSideLeads(created.state)).toHaveLength(0);
    expect(hidden.visibility).toBe("hidden");
    const revealed = applyMissionDirective(created.state, { kind: "reveal_side", targetMissionId: hidden.id, reason: "ผู้เล่นเห็นรอยเชือกด้วยตนเอง", evidence: ["การทอยสังเกต"], replacement: null });
    expect(revealed.notice.kind).toBe("side-revealed");
    expect(visibleSideLeads(revealed.state)).toHaveLength(1);
  });

  it("rejects a proposed violent side mission that directly contradicts a protected open-thread name", () => {
    const game = createSaikaSafehouseDemo();
    const contradictory: MissionDirectiveInput = { kind: "create_hidden_side", targetMissionId: null, reason: "ฆ่าลูกชายของกันทาโร่เพื่อเปิดทาง", evidence: ["คำสั่งลับ"], replacement: { ...replacement, objective: "ฆ่าลูกชายของกันทาโร่เพื่อเปิดทาง", canonTerms: ["กันทาโร่"] } };
    expect(missionDirectiveIsCanonConsistent(game, contradictory)).toBe(false);
    expect(applyMissionDirective(game, contradictory).state).toBe(game);
  });
});

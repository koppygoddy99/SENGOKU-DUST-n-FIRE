import assert from "node:assert/strict";
import { STARTER_TEMPLATES, applyRoll, buyMarketOffer, createGameState, parseAction, resolveRoll, type CharacterDraft } from "../client/src/lib/game";

const draft: CharacterDraft = {
  name: "อากิ",
  identity: "ไม่ระบุ",
  templateId: "jizamurai",
  freeformOccupation: "",
  origin: "ผู้ถือที่ดินท้องถิ่น",
  strength: "อ่านบัญชีผลผลิตได้",
  weakness: "ไม่กล้าขัดผู้มีพระคุณ",
  answers: {
    first_survivor: "น้องชาย",
    stance: "ยังไม่เลือกฝ่าย",
    never_surrender: "บัญชีข้าว",
    debts: "ติดหนี้ช่างเรือ",
    hidden_knowledge: "รู้ทางน้ำเลี่ยงด่าน",
    sacrifice: "ชื่อเสียงตนเอง",
  },
};

const state = createGameState({
  id: "smoke-campaign",
  title: "Smoke Test Chronicle",
  year: 1566,
  season: "Winter",
  region: "Mikawa",
  location: "หมู่บ้านสมมติใกล้ด่าน",
  warShadow: 3,
  day: 1,
}, draft);

assert.equal(state.credits, 50, "new campaigns begin with 50 trial credits");
assert.equal(state.campaign.season, "Winter", "winter must survive the campaign contract");
assert.equal(state.character.attributes.mind, 3, "template attributes are applied");
assert.equal(state.character.pulls.length, 6, "all relationship pulls are created");
assert.equal(state.market.some((offer) => offer.id === "charcoal-brazier"), true, "winter market item is created");
assert.equal(STARTER_TEMPLATES.length, 10, "all ten starting paths are available");

for (const template of STARTER_TEMPLATES) {
  const templateState = createGameState({ ...state.campaign, id: `template-${template.id}` }, { ...draft, templateId: template.id });
  assert.equal(templateState.character.occupationId, template.id, `template ${template.id} creates its character`);
  assert.ok(templateState.missions[0].title.length > 0, `template ${template.id} creates an opening mission`);
}

const preview = parseAction("ข้าจะใช้บัญชีผลผลิตขอเวลาเจรจากับเสมียน", state);
assert.equal(preview.axis, "mind", "ledger action selects the judgment axis");
assert.ok(preview.difficulty >= 10, "a valid difficulty is created");

const record = resolveRoll(preview, state, false);
assert.equal(record.dice.length, 2, "the engine rolls exactly 2d12");
assert.equal(record.total, record.dice[0] + record.dice[1] + state.character.attributes[preview.axis] + (preview.mastery?.level ?? 0) + preview.contextBonus, "roll total follows the canonical formula");

const afterRoll = applyRoll(state, record);
assert.equal(afterRoll.rolls.length, 1, "resolved rolls are persisted");
assert.equal(afterRoll.memories.length, 2, "each resolved roll creates a world memory");
assert.equal(afterRoll.tick, 2, "resolving a roll advances the leaf count");
const localSaveRoundTrip = JSON.parse(JSON.stringify(afterRoll));
assert.equal(localSaveRoundTrip.currentScene.id, afterRoll.currentScene.id, "a Local Save preserves the current scene");
assert.equal(localSaveRoundTrip.rolls[0].id, afterRoll.rolls[0].id, "a Local Save preserves roll records");

const beforeProperty = afterRoll.character.resources.property;
const marketResult = buyMarketOffer(afterRoll, "rope");
if (beforeProperty >= 1) {
  assert.equal(marketResult.state.character.resources.property, beforeProperty - 1, "market purchase subtracts property");
  assert.ok(marketResult.state.character.inventory.some((item) => item.id.startsWith("market-rope")), "market goods enter inventory");
}

console.log("Game engine smoke test passed: campaign → action preview → 2d12 roll → memory → market.");

import { describe, expect, it } from "vitest";
import {
  buyMarketOffer,
  createSaikaSafehouseDemo,
  equipItem,
  equippedItemsOf,
  equipmentSlotForItem,
  emptyEquipmentState,
  item,
  normalizeGameState,
  parseAction,
  unequipItem,
  useMarketService,
  type InventoryItem,
} from "./game";

function demoWithEquipment() {
  return { ...createSaikaSafehouseDemo(), equipment: emptyEquipmentState() };
}

const weaponItem = (id = "test-blade"): InventoryItem => item(id, "ดาบทดสอบ", "equipment", "ใบดาบธรรมดา", 1, ["bonus"], { stat: "hand", value: 1, tags: ["fight", "weapon"] });
const outfitItem = (id = "test-armor"): InventoryItem => ({ ...item(id, "โยโร่ยเก่า", "equipment", "เกราะเก่าผ่านศึก", 2, ["bonus"], { stat: "body", value: 1, tags: ["protect"] }), category: "tool" as const });
const bonusItem = (id = "test-kit"): InventoryItem => ({ ...item(id, "ชุดเครื่องมือแผน", "equipment", "อุปกรณ์วางแผน", 1, ["bonus"], { stat: "mind", value: 1, tags: ["แผน"] }), category: "tool" as const });

describe("equipment core", () => {
  it("equips a weapon into the single weapon slot", () => {
    const state = demoWithEquipment();
    const blade = weaponItem();
    const withItem = { ...state, character: { ...state.character, inventory: [...state.character.inventory, blade] } };
    const result = equipItem(withItem, "weapon", blade.id);
    expect(result.state.equipment?.weapon).toBe(blade.id);
    expect(result.message).toContain("สวมอาวุธ");
  });

  it("equips an outfit into the single outfit slot", () => {
    const state = demoWithEquipment();
    const armor = outfitItem();
    const withItem = { ...state, character: { ...state.character, inventory: [...state.character.inventory, armor] } };
    const result = equipItem(withItem, "outfit", armor.id);
    expect(result.state.equipment?.outfit).toBe(armor.id);
  });

  it("unequips weapon and outfit back to inventory", () => {
    const state = demoWithEquipment();
    const blade = weaponItem();
    const armor = outfitItem();
    const withItems = { ...state, character: { ...state.character, inventory: [...state.character.inventory, blade, armor] } };
    const armed = equipItem(withItems, "weapon", blade.id).state;
    const dressed = equipItem(armed, "outfit", armor.id).state;
    const bare = unequipItem(dressed, "weapon").state;
    const plain = unequipItem(bare, "outfit").state;
    expect(bare.equipment?.weapon).toBeNull();
    expect(bare.equipment?.outfit).toBe(armor.id);
    expect(plain.equipment?.outfit).toBeNull();
    // item ไม่หายจาก inventory เพราะ equipment อ้าง id เท่านั้น
    expect(plain.character.inventory.some((entry) => entry.id === blade.id)).toBe(true);
  });

  it("replaces an equipped weapon and the old one stays in inventory exactly once", () => {
    const state = demoWithEquipment();
    const a = weaponItem("sword-a");
    const b = weaponItem("sword-b");
    const withItems = { ...state, character: { ...state.character, inventory: [...state.character.inventory, a, b] } };
    const first = equipItem(withItems, "weapon", a.id).state;
    const second = equipItem(first, "weapon", b.id).state;
    expect(second.equipment?.weapon).toBe(b.id);
    expect(second.character.inventory.filter((entry) => entry.id === a.id)).toHaveLength(1);
    expect(second.character.inventory.filter((entry) => entry.id === b.id)).toHaveLength(1);
    expect(equippedItemsOf(second).map((entry) => entry.id)).toEqual([b.id]);
  });

  it("replaces an equipped outfit the same way", () => {
    const state = demoWithEquipment();
    const a = outfitItem("armor-a");
    const b = outfitItem("armor-b");
    const withItems = { ...state, character: { ...state.character, inventory: [...state.character.inventory, a, b] } };
    const second = equipItem(equipItem(withItems, "outfit", a.id).state, "outfit", b.id).state;
    expect(second.equipment?.outfit).toBe(b.id);
    expect(equippedItemsOf(second).map((entry) => entry.id)).toEqual([b.id]);
  });

  it("rejects missing, wrong-slot, and unusable items without changing state", () => {
    const state = demoWithEquipment();
    const missing = equipItem(state, "weapon", "ghost");
    expect(missing.state).toBe(state);

    const blade = weaponItem();
    const armor = outfitItem();
    const doc = item("test-doc", "ใบผ่านทาง", "document", "เอกสาร", 1, ["unlock"]);
    const damaged = { ...weaponItem("broken-blade"), condition: "damaged" as const };
    const withItems = { ...state, character: { ...state.character, inventory: [...state.character.inventory, blade, armor, doc, damaged] } };
    expect(equipItem(withItems, "outfit", blade.id).state).toBe(withItems);
    expect(equipItem(withItems, "weapon", armor.id).state).toBe(withItems);
    expect(equipItem(withItems, "weapon", doc.id).state).toBe(withItems);
    expect(equipItem(withItems, "weapon", damaged.id).state).toBe(withItems);
  });

  it("ignores stale equipment ids instead of crashing", () => {
    const state = { ...demoWithEquipment(), equipment: { outfit: "ghost-armor", weapon: "ghost-blade" } };
    expect(equippedItemsOf(state)).toEqual([]);
  });
});

describe("equipment resolution rule: Inventory is not Equipped", () => {
  it("gives no bonus for an inventory-only item and consumes the bonus once equipped", () => {
    const state = demoWithEquipment();
    const kit = bonusItem();
    const withItem = { ...state, character: { ...state.character, inventory: [...state.character.inventory, kit] } };
    expect(parseAction("ข้าจะเสนอแผนให้กันทาโร่", withItem).contextBonus).toBe(0);
    const equipped = equipItem(withItem, "outfit", kit.id).state;
    expect(equipmentSlotForItem(kit)).toBe("outfit");
    expect(parseAction("ข้าจะเสนอแผนให้กันทาโร่", equipped).contextBonus).toBe(1);
  });

  it("keeps the special document rule working from inventory without an equipment slot", () => {
    const state = demoWithEquipment();
    const doc = item("test-order", "Sealed Order", "document", "authentic order", 0, ["unlock"], undefined, { mode: "dn_zero", tags: ["gate"], reason: "authentic order opens the gate" });
    const withDoc = { ...state, character: { ...state.character, inventory: [...state.character.inventory, doc] } };
    const preview = parseAction("I will carry the sealed order through the gate guard", withDoc);
    expect(preview.difficulty).toBe(0);
    expect(preview.specialItem?.itemId).toBe(doc.id);
  });
});

describe("market services consumer", () => {
  it("records a service engagement and closes availability for a valid service", () => {
    const state = createSaikaSafehouseDemo();
    const before = state.economy.transactions.length;
    const result = useMarketService(state, "harbor-scribe");
    expect(result.state).not.toBe(state);
    expect(result.state.economy.transactions).toHaveLength(before + 1);
    const record = result.state.economy.transactions[result.state.economy.transactions.length - 1];
    expect(record.kind).toBe("service");
    expect(record.counterpart).toBe(state.economy.services.find((entry) => entry.id === "harbor-scribe")?.provider);
    expect(result.state.economy.services.find((entry) => entry.id === "harbor-scribe")?.availability).toBe("unavailable");
    expect(result.state.memories.some((memory) => memory.kind === "actor_relation" && memory.title === result.state.economy.transactions[result.state.economy.transactions.length - 1].title)).toBe(true);
  });

  it("rejects unknown and unavailable services without changing state", () => {
    const state = createSaikaSafehouseDemo();
    expect(useMarketService(state, "no-such-service").state).toBe(state);
    const closed = { ...state, economy: { ...state.economy, services: state.economy.services.map((entry) => ({ ...entry, availability: "unavailable" as const })) } };
    expect(useMarketService(closed, "harbor-scribe").state).toBe(closed);
  });

  it("does not regress the existing market purchase flow", () => {
    const state = createSaikaSafehouseDemo();
    const money = state.character.resources.currency?.amount ?? state.character.resources.property;
    const result = buyMarketOffer(state, "saika-rations");
    expect(result.state.character.resources.currency?.amount).toBe(money - 1);
    expect(result.state.character.inventory.some((entry) => entry.id.startsWith("market-saika-rations"))).toBe(true);
  });
});

describe("save compatibility", () => {
  it("normalizes an old save without equipment to empty slots", () => {
    const state = createSaikaSafehouseDemo() as Partial<ReturnType<typeof createSaikaSafehouseDemo>> & Record<string, unknown>;
    delete state.equipment;
    const normalized = normalizeGameState(state as never);
    expect(normalized.equipment).toEqual({ outfit: null, weapon: null });
  });

  it("removes stale equipment ids during normalization without fabricating items", () => {
    const state = { ...createSaikaSafehouseDemo(), equipment: { outfit: "ghost-armor", weapon: "ghost-blade" } };
    const normalized = normalizeGameState(state);
    expect(normalized.equipment).toEqual({ outfit: null, weapon: null });
    expect(normalized.character.inventory.every((entry) => entry.id !== "ghost-armor" && entry.id !== "ghost-blade")).toBe(true);
  });

  it("keeps valid equipment through a normalize round trip", () => {
    const state = demoWithEquipment();
    const blade = weaponItem("round-blade");
    const withItem = { ...state, character: { ...state.character, inventory: [...state.character.inventory, blade] } };
    const equipped = equipItem(withItem, "weapon", blade.id).state;
    const normalized = normalizeGameState(equipped);
    expect(normalized.equipment?.weapon).toBe(blade.id);
  });
});

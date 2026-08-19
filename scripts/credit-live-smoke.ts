import { eq } from "drizzle-orm";
import { getDb, getUserTrialCredits, spendUserTrialCredits } from "../server/db";
import { users } from "../drizzle/schema";

const probeOpenId = `credit-live-smoke-${Date.now()}`;

async function run() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");

  try {
    await db.insert(users).values({ openId: probeOpenId, name: "Credit live smoke probe" });
    const probe = await db.select({ id: users.id }).from(users).where(eq(users.openId, probeOpenId)).limit(1);
    const userId = probe[0]?.id;
    if (!userId) throw new Error("Probe user was not created");

    const before = await getUserTrialCredits(userId);
    const after = await spendUserTrialCredits(userId, 1);
    if (before !== 50 || after !== 49) throw new Error(`Unexpected credit transition: ${before} -> ${after}`);

    console.log(JSON.stringify({ probe: "temporary", before, spent: 1, after, cleanup: "pending" }, null, 2));
  } finally {
    await db.delete(users).where(eq(users.openId, probeOpenId));
  }

  const remaining = await db.select({ id: users.id }).from(users).where(eq(users.openId, probeOpenId)).limit(1);
  if (remaining.length !== 0) throw new Error("Probe cleanup failed");
  console.log(JSON.stringify({ cleanup: "confirmed" }, null, 2));
}

run()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });

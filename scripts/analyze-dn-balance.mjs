const bonuses = [3, 5, 7, 9];
const difficulties = [10, 14, 18, 22];

function outcomeForMargin(margin) {
  if (margin >= 5) return "decisive";
  if (margin >= 0) return "success";
  if (margin >= -4) return "partial";
  return "failure";
}

function distribution(bonus, difficulty) {
  const counts = { decisive: 0, success: 0, partial: 0, failure: 0 };
  for (let first = 1; first <= 12; first += 1) {
    for (let second = 1; second <= 12; second += 1) {
      counts[outcomeForMargin(first + second + bonus - difficulty)] += 1;
    }
  }
  return Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, `${((value / 144) * 100).toFixed(1)}%`]));
}

for (const bonus of bonuses) {
  console.log(`BONUS +${bonus}`);
  for (const difficulty of difficulties) {
    console.log(`  DN ${difficulty}`, distribution(bonus, difficulty));
  }
}

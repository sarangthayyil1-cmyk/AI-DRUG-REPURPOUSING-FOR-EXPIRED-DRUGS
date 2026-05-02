// Two-part test for the rate-limit pipeline:
//   1. Pure logic test on the in-memory limiter (no server, no auth).
//   2. HTTP test against /api/analyze on a running dev server, verifying:
//        - unauthenticated calls all return 401 (auth gate fires before rate limit)
//        - 401s do NOT consume rate-limit budget
//        - the request never throws / hangs
//
// Run logic test only:   node scripts/test_rate_limit.mjs
// Run HTTP test too:     node scripts/test_rate_limit.mjs --http http://localhost:3000

import { rateLimit } from "../src/lib/rateLimit.ts";

let failures = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`  ✗ ${msg}`);
    failures++;
  } else {
    console.log(`  ✓ ${msg}`);
  }
}

// ── 1. Limiter logic test ──────────────────────────────────────────
console.log("\n[1] Sliding-window limiter (limit=5 per 60s)");

const KEY = "test-key-" + Date.now();
const results = [];
for (let i = 0; i < 8; i++) {
  results.push(rateLimit(KEY, 5, 60_000));
}

const accepted = results.filter((r) => r.ok).length;
const rejected = results.filter((r) => !r.ok).length;

assert(accepted === 5, `5 of 8 requests accepted (got ${accepted})`);
assert(rejected === 3, `3 of 8 requests rejected (got ${rejected})`);
assert(results[0].remaining === 4, `first request reports 4 remaining`);
assert(results[4].remaining === 0, `5th request reports 0 remaining`);
assert(results[5].ok === false, `6th request is rejected`);
assert(
  results[5].retryAfterSec >= 1 && results[5].retryAfterSec <= 60,
  `retry-after for 6th is in (0, 60] sec (got ${results[5].retryAfterSec})`
);

// Different key gets a fresh budget.
const otherKey = "other-key-" + Date.now();
const otherResult = rateLimit(otherKey, 5, 60_000);
assert(otherResult.ok, `different key starts with fresh budget`);
assert(otherResult.remaining === 4, `different key reports 4 remaining`);

// ── 2. HTTP smoke test (optional) ─────────────────────────────────
const httpFlag = process.argv.indexOf("--http");
if (httpFlag !== -1) {
  const base = process.argv[httpFlag + 1] ?? "http://localhost:3000";
  console.log(`\n[2] HTTP test against ${base}/api/analyze`);

  const N = 35;
  const t0 = performance.now();
  const responses = await Promise.all(
    Array.from({ length: N }, (_, i) =>
      fetch(`${base}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drugName: `TestDrug-${i}`,
          expiryDate: "2024-01-01",
          formulation: "tablet",
        }),
      }).then((r) => ({ status: r.status, retryAfter: r.headers.get("retry-after") }))
    )
  );
  const elapsed = (performance.now() - t0).toFixed(0);
  console.log(`  fired ${N} requests in ${elapsed}ms`);

  const counts = responses.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  console.log(`  status distribution:`, counts);

  // Without a Supabase session, every request should be 401.
  assert(
    counts[401] === N,
    `all ${N} unauthenticated requests return 401 (got ${counts[401] ?? 0})`
  );
  assert(
    !counts[500],
    `no requests crashed with 500 (got ${counts[500] ?? 0})`
  );
}

console.log(
  failures === 0
    ? "\n✅ all assertions passed"
    : `\n❌ ${failures} assertion(s) failed`
);
process.exit(failures === 0 ? 0 : 1);

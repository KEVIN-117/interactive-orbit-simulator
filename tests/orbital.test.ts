import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PLANETS,
  SOLAR_PLANETS,
  solveEccentricAnomaly,
} from "../src/lib/planets";
import {
  calculateVelocity,
  calculatePeriod,
  calculateHohmannTransfer,
  generateOrbitPoints,
} from "../src/lib/physics/orbital";

test("reference circular Earth orbit at 400 km has expected speed and period", () => {
  const r = PLANETS.earth.radius + 400;
  assert.ok(Math.abs(calculateVelocity(r, r, PLANETS.earth.mu) - 7.673) < 0.01);
  assert.ok(Math.abs(calculatePeriod(r, PLANETS.earth.mu) / 60 - 92.41) < 0.1);
});
test("raising a circular orbit reduces speed and increases period", () => {
  const p = PLANETS.earth,
    a = p.radius + 400,
    b = p.radius + 3000;
  assert.ok(calculateVelocity(a, a, p.mu) > calculateVelocity(b, b, p.mu));
  assert.ok(calculatePeriod(a, p.mu) < calculatePeriod(b, p.mu));
});
test("Kepler solver stays accurate across large times and high eccentricity", () => {
  for (const ecc of [0, 0.0167, 0.2056, 0.8])
    for (const mean of [-100, 0, 0.1, Math.PI, 24, 100000]) {
      const e = solveEccentricAnomaly(mean, ecc),
        m = ((mean % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      assert.ok(Math.abs(e - ecc * Math.sin(e) - m) < 1e-8);
    }
});
test("transfer impulses handle ascending, descending and equal orbits", () => {
  const p = PLANETS.earth;
  const up = calculateHohmannTransfer(7000, 42000, p.mu),
    down = calculateHohmannTransfer(42000, 7000, p.mu);
  assert.ok(up.deltaV1 > 0 && up.deltaV2 > 0);
  assert.ok(down.deltaV1 < 0 && down.deltaV2 < 0);
  assert.ok(Math.abs(up.totalDeltaV - down.totalDeltaV) < 1e-10);
  assert.equal(calculateHohmannTransfer(7000, 7000, p.mu).totalDeltaV, 0);
});
test("orbit geometry closes and preserves apsidal radii under rotations", () => {
  const state = {
    semiMajorAxis: 10000,
    eccentricity: 0.4,
    inclination: 63,
    argumentOfPeriapsis: 37,
    trueAnomaly: 0,
  };
  const points = generateOrbitPoints(state, 6371, 256);
  assert.ok(Math.abs(Math.hypot(...points[0]) - 6000) < 1e-8);
  assert.ok(Math.abs(Math.hypot(...points[128]) - 14000) < 1e-8);
  assert.ok(Math.hypot(...points[0].map((v, i) => v - points[256][i])) < 1e-8);
});
test("catalogue has eight planets plus Moon and valid orbital parameters", () => {
  assert.equal(SOLAR_PLANETS.length, 8);
  assert.equal(Object.keys(PLANETS).length, 9);
  for (const p of Object.values(PLANETS))
    assert.ok(
      p.mu > 0 &&
        p.radius > 0 &&
        p.periodDays > 0 &&
        p.eccentricity >= 0 &&
        p.eccentricity < 1,
    );
});

import test from "node:test";
import assert from "node:assert/strict";
import { calculatePromotion } from "../src/promotion.js";

const base = { price: 50, events: 4, partners: 5, fixedCost: 1200, variableCost: 10 };

test("annual promotion revenue, costs, loss, and rounded-up break-even match the business model", () => {
  assert.deepEqual(calculatePromotion(base), {
    revenue: 1000, costs: 1400, profit: -400, contribution: 160,
    breakEvenPartners: 8, additionalPartners: 3,
  });
  const threshold = calculatePromotion({ ...base, partners: 8 });
  assert.equal(threshold.profit, 80);
  assert.equal(calculatePromotion({ ...base, partners: 7 }).profit, -80);
});

test("partner changes update revenue, profit and shortfall while preserving the threshold", () => {
  assert.deepEqual(calculatePromotion({ ...base, partners: 10 }), {
    revenue: 2000, costs: 1600, profit: 400, contribution: 160,
    breakEvenPartners: 8, additionalPartners: 0,
  });
  assert.deepEqual(calculatePromotion({ ...base, partners: 0 }), {
    revenue: 0, costs: 1200, profit: -1200, contribution: 160,
    breakEvenPartners: 8, additionalPartners: 8,
  });
});

test("price, frequency, fixed costs, and variable costs change the break-even threshold", () => {
  for (const [patch, expected] of [
    [{ price: 90 }, 4], [{ events: 2 }, 15],
    [{ fixedCost: 2400 }, 15], [{ variableCost: 20 }, 10],
  ]) assert.equal(calculatePromotion({ ...base, ...patch }).breakEvenPartners, expected);
});

test("zero or negative contribution has no growth-based break-even threshold", () => {
  for (const patch of [{ events: 0 }, { price: 10 }, { price: 5 }, { price: 0, variableCost: 0, fixedCost: 0 }]) {
    const result = calculatePromotion({ ...base, ...patch });
    assert.equal(result.breakEvenPartners, null);
    assert.equal(result.additionalPartners, null);
    assert.ok(Number.isFinite(result.profit));
  }
  assert.equal(calculatePromotion({ ...base, events: 0 }).profit, -1200);
  assert.equal(calculatePromotion({ ...base, price: 5 }).profit, -1300);
});

test("zero fixed costs with positive contribution needs zero partners to cover costs", () => {
  const result = calculatePromotion({ ...base, fixedCost: 0, partners: 0 });
  assert.equal(result.breakEvenPartners, 0);
  assert.equal(result.additionalPartners, 0);
  assert.equal(result.profit, 0);
});

test("currency arithmetic avoids floating point inflation of exact break-even", () => {
  const result = calculatePromotion({ price: 0.1, variableCost: 0.07, events: 1, partners: 3, fixedCost: 0.09 });
  assert.equal(result.breakEvenPartners, 3);
  assert.equal(result.revenue, 0.3);
  assert.equal(result.costs, 0.3);
  assert.equal(result.profit, 0);
});

test("invalid inputs and unsafe numeric ranges do not yield financial results", () => {
  for (const key of Object.keys(base)) {
    for (const value of [-1, NaN, Infinity, undefined, null, "", "5"])
      assert.throws(() => calculatePromotion({ ...base, [key]: value }));
  }
  for (const key of ["partners", "events"])
    assert.throws(() => calculatePromotion({ ...base, [key]: 1.5 }), /whole number/);
  for (const key of ["price", "variableCost", "fixedCost"])
    assert.throws(() => calculatePromotion({ ...base, [key]: 0.001 }), /two decimal/);
  assert.throws(() => calculatePromotion({ ...base, events: 1e9, partners: 1e9 }), /numeric range/);
});

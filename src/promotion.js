const moneyFields = {
  price: "Price per promoted event",
  fixedCost: "Fixed annual costs",
  variableCost: "Variable cost per promoted event",
};
const countFields = {
  events: "Events per partner per year",
  partners: "Number of paying partners",
};

// Work in cents so decimal prices do not inflate an exact break-even threshold.
export function calculatePromotion(input) {
  const cents = {};
  for (const [key, label] of Object.entries(moneyFields)) {
    const value = input[key];
    const scaled = value * 100;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0 ||
        !Number.isSafeInteger(Math.round(scaled)) || Math.abs(scaled - Math.round(scaled)) > 0.000001)
      throw new Error(`${label} must be a non-negative amount with at most two decimal places, within the supported numeric range.`);
    cents[key] = Math.round(scaled);
  }
  for (const [key, label] of Object.entries(countFields)) {
    if (!Number.isSafeInteger(input[key]) || input[key] < 0)
      throw new Error(`${label} must be a non-negative whole number within the supported numeric range.`);
  }
  const volume = input.partners * input.events;
  const revenue = volume * cents.price;
  const costs = cents.fixedCost + volume * cents.variableCost;
  const profit = revenue - costs;
  const contribution = input.events * (cents.price - cents.variableCost);
  if (![revenue, costs, profit, contribution].every(Number.isSafeInteger))
    throw new Error("These assumptions exceed the supported numeric range. Use smaller values.");
  const breakEvenPartners = contribution > 0 ? Math.ceil(cents.fixedCost / contribution) : null;
  return {
    revenue: revenue / 100,
    costs: costs / 100,
    profit: profit / 100,
    contribution: contribution / 100,
    breakEvenPartners,
    additionalPartners: breakEvenPartners === null ? null : Math.max(0, breakEvenPartners - input.partners),
  };
}

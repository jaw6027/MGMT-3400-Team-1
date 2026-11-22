import { calculatePromotion } from "./promotion.js";

const fields = [
  ["price", "Price per promoted event (USD)", "0.01"],
  ["events", "Events per partner per year", "1"],
  ["partners", "Number of paying partners", "1"],
  ["fixedCost", "Fixed annual costs (USD)", "0.01"],
  ["variableCost", "Variable cost per promoted event (USD)", "0.01"],
];
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const number = new Intl.NumberFormat("en-US");

export function setupPromotion({ openDialog, escape }) {
  // Session-only assumptions; do not read or write event prices, plans, or review storage.
  const scenarios = [
    { price: "50", events: "4", partners: "5", fixedCost: "1200", variableCost: "10" },
    { price: "75", events: "6", partners: "5", fixedCost: "1200", variableCost: "15" },
  ];
  const content = document.querySelector("#dialog-content");

  function update(row) {
    const error = row.querySelector('[role="alert"]');
    const output = row.querySelector('[role="status"]');
    const values = {};
    for (const input of row.querySelectorAll("input")) {
      scenarios[Number(row.dataset.scenario)][input.name] = input.value;
      // Number("") is zero; an unfinished input must instead invalidate the result.
      values[input.name] = input.value === "" ? NaN : Number(input.value);
      input.setAttribute("aria-invalid", String(input.value === "" || !input.validity.valid));
    }
    try {
      const result = calculatePromotion(values);
      const metrics = [
        ["revenue", "Annual revenue", currency.format(result.revenue)],
        ["costs", "Annual costs", currency.format(result.costs)],
        ["profit", "Annual profit/loss", currency.format(result.profit)],
        ["breakEvenPartners", "Break-even partner count", result.breakEvenPartners === null ? "Not applicable" : number.format(result.breakEvenPartners)],
        ["additionalPartners", "Additional partners needed", result.additionalPartners === null ? "Not applicable" : number.format(result.additionalPartners)],
      ];
      let explanation;
      if (values.events === 0) {
        explanation = "No events are promoted. Increase event frequency to calculate a partner-based break-even threshold.";
      } else if (result.contribution <= 0) {
        explanation = "No positive contribution: promotion price must exceed variable cost for a partner-based break-even threshold. " +
          (result.contribution < 0 ? "Each additional partner increases the loss." : "Revenue only covers variable costs; it contributes nothing toward fixed costs or profit.");
      } else {
        explanation = `Annual contribution per partner: ${currency.format(result.contribution)}. ` +
          (result.additionalPartners === 0 ? "Break-even reached: annual revenue covers annual costs." : `${number.format(result.additionalPartners)} more paying partner(s) needed to cover annual costs.`);
      }
      output.innerHTML = `<dl class="promotion-results">${metrics.map(([key, label, value]) => `<div><dt>${label}</dt><dd data-metric="${key}">${value}</dd></div>`).join("")}</dl><p class="promotion-explanation">${explanation}</p>`;
      output.hidden = false;
      error.hidden = true;
      error.textContent = "";
    } catch (reason) {
      output.innerHTML = "";
      output.hidden = true;
      error.textContent = reason.message;
      error.hidden = false;
    }
  }

  document.querySelector("#promotion-nav").addEventListener("click", () => {
    openDialog(`<div class="organizer-body calculator-body">
      <div class="eyebrow">ORGANIZER &amp; BUSINESS TOOLS</div><h2 id="dialog-title">Promotion calculator</h2>
      <p class="submission-note" id="promotion-note"><strong>SAMPLE ASSUMPTIONS</strong> — all starting values are fictional planning examples, not established Alpas prices. Edit both scenarios to compare annual promotion revenue and costs. All amounts are USD.</p>
      <p>Each paying partner buys the specified number of event promotions per year. Results update as you type. Visitor ticket prices and My Plans costs are separate.</p>
      ${scenarios.map((scenario, index) => `<fieldset class="promotion-scenario" data-scenario="${index}"><legend>Sample scenario ${index === 0 ? "A" : "B"}</legend>
        <div class="organizer-form promotion-inputs">${fields.map(([key, label, step]) => `<label>${label}<input name="${key}" type="number" min="0" step="${step}" required value="${escape(scenario[key])}" aria-describedby="promotion-note promotion-error-${index}"></label>`).join("")}</div>
        <p class="form-error" id="promotion-error-${index}" role="alert" hidden></p>
        <div role="status" aria-live="polite" aria-atomic="true"></div>
      </fieldset>`).join("")}
      <details class="promotion-formulas"><summary tabindex="0">How the calculations work</summary><ul>
        <li>Annual revenue = paying partners × events per partner per year × promotion price.</li>
        <li>Annual costs = fixed annual costs + paying partners × events per partner per year × variable cost.</li>
        <li>Annual profit/loss = annual revenue − annual costs.</li>
        <li>Annual contribution per partner = events per partner per year × (promotion price − variable cost).</li>
        <li>Break-even partners = fixed annual costs ÷ annual contribution per partner, rounded up, when contribution is positive.</li>
        <li>Additional partners needed = break-even partners − current partners, minimum zero.</li>
      </ul><p>Changing partner count changes revenue, profit/loss, and progress toward break-even. The threshold changes with price, frequency, or costs. Zero or negative contribution has no partner-based threshold.</p></details>
      <p class="field-hint">Assumptions remain while this page is open and reset on reload. This planning estimate assumes every partner purchases the same annual volume; it does not collect payments or predict demand.</p>
    </div>`);
    content.querySelectorAll("[data-scenario]").forEach(update);
  });
  content.addEventListener("input", (event) => {
    const row = event.target.closest("[data-scenario]");
    if (row) update(row);
  });
}

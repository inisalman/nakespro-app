const fs = require('fs');
const content = fs.readFileSync('src/app/register/register-client.tsx', 'utf8');

// 1. Filter out the professional plan when billing is monthly
let newContent = content.replace(
  /Object\.entries\(PLANS\)\.map\(\(\[key, p\]\) => \{/,
  `Object.entries(PLANS)
              .filter(([key]) => !(billing === "monthly" && key === "professional"))
              .map(([key, p]) => {`
);

// 2. We need to format the price in the toggle display and the card display correctly.
// "25.000/tahun" implies yearlyPrice is displayed without further processing when billing="yearly", but we want it to be 25.000/bulan (so it shows how much they pay monthly if billed yearly, or just change the display to "per bulan")

// Let's check the pricing logic in the left sidebar as well as the main cards:
// The issue is in lines like:
// <span className="mb-2 text-sm text-neutral-400">{billing === "yearly" ? "/tahun" : "/bulan"}</span>
// This makes it show "Rp25.000 /tahun". But Rp25.000 is actually the per-month equivalent of the yearly cost.

// Update the billing periods for the summary (left panel)
newContent = newContent.replace(
  /<span className="mb-2 text-sm text-neutral-400">\{billing === "yearly" \? "\/tahun" : "\/bulan"\}<\/span>/,
  `<span className="mb-2 text-sm text-neutral-400">{billing === "yearly" ? "/bulan" : "/bulan"}</span>`
);

// Update the billing periods for the plan cards
newContent = newContent.replace(
  /<p className="text-xs text-neutral-500">\s*\{key === "professional" && billing === "monthly" \? "" : \(billing === "yearly" \? "\/tahun" : "\/bulan"\)\}\s*<\/p>/g,
  `<p className="text-xs text-neutral-500">
                        {key === "professional" && billing === "monthly" ? "" : (billing === "yearly" ? "/bulan" : "/bulan")}
                      </p>`
);

// We should also make sure if they switch to monthly and currently have 'professional' selected, 
// we change the selection back to 'advance'. We can do this in an effect or handle it inline:
// Update the SetBilling to also switch the plan if needed:
newContent = newContent.replace(
  /onClick=\{\(\) => setBilling\(key\)\}/g,
  `onClick={() => {
                  setBilling(key);
                  if (key === "monthly" && selectedPlanId === "professional") {
                    setSelectedPlanId("advance");
                  }
                }}`
);

fs.writeFileSync('src/app/register/register-client.tsx', newContent);
console.log('Fixed professional and pricing periods');

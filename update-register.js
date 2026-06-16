const fs = require('fs');
const content = fs.readFileSync('src/app/register/register-client.tsx', 'utf8');

// The file needs a proper replacement of the UI logic to handle the new PLANS structure
let newContent = content.replace(
  `  const [billing, setBilling] = useState<Billing>("yearly");
  const plan = PLANS[billing];`,
  `  const [billing, setBilling] = useState<Billing>("yearly");
  // Default to advance plan if they didn't select one
  const [selectedPlanId, setSelectedPlanId] = useState<string>("advance");
  const plan = PLANS[selectedPlanId];`
);

newContent = newContent.replace(
  /Berlangganan \{plan\.label\}/g,
  `Berlangganan {plan.label}`
);

newContent = newContent.replace(
  /\{formatRupiah\(plan\.price\)\}/g,
  `{formatRupiah(billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice)}`
);

newContent = newContent.replace(
  /\{plan\.period\}/g,
  `{billing === "yearly" ? "/tahun" : "/bulan"}`
);

newContent = newContent.replace(
  /\{plan\.perMonth\}/g,
  `{billing === "yearly" ? plan.yearlyNote : plan.monthlyNote}`
);

// Update the plan cards
newContent = newContent.replace(
  /<div className="space-y-3">\s*\{\(\["yearly", "monthly"\] as Billing\[\]\)\.map\(\(key\) => \{\s*const p = PLANS\[key\];\s*const active = billing === key;\s*return \(\s*<button[\s\S]*?<\/button>\s*\);\s*\}\)\}\s*<\/div>/,
  `<div className="space-y-3">
            {Object.entries(PLANS).map(([key, p]) => {
              const active = selectedPlanId === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedPlanId(key)}
                  className={\`w-full rounded-xl border-2 p-5 text-left transition-all \${
                    active
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }\`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={\`flex h-5 w-5 items-center justify-center rounded-full border-2 \${
                          active ? "border-neutral-900" : "border-neutral-300"
                        }\`}
                      >
                        {active && <span className="h-2.5 w-2.5 rounded-full bg-neutral-900" />}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{p.label}</p>
                        <p className="text-xs text-neutral-500">
                          {billing === "yearly" ? p.yearlyNote : p.monthlyNote}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-neutral-900">
                        {formatRupiah(billing === "yearly" ? p.yearlyPrice : p.monthlyPrice)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {billing === "yearly" ? "/tahun" : "/bulan"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>`
);

// Update CTA Link
newContent = newContent.replace(
  /href=\{\`\/templates\?billing=\$\{billing\}\`\}/,
  `href={\`/templates?billing=\${billing}&plan=\${selectedPlanId}\`}`
);

// Add WA Number
newContent = newContent.replace(
  /628123456789/g,
  `628568461024`
);

// Save
fs.writeFileSync('src/app/register/register-client.tsx', newContent);
console.log('Updated successfully');

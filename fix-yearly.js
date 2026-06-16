const fs = require('fs');
const content = fs.readFileSync('src/app/register/register-client.tsx', 'utf8');

// The original pricing data from content.ts is:
// starter: yearlyPrice: 25000 (which is the monthly equivalent of 300000)
// advance: yearlyPrice: 83333 (monthly equivalent of 999999)
// professional: yearlyPrice: 291667 (monthly equivalent of 3500000)

// Let's modify the PLANS object to use the actual yearly total price
let newContent = content.replace(
  `yearlyPrice: 25000,`,
  `yearlyPrice: 300000,`
);
newContent = newContent.replace(
  `yearlyPrice: 83333,`,
  `yearlyPrice: 999999,`
);
newContent = newContent.replace(
  `yearlyPrice: 291667,`,
  `yearlyPrice: 3500000,`
);

// We should revert the "/bulan" back to "/tahun" everywhere for yearly billing
newContent = newContent.replace(
  /<span className="mb-2 text-sm text-neutral-400">\{billing === "yearly" \? "\/bulan" : "\/bulan"\}<\/span>/,
  `<span className="mb-2 text-sm text-neutral-400">{billing === "yearly" ? "/tahun" : "/bulan"}</span>`
);

newContent = newContent.replace(
  /<p className="text-xs text-neutral-500">\s*\{key === "professional" && billing === "monthly" \? "" : \(billing === "yearly" \? "\/bulan" : "\/bulan"\)\}\s*<\/p>/g,
  `<p className="text-xs text-neutral-500">
                        {key === "professional" && billing === "monthly" ? "" : (billing === "yearly" ? "/tahun" : "/bulan")}
                      </p>`
);

fs.writeFileSync('src/app/register/register-client.tsx', newContent);
console.log('Fixed yearly to total price');

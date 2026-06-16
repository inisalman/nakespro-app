const fs = require('fs');
const content = fs.readFileSync('src/app/register/register-client.tsx', 'utf8');

// Use a simpler string replacement for the type definition
let newContent = content.replace(
  `  {
    label: string;
    monthlyPrice: number;
    yearlyPrice: number;
    monthlyNote: string;
    yearlyNote: string;
    features: string[];
  }
> = {`,
  `  {
    label: string;
    monthlyPrice: number;
    yearlyPrice: number;
    monthlyNote: string;
    yearlyNote: string;
    features: string[];
    ctaTarget?: string;
    ctaLabel?: string;
  }
> = {`
);

// We need to clean up the double typing from our previous regex
newContent = newContent.replace(
  /} & {\n    ctaTarget\?: string;\n    ctaLabel\?: string;\n  }\n> = {/,
  `> = {`
);

fs.writeFileSync('src/app/register/register-client.tsx', newContent);
console.log('Fixed successfully');

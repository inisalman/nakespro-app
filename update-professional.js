const fs = require('fs');
const content = fs.readFileSync('src/app/register/register-client.tsx', 'utf8');

let newContent = content.replace(
  /\} \> = \{/,
  `} & {
    ctaTarget?: string;
    ctaLabel?: string;
  }
> = {`
);

newContent = newContent.replace(
  /Didampingi langsung oleh tim ahli kami dari awal",\s*],\s*\},\s*\};/,
  `Didampingi langsung oleh tim ahli kami dari awal",
    ],
  },
  professional: {
    label: "Paket Professional",
    monthlyPrice: 0,
    yearlyPrice: 291667,
    monthlyNote: "Hanya tersedia tahunan",
    yearlyNote: "Ditagih Rp3.500.000/tahun",
    features: [
      "Semua yang ada di Advance, plus bonus domain .id eksklusif",
      "Revisi desain tidak dibatasi demi hasil yang sempurna",
      "Pengelolaan multi-website untuk banyak cabang praktik",
      "SEO tingkat lanjut & laporan performa bulanan",
      "Integrasi WhatsApp Business & chat otomatis ke pasien",
      "Halaman & layanan tanpa batas untuk kebutuhan apa pun",
      "Akses tim untuk kelola website bersama (multi-admin)",
      "Manajer akun khusus yang siap mendampingi Anda",
      "Prioritas utama untuk bantuan teknis & jaminan uptime",
    ],
    ctaTarget: "https://wa.me/628568461024?text=Halo%20NakesPro.id,%20saya%20ingin%20tanya%20soal%20paket%20Professional",
    ctaLabel: "Diskusi via WhatsApp",
  },
};`
);

newContent = newContent.replace(
  /<Link\s*href=\{\`\/templates\?billing=\$\{billing\}&plan=\$\{selectedPlanId\}\`\}\s*className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg"\s*>\s*Lanjut pilih template\s*<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">\s*<path strokeLinecap="round" strokeLinejoin="round" strokeWidth=\{2\} d="M14 5l7 7m0 0l-7 7m7-7H3" \/>\s*<\/svg>\s*<\/Link>/,
  `{selectedPlanId === "professional" ? (
            <a
              href={plan.ctaTarget}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg"
            >
              {plan.ctaLabel}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          ) : (
            <Link
              href={\`/templates?billing=\${billing}&plan=\${selectedPlanId}\`}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg"
            >
              Lanjut pilih template
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          )}`
);

newContent = newContent.replace(
  /\{formatRupiah\(billing === "yearly" \? p\.yearlyPrice : p\.monthlyPrice\)\}/,
  `{selectedPlanId === "professional" && billing === "monthly" ? "-" : formatRupiah(billing === "yearly" ? p.yearlyPrice : p.monthlyPrice)}`
);

newContent = newContent.replace(
  /\{formatRupiah\(billing === "yearly" \? p\.yearlyPrice : p\.monthlyPrice\)\}/g,
  `{selectedPlanId === "professional" && billing === "monthly" ? "-" : formatRupiah(billing === "yearly" ? p.yearlyPrice : p.monthlyPrice)}`
);

newContent = newContent.replace(
  /<div className="text-right">\s*<p className="text-sm font-bold text-neutral-900">\s*\{selectedPlanId === "professional" && billing === "monthly" \? "-" : formatRupiah\(billing === "yearly" \? p\.yearlyPrice : p\.monthlyPrice\)\}\s*<\/p>\s*<p className="text-xs text-neutral-500">\s*\{billing === "yearly" \? "\/tahun" : "\/bulan"\}\s*<\/p>\s*<\/div>/g,
  `<div className="text-right">
                      <p className="text-sm font-bold text-neutral-900">
                        {key === "professional" && billing === "monthly" ? "-" : formatRupiah(billing === "yearly" ? p.yearlyPrice : p.monthlyPrice)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {key === "professional" && billing === "monthly" ? "" : (billing === "yearly" ? "/tahun" : "/bulan")}
                      </p>
                    </div>`
);

fs.writeFileSync('src/app/register/register-client.tsx', newContent);
console.log('Updated successfully');

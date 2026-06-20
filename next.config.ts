import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // pdfkit membaca file font (.afm) lewat fs.readFileSync(__dirname + ...).
  // Jika di-bundle, __dirname di-hardcode ke path build-time yang tidak ada
  // di runtime (Docker /app), sehingga generate PDF error 500.
  // Externalize agar pakai require native & __dirname runtime yang benar.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;

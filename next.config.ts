import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Turbopack mendeteksi workspace root dari lockfile parent (/Users/salman/).
  // Pin root ke directory project supaya node_modules ter-resolve dengan benar.
  turbopack: {
    root: ".",
  },
  // pdfkit membaca file font (.afm) lewat fs.readFileSync(__dirname + ...).
  // Jika di-bundle, __dirname di-hardcode ke path build-time yang tidak ada
  // di runtime (Docker /app), sehingga generate PDF error 500.
  // Externalize agar pakai require native & __dirname runtime yang benar.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;

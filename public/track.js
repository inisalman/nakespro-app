/**
 * NakesPro — Visitor Tracking Script
 * Dipasang di semua website client NakesPro untuk analytics.
 * Dijalankan dengan atribut "defer".
 *
 * Data dikirim ke https://app.nakespro.id/api/track
 */
(function () {
  "use strict";

  // Auto-detect site ID dari hostname (subdomain.nakespro.id)
  // Fallback: data-site-id attribute pada script tag
  var hostname = window.location.hostname; // misal: "klinik-sehat.nakespro.id"
  var siteId =
    document.currentScript?.getAttribute("data-site-id") ||
    hostname.replace(/\.nakespro\.id$/, "").replace(/^www\./, "") ||
    "unknown";

  // Kumpulkan data dasar
  var payload = {
    site_id: siteId,
    url: window.location.href,
    referrer: document.referrer || null,
    title: document.title,
    screen: screen.width + "x" + screen.height,
    language: navigator.language,
    timestamp: new Date().toISOString(),
  };

  // Kirim via sendBeacon (non-blocking, reliable saat page unload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "https://app.nakespro.id/api/track",
      JSON.stringify(payload)
    );
  } else {
    // Fallback: Image beacon
    var img = new Image();
    img.src =
      "https://app.nakespro.id/api/track?d=" +
      encodeURIComponent(JSON.stringify(payload));
  }
})();

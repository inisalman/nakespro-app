/**
 * NakesPro — Visitor Tracking Script
 * Dipasang di semua website client NakesPro untuk analytics.
 * Dijalankan dengan atribut "defer".
 */
(function () {
  "use strict";

  // Konfigurasi
  const API_URL = "https://app.nakespro.id/api/track";
  const SITE_ID = document.currentScript?.getAttribute("data-site-id") || "unknown";

  // Kumpulkan data dasar
  const payload = {
    site_id: SITE_ID,
    url: window.location.href,
    referrer: document.referrer || null,
    title: document.title,
    screen: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timestamp: new Date().toISOString(),
  };

  // Kirim via sendBeacon (non-blocking, reliable saat page unload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon(API_URL, JSON.stringify(payload));
  } else {
    const img = new Image();
    img.src = `${API_URL}?d=${encodeURIComponent(JSON.stringify(payload))}`;
  }
})();

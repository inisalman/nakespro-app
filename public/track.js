// Beacon tracking NakesPro.
// Sisipkan di template client: <script src="https://app.nakespro.id/track.js" defer></script>
(function () {
  try {
    var host = window.location.hostname; // mis. "salman.nakespro.id"
    var parts = host.split(".");
    var subdomain = parts.length >= 2 ? parts[0] : null;
    if (!subdomain || subdomain === "www" || subdomain === "app") return;

    // Auto-detect endpoint: production vs local dev
    var isLocal = host.indexOf("localhost") !== -1 || host.indexOf("127.0.0.1") !== -1;
    var endpoint = isLocal
      ? "http://localhost:3000/api/track"
      : "https://app.nakespro.id/api/track";

    var payload = JSON.stringify({
      subdomain: subdomain,
      path: window.location.pathname,
      referrer: document.referrer || null,
    });

    // sendBeacon: ~64KB limit, no-cors ok, fire-and-forget
    if (navigator.sendBeacon) {
      var blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(endpoint, blob);
    } else {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(function () {});
    }
  } catch (e) {
    // Silent: jangan ganggu experience user
  }
})();

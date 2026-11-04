// Google reviews via Places API (New).
// Setup:
//  1. Google Cloud console → enable "Places API (New)" → create an API key.
//  2. Restrict the key: Application restriction = HTTP referrers (your domain),
//     API restriction = Places API (New) only.
//  3. Find each clinic's Place ID: https://developers.google.com/maps/documentation/places/web-service/place-id
//  4. Fill in the values below.
const REVIEWS_CONFIG = {
  apiKey: "",            // e.g. "AIza..."
  clinics: [
    { name: "Sainte-Thérèse", placeId: "" },
    { name: "Saint-Jérôme",   placeId: "" },
  ],
  maxReviews: 6,
  minStars: 1,           // keep at 1: showing only good reviews misleads patients
};

(async function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clinics = REVIEWS_CONFIG.clinics.filter((c) => c.placeId);
  if (!REVIEWS_CONFIG.apiKey || !clinics.length) return; // keep placeholders

  const fields = "id,displayName,rating,userRatingCount,reviews,googleMapsUri";
  let results;
  try {
    results = await Promise.all(clinics.map(async (c) => {
      const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(c.placeId)}?languageCode=fr`, {
        headers: { "X-Goog-Api-Key": REVIEWS_CONFIG.apiKey, "X-Goog-FieldMask": fields },
      });
      if (!r.ok) throw new Error(`Places API ${r.status}: ${await r.text()}`);
      return { clinic: c, place: await r.json() };
    }));
  } catch (e) { console.error(e); return; }

  // Combined rating, weighted by number of reviews
  let total = 0, weighted = 0;
  for (const { place } of results) {
    if (place.rating && place.userRatingCount) { total += place.userRatingCount; weighted += place.rating * place.userRatingCount; }
  }
  if (total) {
    $("rv-score").innerHTML = `<b>★ ${(weighted / total).toFixed(1).replace(".", ",")}</b><span>${total} avis Google · 2 cliniques</span>`;
  }

  const reviews = results.flatMap(({ clinic, place }) =>
    (place.reviews || []).map((r) => ({ ...r, clinic: clinic.name })))
    .filter((r) => (r.rating || 0) >= REVIEWS_CONFIG.minStars)
    .sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime))
    .slice(0, REVIEWS_CONFIG.maxReviews);

  if (reviews.length) {
    $("rv-list").innerHTML = reviews.map((r) => {
      const a = r.authorAttribution || {};
      const text = (r.text || r.originalText || {}).text || "";
      const short = text.length > 280 ? text.slice(0, 277) + "…" : text;
      return `<figure class="rv">
        <div class="stars" aria-label="${r.rating} sur 5">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
        <blockquote>${esc(short)}</blockquote>
        <figcaption class="rv-author">
          ${a.photoUri ? `<img src="${esc(a.photoUri)}" alt="" width="32" height="32" referrerpolicy="no-referrer">` : ""}
          <span><a href="${esc(a.uri)}" target="_blank" rel="noopener">${esc(a.displayName)}</a><br>
          <small>${esc(r.relativePublishTimeDescription)} · ${esc(r.clinic)}</small></span>
        </figcaption></figure>`;
    }).join("");
  }

  $("rv-note").innerHTML = 'Avis fournis par <b>Google</b>.';
  $("rv-actions").innerHTML = results.map(({ clinic, place }) =>
    `<a class="btn" target="_blank" rel="noopener" href="https://search.google.com/local/writereview?placeid=${encodeURIComponent(clinic.placeId)}">Laisser un avis · ${esc(clinic.name)}</a>
     <a class="btn ghost" target="_blank" rel="noopener" href="${esc(place.googleMapsUri)}">Tous les avis · ${esc(clinic.name)}</a>`).join("");
})();

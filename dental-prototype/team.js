// Dentist bios: click a card to open a profile window.
// Fictional demo bios.
const BIOS = {
  "Dr Vincent Gagnière": { clinic: "Sainte-Thérèse", role: "Fondateur · Implantologie",
    bio: "Fondateur du Centre Dentaire Virtua en 2001 à Sainte-Thérèse. Il s’intéresse particulièrement à l’implantologie et au remplacement durable des dents manquantes.",
    tags: ["Implantologie", "Fondateur — 2001"] },
  "Dre Caroline Chartrand": { clinic: "Sainte-Thérèse", role: "Dentiste généraliste",
    bio: "Membre de l’équipe de Sainte-Thérèse depuis 2016, elle offre des soins de dentisterie générale à toute la famille.",
    tags: ["Dentisterie générale", "Depuis 2016"] },
  "Dr René Boulanger": { clinic: "Sainte-Thérèse", role: "Dentiste généraliste",
    bio: "Dentiste à la clinique de Sainte-Thérèse.", tags: ["Dentisterie générale"] },
  "Dre Laurence Cadotte": { clinic: "Sainte-Thérèse", role: "Dentiste généraliste",
    bio: "Elle a complété une résidence multidisciplinaire avant de se joindre à l’équipe de Sainte-Thérèse.",
    tags: ["Résidence hospitalière"] },
  "Dr André Beauchemin": { clinic: "Saint-Jérôme", role: "Chirurgie et esthétique",
    bio: "Dentiste à Saint-Jérôme, il s’intéresse particulièrement à la chirurgie et à la dentisterie esthétique.",
    tags: ["Chirurgie", "Esthétique"] },
  "Dre Jessica Grenier": { clinic: "Saint-Jérôme", role: "Dentiste généraliste",
    bio: "Membre de l’équipe de Saint-Jérôme depuis 2023.", tags: ["Dentisterie générale", "Depuis 2023"] },
};

(function () {
  const base = document.querySelector('link[href$="styles.css"]').getAttribute("href").replace("styles.css", "");
  const dlg = document.createElement("dialog");
  dlg.className = "bio";
  document.body.appendChild(dlg);
  dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest("[data-close]")) dlg.close(); });

  function open(name) {
    const b = BIOS[name]; if (!b) return;
    const slug = b.clinic === "Saint-Jérôme" ? "saint-jerome" : "sainte-therese";
    dlg.innerHTML = `<div class="bio-in">
      <button class="bio-x" data-close aria-label="Fermer">×</button>
      <div class="bio-top"><div class="pic">${name.split(" ").pop()[0]}</div>
        <div><h3>${name}</h3><p>${b.role}</p><p class="note">Clinique de ${b.clinic}</p></div></div>
      <p>${b.bio}</p>
      <div class="bio-tags">${b.tags.map((t) => `<span>${t}</span>`).join("")}</div>
      <div class="bio-cta"><a class="btn" href="${base}index.html#rdv">Prendre rendez-vous</a>
        <a class="btn ghost" href="${base}cliniques/${slug}.html">Voir la clinique</a></div>
      <p class="note">Texte de démonstration — à valider par le dentiste.</p></div>`;
    dlg.showModal();
  }

  function bind(root) {
    root.querySelectorAll(".doc").forEach((d) => {
      if (d.dataset.bound) return;
      const name = d.querySelector("h3")?.textContent.trim();
      if (!BIOS[name]) return;
      d.dataset.bound = 1;
      d.tabIndex = 0; d.setAttribute("role", "button");
      d.setAttribute("aria-label", `Voir le profil de ${name}`);
      d.insertAdjacentHTML("beforeend", '<span class="more">Voir le profil →</span>');
      d.addEventListener("click", () => open(name));
      d.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(name); } });
    });
  }
  bind(document);
  // homepage re-renders the team when switching clinic tabs
  const team = document.getElementById("team");
  if (team) new MutationObserver(() => bind(team)).observe(team, { childList: true });
})();

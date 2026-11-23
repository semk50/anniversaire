class Navigation {
    constructor() {
        this.sections = {
            journal: document.querySelector(".affiche-tout"),
            taches: document.querySelector(".affiche-tache"),
            planing: document.querySelector(".affiche-planing"),
            reglage: document.querySelector(".affiche-reglage")
        };
        this.boutons = document.querySelectorAll(".container-btn button");
        this.boutons.forEach((bouton) => {
            bouton.addEventListener("click", () => this.afficher(bouton));
        });
        this.afficher(document.querySelector(".btn-taches"));
    }

    afficher(bouton) {
        Object.values(this.sections).forEach((section) => {
            section.style.display = "none";
        });
        this.boutons.forEach((item) => item.classList.remove("active"));
        bouton.classList.add("active");

        if (bouton.classList.contains("btn-journal")) this.sections.journal.style.display = "block";
        if (bouton.classList.contains("btn-taches")) this.sections.taches.style.display = "block";
        if (bouton.classList.contains("btn-planing")) this.sections.planing.style.display = "block";
        if (bouton.classList.contains("btn-reglage")) this.sections.reglage.style.display = "block";
    }
}

class Journal {
    constructor() {
        this.texte = document.querySelector(".champ-journal");
        this.bouton = document.querySelector(".btn-ajout-journal");
        this.liste = document.querySelector(".liste-journal");
        this.entries = JSON.parse(localStorage.getItem("journal") || "[]");
        this.bouton.addEventListener("click", () => this.ajouter());
        this.afficher();
    }

    ajouter() {
        const contenu = this.texte.value.trim();
        if (!contenu) return;
        this.entries.unshift({
            contenu,
            date: new Date().toLocaleString("fr-FR")
        });
        this.sauvegarder();
        this.texte.value = "";
        this.afficher();
    }

    supprimer(index) {
        if (!window.confirm("Supprimer cette entrée du journal ?")) return;
        this.entries.splice(index, 1);
        this.sauvegarder();
        this.afficher();
    }

    afficher() {
        this.liste.innerHTML = "";
        this.entries.forEach((entry, index) => {
            const element = document.createElement("div");
            element.className = "journal-item";
            element.innerHTML = `
                <div class="journal-entete">
                    <small></small>
                    <button class="btn-supprimer-journal" type="button" aria-label="Supprimer cette entrée" title="Supprimer">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></svg>
                    </button>
                </div>
                <p></p>
            `;
            element.querySelector("small").textContent = entry.date;
            element.querySelector("p").textContent = entry.contenu;
            element.querySelector("button").addEventListener("click", () => this.supprimer(index));
            this.liste.appendChild(element);
        });
    }

    sauvegarder() {
        localStorage.setItem("journal", JSON.stringify(this.entries));
    }
}

class Taches {
    constructor() {
        this.champ = document.querySelector(".champ-ajout");
        this.date = document.querySelector(".date-tache");
        this.heure = document.querySelector(".heure-tache");
        this.bouton = document.querySelector(".btn-ajout-taches");
        this.liste = document.querySelector(".check-list");
        this.aFaireElement = document.querySelector("#nombre-a-faire");
        this.termineElement = document.querySelector("#nombre-termine");
        this.progressionElement = document.querySelector("#nombre-progression");
        this.taches = JSON.parse(localStorage.getItem("taches") || "[]");
        this.taches.forEach((tache) => {
            if (!tache.id) tache.id = creerId("tache");
            if (tache.rappelEnvoye === undefined) tache.rappelEnvoye = false;
        });
        this.sauvegarder();
        [this.date, this.heure].forEach((champ) => {
            champ.addEventListener("input", () => champ.setCustomValidity(""));
        });
        this.bouton.addEventListener("click", () => this.ajouter());
        this.champ.addEventListener("keydown", (event) => {
            if (event.key === "Enter") this.ajouter();
        });
        this.afficher();
    }

    ajouter() {
        const texte = this.champ.value.trim();
        if (!texte) return;
        if (Boolean(this.date.value) !== Boolean(this.heure.value)) {
            (this.date.value ? this.heure : this.date).setCustomValidity("Renseigne la date et l’heure du rappel.");
            (this.date.value ? this.heure : this.date).reportValidity();
            return;
        }

        if (this.date.value && this.heure.value) {
            const rappel = new Date(`${this.date.value}T${this.heure.value}`);
            if (rappel <= new Date()) {
                this.heure.setCustomValidity("Choisis une heure future pour le rappel.");
                this.heure.reportValidity();
                return;
            }
        }

        this.date.setCustomValidity("");
        this.heure.setCustomValidity("");
        this.taches.push({
            id: creerId("tache"),
            texte,
            terminee: false,
            date: this.date.value,
            heure: this.heure.value,
            rappelEnvoye: false
        });
        this.champ.value = "";
        this.date.value = "";
        this.heure.value = "";
        this.sauvegarder();
        this.afficher();
    }

    supprimer(index) {
        this.taches.splice(index, 1);
        this.sauvegarder();
        this.afficher();
    }

    changerStatut(index, terminee) {
        this.taches[index].terminee = terminee;
        this.sauvegarder();
        this.afficher();
    }

    afficher() {
        this.liste.innerHTML = "";
        this.taches.forEach((tache, index) => {
            const element = document.createElement("div");
            element.className = `tache-item${tache.terminee ? " terminee" : ""}`;
            element.innerHTML = `
                <label>
                    <input type="checkbox" ${tache.terminee ? "checked" : ""}>
                    <span></span>
                </label>
                <button class="btn-supprimer-tache" aria-label="Supprimer">x</button>
            `;
            element.querySelector("span").textContent = tache.texte;
            if (tache.date && tache.heure) {
                const rappel = document.createElement("small");
                rappel.className = "tache-rappel";
                rappel.textContent = `Rappel : ${new Date(`${tache.date}T${tache.heure}`).toLocaleString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit"
                })}`;
                element.insertBefore(rappel, element.querySelector("button"));
            }
            element.querySelector("input").addEventListener("change", (event) => {
                this.changerStatut(index, event.target.checked);
            });
            element.querySelector("button").addEventListener("click", () => this.supprimer(index));
            this.liste.appendChild(element);
        });

        const termine = this.taches.filter((tache) => tache.terminee).length;
        const total = this.taches.length;
        const progression = total === 0 ? 0 : Math.round((termine / total) * 100);
        this.aFaireElement.textContent = total - termine;
        this.termineElement.textContent = termine;
        this.progressionElement.textContent = `${progression}%`;
    }

    sauvegarder() {
        localStorage.setItem("taches", JSON.stringify(this.taches));
    }
}

class Planing {
    constructor() {
        this.boutonCreer = document.querySelector(".btn-creer-planing");
        this.conteneur = document.querySelector(".ajout-planing-container");
        this.texte = document.querySelector(".champ-texte-planing");
        this.heure = document.querySelector(".time-planing");
        this.date = document.querySelector(".date-planing");
        this.boutonAjouter = document.querySelector(".btn-ajout-planing");
        this.affichage = document.querySelector(".affiche-planing-case");
        this.programmes = JSON.parse(localStorage.getItem("programmes") || "[]");
        this.programmes.forEach((programme) => {
            if (!programme.id) programme.id = creerId("programme");
            if (programme.rappelEnvoye === undefined) programme.rappelEnvoye = false;
        });
        this.sauvegarder();
        [this.date, this.heure].forEach((champ) => {
            champ.addEventListener("input", () => champ.setCustomValidity(""));
        });
        this.boutonCreer.addEventListener("click", () => {
            this.conteneur.style.display = this.conteneur.style.display === "flex" ? "none" : "flex";
        });
        this.boutonAjouter.addEventListener("click", () => this.ajouter());
        this.afficher();
    }

    ajouter() {
        const texte = this.texte.value.trim();
        if (!texte) return;
        if (Boolean(this.date.value) !== Boolean(this.heure.value)) {
            (this.date.value ? this.heure : this.date).setCustomValidity("Renseigne la date et l’heure du programme.");
            (this.date.value ? this.heure : this.date).reportValidity();
            return;
        }
        if (this.date.value && new Date(`${this.date.value}T${this.heure.value}`) <= new Date()) {
            this.heure.setCustomValidity("Choisis une heure future pour le programme.");
            this.heure.reportValidity();
            return;
        }
        this.date.setCustomValidity("");
        this.heure.setCustomValidity("");
        this.programmes.push({
            id: creerId("programme"),
            texte,
            heure: this.heure.value,
            date: this.date.value,
            rappelEnvoye: false
        });
        this.texte.value = "";
        this.heure.value = "";
        this.date.value = "";
        this.conteneur.style.display = "none";
        this.sauvegarder();
        this.afficher();
    }

    supprimer(index) {
        this.programmes.splice(index, 1);
        this.sauvegarder();
        this.afficher();
    }

    afficher() {
        this.affichage.innerHTML = "";
        this.affichage.style.flexDirection = "column";
        this.programmes.forEach((programme, index) => {
            const element = document.createElement("div");
            element.className = "programme-item";
            element.innerHTML = `<button class="btn-supprimer-programme" aria-label="Supprimer">x</button>`;
            const details = document.createElement("div");
            details.textContent = `${programme.texte}${programme.date ? ` - ${programme.date}` : ""}${programme.heure ? ` a ${programme.heure}` : ""}`;
            element.appendChild(details);
            element.querySelector("button").addEventListener("click", () => this.supprimer(index));
            this.affichage.appendChild(element);
        });
    }

    sauvegarder() {
        localStorage.setItem("programmes", JSON.stringify(this.programmes));
    }
}

function creerId(prefixe) {
    return `${prefixe}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

class Rappels {
    constructor(taches, planing) {
        this.taches = taches;
        this.planing = planing;
        this.boutons = document.querySelectorAll(".btn-notifications");
        this.etats = document.querySelectorAll(".etat-notifications");
        this.interrupteur = document.querySelector("#rappels-actifs");
        this.actif = localStorage.getItem("rappelsActifs") !== "false";
        this.verificationEnCours = false;
        if (this.interrupteur) this.interrupteur.checked = this.actif;
        this.boutons.forEach((bouton) => bouton.addEventListener("click", () => this.activer()));
        this.actualiserEtat();
        this.verifier();
        window.setInterval(() => this.verifier(), 15000);
        window.addEventListener("focus", () => this.verifier());
    }

    async activer() {
        this.actif = true;
        localStorage.setItem("rappelsActifs", "true");
        if (this.interrupteur) this.interrupteur.checked = true;
        if (!("Notification" in window)) {
            this.afficherEtat("Les notifications ne sont pas prises en charge par ce navigateur.");
            return;
        }
        if (!window.isSecureContext) {
            this.afficherEtat("Ouvre l’application en HTTPS ou sur localhost pour activer les notifications.");
            return;
        }
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        const installee = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
        if (ios && !installee) {
            this.afficherEtat("Sur iPhone, ajoute d’abord l’application à l’écran d’accueil pour activer les notifications.");
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            this.actualiserEtat();
            if (permission === "granted") this.verifier();
        } catch (error) {
            this.afficherEtat(`Impossible de demander l’autorisation : ${error.message}`);
        }
    }

    actualiserEtat() {
        if (!("Notification" in window)) {
            this.afficherEtat("Les notifications ne sont pas prises en charge par ce navigateur.");
            this.boutons.forEach((bouton) => { bouton.disabled = true; });
        } else if (Notification.permission === "granted") {
            this.afficherEtat(this.actif ? "Les rappels sont activés." : "Les rappels sont désactivés.");
            this.boutons.forEach((bouton) => {
                bouton.textContent = this.actif ? "Notifications activées" : "Réactiver les notifications";
                bouton.disabled = this.actif;
            });
        } else if (Notification.permission === "denied") {
            this.afficherEtat("Notifications bloquées. Autorise-les dans les réglages du navigateur.");
            this.boutons.forEach((bouton) => { bouton.disabled = true; });
        } else {
            this.afficherEtat("Autorise les notifications pour recevoir tes rappels.");
            this.boutons.forEach((bouton) => {
                bouton.textContent = "Autoriser les notifications";
                bouton.disabled = false;
            });
        }
    }

    afficherEtat(message) {
        this.etats.forEach((etat) => { etat.textContent = message; });
    }

    changerActivation(actif) {
        this.actif = actif;
        localStorage.setItem("rappelsActifs", String(actif));
        this.actualiserEtat();
        if (actif) this.verifier();
    }

    async verifier() {
        if (!this.actif || !("Notification" in window) || Notification.permission !== "granted" ||
            !("serviceWorker" in navigator) || this.verificationEnCours) return;

        this.verificationEnCours = true;
        try {
            const registration = await navigator.serviceWorker.ready;
            await this.verifierListe(registration, this.taches.taches, "tache", (item) => !item.terminee);
            await this.verifierListe(registration, this.planing.programmes, "programme", () => true);
        } catch (error) {
            this.afficherEtat(`Impossible de vérifier les rappels : ${error.message}`);
        } finally {
            this.verificationEnCours = false;
        }
    }

    async verifierListe(registration, elements, type, estActif) {
        const maintenant = new Date();
        for (const element of elements) {
            if (element.rappelEnvoye || !element.date || !element.heure || !estActif(element)) continue;
            const dateRappel = new Date(`${element.date}T${element.heure}`);
            if (Number.isNaN(dateRappel.getTime()) || dateRappel > maintenant) continue;

            element.rappelEnvoye = true;
            if (type === "tache") this.taches.sauvegarder();
            else this.planing.sauvegarder();
            try {
                await registration.showNotification(type === "tache" ? "Rappel de tâche" : "Rappel de programme", {
                    body: element.texte,
                    tag: element.id,
                    icon: "./icon-192.png",
                    badge: "./icon-192.png",
                    data: { url: "./index.html" }
                });
            } catch (error) {
                element.rappelEnvoye = false;
                if (type === "tache") this.taches.sauvegarder();
                else this.planing.sauvegarder();
                this.afficherEtat(`Impossible d’afficher le rappel : ${error.message}`);
            }
        }
    }
}

class Reglage {
    constructor(rappels, taches) {
        this.rappels = rappels;
        this.taches = taches;
        this.theme = document.querySelector("#theme-sombre");
        this.rappelsActifs = document.querySelector("#rappels-actifs");
        this.effacerTerminees = document.querySelector(".btn-effacer-terminees");
        this.effacer = document.querySelector(".btn-effacer-donnees");
        this.theme.checked = localStorage.getItem("theme") !== "clair";
        document.body.classList.toggle("mode-clair", !this.theme.checked);
        this.theme.addEventListener("change", () => this.changerTheme());
        this.rappelsActifs.addEventListener("change", () => {
            if (this.rappelsActifs.checked) this.rappels.activer();
            else this.rappels.changerActivation(false);
        });
        this.effacerTerminees.addEventListener("click", () => this.supprimerTerminees());
        this.effacer.addEventListener("click", () => this.effacerDonnees());
    }

    changerTheme() {
        const sombre = this.theme.checked;
        document.body.classList.toggle("mode-clair", !sombre);
        localStorage.setItem("theme", sombre ? "sombre" : "clair");
    }

    effacerDonnees() {
        if (!window.confirm("Effacer toutes les tâches, les programmes et le journal ?")) return;
        localStorage.removeItem("taches");
        localStorage.removeItem("programmes");
        localStorage.removeItem("journal");
        window.location.reload();
    }

    supprimerTerminees() {
        const terminees = this.taches.taches.filter((tache) => tache.terminee).length;
        if (!terminees) {
            window.alert("Il n’y a aucune tâche terminée à supprimer.");
            return;
        }
        if (!window.confirm(`Supprimer ${terminees} tâche(s) terminée(s) ?`)) return;
        this.taches.taches = this.taches.taches.filter((tache) => !tache.terminee);
        this.taches.sauvegarder();
        this.taches.afficher();
    }
}

class Utilisateur {
    constructor() {
        this.nom = localStorage.getItem("nomUtilisateur") || "";
        this.champReglage = document.querySelector("#nom-utilisateur-reglage");
        this.dialog = document.querySelector("#dialog-nom");
        this.formulaire = document.querySelector("#form-nom");
        this.champInitial = document.querySelector("#nom-utilisateur");
        this.toast = document.querySelector("#toast-coucou");
        this.timeoutToast = null;
        this.champReglage.value = this.nom;
        this.formulaire.addEventListener("submit", (event) => {
            event.preventDefault();
            this.enregistrer(this.champInitial.value);
        });
        this.champReglage.addEventListener("change", () => {
            if (this.champReglage.value.trim()) this.enregistrer(this.champReglage.value);
            else this.champReglage.value = this.nom;
        });
        document.querySelector("#btn-coucou").addEventListener("click", () => this.faireCoucou());
        this.actualiser();
        if (!this.nom) this.ouvrirDialogue();
    }

    ouvrirDialogue() {
        if (typeof this.dialog.showModal === "function") this.dialog.showModal();
        else this.dialog.setAttribute("open", "");
    }

    enregistrer(nom) {
        const valeur = nom.trim();
        if (!valeur) {
            this.champInitial.setCustomValidity("Saisis un nom d’utilisateur.");
            this.champInitial.reportValidity();
            return;
        }
        this.champInitial.setCustomValidity("");
        this.nom = valeur.slice(0, 24);
        localStorage.setItem("nomUtilisateur", this.nom);
        this.champInitial.value = this.nom;
        this.champReglage.value = this.nom;
        this.actualiser();
        if (typeof this.dialog.close === "function") this.dialog.close();
        else this.dialog.removeAttribute("open");
    }

    actualiser() {
        document.querySelector("#salutation-utilisateur").textContent = this.nom ? `Bonjour, ${this.nom}` : "";
    }

    faireCoucou() {
        if (!this.nom) {
            this.ouvrirDialogue();
            return;
        }
        this.toast.textContent = `Coucou, ${this.nom} !`;
        this.toast.classList.add("visible");
        window.clearTimeout(this.timeoutToast);
        this.timeoutToast = window.setTimeout(() => this.toast.classList.remove("visible"), 2800);
    }
}

class Installation {
    constructor() {
        this.bouton = document.querySelector("#btn-installer");
        this.etat = document.querySelector("#etat-installation");
        this.invitation = null;
        this.installee = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
        this.bouton.disabled = this.installee;
        if (this.installee) this.etat.textContent = "L’application est déjà installée.";

        window.addEventListener("beforeinstallprompt", (event) => {
            event.preventDefault();
            this.invitation = event;
            this.etat.textContent = "L’application peut être installée sur cet appareil.";
        });
        window.addEventListener("appinstalled", () => {
            this.invitation = null;
            this.installee = true;
            this.bouton.disabled = true;
            this.etat.textContent = "L’application a été installée.";
        });
        this.bouton.addEventListener("click", () => this.installer());
    }

    async installer() {
        if (this.installee) return;
        if (!this.invitation) {
            const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            this.etat.textContent = ios
                ? "Sur iPhone ou iPad : touche Partager, puis « Sur l’écran d’accueil »."
                : "Dans le menu du navigateur, choisis « Installer l’application » ou « Ajouter à l’écran d’accueil ».";
            return;
        }

        const invitation = this.invitation;
        this.invitation = null;
        try {
            await invitation.prompt();
            const choix = await invitation.userChoice;
            this.etat.textContent = choix.outcome === "accepted"
                ? "Installation lancée."
                : "Installation annulée. Tu peux réessayer quand tu veux.";
        } catch (error) {
            this.etat.textContent = `Impossible de lancer l’installation : ${error.message}`;
        }
    }
}

const dateActuelle = document.querySelector("#date-actuelle");
dateActuelle.textContent = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
});

const navigation = new Navigation();
const journal = new Journal();
const taches = new Taches();
const planing = new Planing();
const rappels = new Rappels(taches, planing);
const reglage = new Reglage(rappels, taches);
const utilisateur = new Utilisateur();
const installation = new Installation();

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        if (!window.isSecureContext) {
            console.warn("Le service worker nécessite HTTPS ou localhost.");
            return;
        }
        navigator.serviceWorker.register("./ServiceWorker.js")
            .catch((error) => console.error("Échec de l’enregistrement du service worker :", error));
    });
}

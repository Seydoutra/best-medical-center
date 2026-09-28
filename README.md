# Best Medical Center — refonte web

Portail médical multipage, responsive et sans dépendances pour Best Medical Center.

## Pages incluses

- Accueil et prise de rendez-vous
- Présentation du centre et de ses espaces
- Catalogue des soins avec simulation de réservation
- Fiches détaillées pour chaque service : indications, prestations, parcours, préparation et FAQ
- Laboratoire avec recherche d’analyses
- Annuaire des médecins et parcours professionnels de démonstration
- Partenaires et simulateur de couverture assurance
- Espace patient interactif : agenda, documents, ordonnances et messagerie
- Téléconsultation programmée ou urgente avec brief préalable, calendrier de disponibilités, confirmation persistante et accès le jour J
- Bibliothèque de conseils santé avec recherche, catégories et articles pédagogiques
- Tableau de bord d’administration : supervision des téléconsultations, SMS, rappels automatisés, comptabilité et performance

## Lancer localement

```bash
python3 -m http.server 4173
```

Puis ouvrir `http://localhost:4173`.

Le tableau de bord administrateur est disponible sur `http://localhost:4173/admin.html`. Toutes les identités et données affichées sont fictives.

## Brancher l’API de téléconsultation

Dans `pages.js`, renseigner `VIDEO_API.baseUrl` et fournir un `tokenProvider`. Le connecteur crée alors une salle distante via `POST /v1/teleconsultations`. Sans URL d’API, les deux parcours restent en mode démonstration. `app.js` conserve également le connecteur WebRTC de la page d’accueil.

Dans `admin.js`, renseigner `ADMIN_API.baseUrl` et son `tokenProvider` pour connecter les routes de téléconsultations, messages, factures et indicateurs. Sans configuration, le tableau de bord fonctionne intégralement avec des données locales de démonstration.

## Publication GitHub Pages

Le projet ne nécessite aucune compilation. Dans les paramètres du dépôt, activer Pages depuis la branche `main` et le dossier racine.

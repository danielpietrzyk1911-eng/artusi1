# L'Artusi — site web (prêt pour Vercel)

Site statique (HTML/CSS/JS, aucune dépendance, aucun build). Ce dossier contient
**uniquement** ce qui est nécessaire à la mise en ligne.

## Contenu
```
index.html            page unique
css/styles.css        styles
js/script.js          nav, onglets menu, révélation au scroll, hero pizza
js/intro.js           intro animée (mots + shader WebGL vert) + carrousel
images/real/          6 photos (hero, chef, plats signatures)
images/gallery/       10 plats du carrousel
vercel.json           en-têtes de cache
```
Tout le reste (Google Fonts, carte Google Maps, réservation TheFork) est chargé
en ligne — rien à héberger en plus.

## Mettre en ligne (3 options)

### Option 1 — Le plus simple : demande-moi de le déployer
Je peux le publier directement et te renvoyer l'URL (ex. `l-artusi.vercel.app`).

### Option 2 — Vercel CLI
Nécessite Node.js installé :
```bash
npm i -g vercel
cd lartusi-vercel
vercel        # suis les invites, puis `vercel --prod` pour la prod
```

### Option 3 — Via GitHub (sans rien installer)
1. Crée un dépôt GitHub et dépose-y le **contenu de ce dossier**.
2. Sur [vercel.com/new](https://vercel.com/new), importe le dépôt.
3. Framework Preset : **Other** · Build Command : *(vide)* · Output Directory : *(vide / racine)*.
4. Deploy. Vercel sert `index.html` automatiquement.

## Après la mise en ligne
- Tu pourras brancher un nom de domaine (ex. `lartusi-saintmaur.fr`) dans Vercel → Settings → Domains.
- Le téléphone (01 48 76 98 16), la carte et le lien TheFork sont déjà les vrais.

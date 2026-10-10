---
name: motion-video
description: Anime en vidéo de 5 secondes les vraies photos d'un site de restaurant ou commerce local via Fal ai (image-to-video Kling / Seedance) — choix des images animables, rédaction des prompts, estimation du coût, génération, puis optimisation web ffmpeg (MP4/WebM/version mobile/poster) et intégration en hero. Utiliser quand on demande d'animer une photo, une vidéo de fond, une vidéo hero, des prompts vidéo Fal, ou une « image animée » pour un site.
---

# Photos animées (5 s) pour sites de prospects

Pas de Reels, pas de pub : ce skill sert uniquement à animer des photos **du site** pour
le site lui-même. Attendre que l'utilisateur indique **quel restaurant** et **quelles
images**. Ne jamais choisir les photos seul ni lancer une génération payante sans accord.

## Règles non négociables

1. **Vraies photos uniquement.** On anime ce qui existe ; on n'invente ni plat, ni salle,
   ni personne (tromperie sur la marchandise).
2. **Mouvement subtil et crédible** : vapeur, flamme, reflet, feuilles, bougie. Caméra
   fixe ou très lente. Le plat ne doit jamais se déformer.
3. **Un seul plan vidéo par page** (le hero). Ailleurs : images fixes ou micro-animations
   CSS (voir skill `magic-ui`, section static sites).
4. **Poids max** : desktop ≤ 3 Mo, mobile ≤ 1,2 Mo, poster ≤ 150 Ko.
5. **Toujours un poster** ; `prefers-reduced-motion` et économie de données → poster fixe.
6. **Fal uniquement après accord** sur le prompt ET le coût (`estimate_cost`).

## Étape 1 — Choisir et lire les images

Pour chaque image fournie (fichier du dépôt, ex. `images/real/…`, ou URL) :
- la regarder (outil Read sur le fichier) ;
- noter ce qui peut bouger de façon réaliste et ce qui doit rester immobile ;
- écarter les images floues, < 1280 px de large, avec texte incrusté ou personnes
  reconnaissables (droit à l'image) — le signaler à l'utilisateur.

## Étape 2 — Rédiger le prompt

Partir d'un modèle de `prompts/fal-prompts.md`, l'adapter à l'image, et présenter à
l'utilisateur pour chaque image : **prompt**, **negative prompt**, **modèle**, **format**
(16:9 hero desktop ; 9:16 si version mobile dédiée), **durée 5 s**, **coût estimé**.

Structure d'un prompt : `[ce qui bouge] + [comment, lentement] + [caméra] + [lumière/ambiance] + [boucle]`.
Rester en anglais (meilleure fiabilité des modèles vidéo), 1 à 3 phrases, pas de jargon.

## Étape 3 — Générer avec Fal ai (après accord)

1. `search_models` / `recommend_model` pour l'image-to-video (Kling ou Seedance, version
   la plus récente disponible) ; `get_model_schema` pour les paramètres exacts.
2. `estimate_cost`, puis `upload_file` de l'image source, puis `submit_job`.
3. `wait_for_jobs`, récupérer la vidéo, la télécharger dans `assets/video/raw/`
   (hors déploiement si possible).
4. Vérifier : pas de déformation, mouvement lent, boucle acceptable. Sinon ajuster le
   prompt (plus court, mouvement plus petit) et regénérer — avec accord si coût en plus.

## Étape 4 — Optimiser pour le web

```bash
bash scripts/prepare-hero.sh <video_brute.mp4> <dossier_site>/assets/video [nom=hero]
```
Produit `nom.mp4`, `nom.webm`, `nom-mobile.mp4`, `nom-poster.jpg`, `nom-poster.webp` et
signale tout dépassement de poids.

## Étape 5 — Intégrer

- Hero en boucle : `snippets/hero-video.html` (poster immédiat, vidéo chargée après,
  version mobile, pause hors écran, rien si reduced-motion). Adapter les chemins et
  reprendre les variables CSS du site.
- Vidéo pilotée par le scroll : ne pas réinventer, suivre le skill `10k-websites`
  (`references/scrub-pipeline.md`).

## Articulation avec les autres skills

- Direction artistique : `impeccable` / `design-taste-frontend` décident du ton ; le
  mouvement de la vidéo doit coller à ce ton (calme pour un bistrot, chaleureux pour une
  boulangerie).
- Effets d'interface : `magic-ui` — aucun fond animé par-dessus une vidéo hero.
- Décisions de mouvement : `animate` / `emil-design-eng`.
- Second brain (Obsidian, dossier Drive « Second bain ») : avant de commencer, chercher
  une note du restaurant (contexte, photos validées, préférences) ; à la fin, proposer
  d'y ajouter une note récapitulative (voir modèle ci-dessous).

## Livrables à annoncer

Chemins + poids de chaque fichier, prompt final utilisé par image, modèle, coût Fal
consommé, et ce qui n'a pas été vérifié.

### Modèle de note second brain
```markdown
---
type: animation-video
restaurant: <nom>
date: <AAAA-MM-JJ>
tags: [prospect, video, fal]
---
# Animation hero — <nom>
- Image source : <chemin>
- Modèle Fal : <modèle> · coût : <x €>
- Prompt : <prompt>
- Negative : <negative>
- Fichiers : <liste + poids>
- Retours / à refaire : <…>
Liens : [[<nom du restaurant>]] [[Skills/motion-video]]
```

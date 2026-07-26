# Résumé du Portfolio Photographie

## Aperçu du projet

Site portfolio pour photographes professionnels (LOÏC Photography / Mampii Photography). Design minimaliste et éditorial avec typographie forte, animations GSAP, loader animé en rideau à lamelles, navigation fixe avec effet de scroll, grille de portfolio en 12 colonnes, et support du mode sombre/clair.

## Thème & style

- **Typographie** : 'Archivo Narrow' (titres) + 'Source Sans 3' / 'Inter' (corps)
- **Palette** : noir `#0a0a0a` / blanc `#ffffff`, gris neutres, contour `#cfc4c5`
- **Espacement** : conteneur max `1280px` / `1440px`, gouttière `24px`, sections `96px` de padding
- **Animations** : GSAP + ScrollTrigger (reveal au scroll, hover scale, loader rideau)
- **Mode sombre** : basculable via `[data-theme="dark"]` sur `s.html`
- **Style photo** : plein écran (`background-size: cover`), centré (`background-position: center`), overlay sombre pour lisibilité du texte

## Dimensions et formats des photos par section

### 1. Hero (plein écran)
- **Dimensions natives recommandées** : `1920 x 1080 px` (ratio 16:9) minimum
- **Affichage CSS** : `width: 100%`, `height: 100vh` / `100%`, `object-fit: cover` ou `background-size: cover`
- **Orientation** : paysage obligatoire
- **Fichiers** : `s.html:1576`, `v.html:1221`, `mampii.html:733`, `accueil.html:1144`, `loader.html:182`

### 2. Portfolio Grid
- **Grille** : 12 colonnes, hauteur fixe `800px`, gap `24px`
- **Colonne gauche / droite (col-span-4)** : `width = 4/12 = 33.33%`, hauteur `800px`
- **Colonne milieu (col-span-4)** : contient 2 empilés (`.flex-col`), chaque item `height: 50%` → `400px` de hauteur
- **Ratio effectif** : libre (cover), mais visé `3:4` ou `4:5` pour les items simples, `16:9` pour les colonnes larges
- **Dimensions natives recommandées** :
  - Items larges : `1600 x 900 px` (16:9)
  - Items moyens empilés : `1600 x 2000 px` (4:5) ou `1500 x 2000 px` (3:4)
- **Fichiers** : `s.html:1596-1638`, `v.html:1241-1283`, `mampii.html:752-798`

### 3. About (grille 2x2)
- **Dimensions natives recommandées** : `800 x 800 px` (ratio 1:1 carré)
- **Affichage CSS** : `aspect-ratio: 1`, `background-size: cover`
- **Gap** : `16px` entre les images
- **Fichiers** : `s.html:1652-1661`, `v.html:1296-1308`, `mampii.html:812-824`

### 4. Passion (bannière plein écran)
- **Dimensions natives recommandées** : `1920 x 1080 px` (16:9)
- **Affichage CSS** : `min-height: 600px`, `background-size: cover`
- **Overlay** : `.dark` → opacité `0.6`, `.white` → opacité `0.1`
- **Fichiers** : `s.html` (passion section), `v.html:1326-1347`, `mampii.html:842-863`

### 5. Stats / Cards (accueil.html)
- **Dimensions natives recommandées** : `600 x 800 px` (ratio 3:4)
- **Affichage CSS** : `height: 480px`, `object-fit: cover`
- **Fichier** : `accueil.html:1216-1241`

### 6. Blog (accueil.html)
- **Dimensions natives recommandées** : `600 x 600 px` (ratio 1:1)
- **Affichage CSS** : `aspect-ratio: 1`, `object-fit: cover`
- **Fichier** : `accueil.html:1260-1300`

### 7. Contact Background (accueil.html)
- **Dimensions natives recommandées** : `1600 x 900 px` (16:9)
- **Affichage CSS** : `width: 100%`, `height: 100%`, `object-fit: cover`, `opacity: 0.1`
- **Fichier** : `accueil.html:1331-1333`

### 8. Floating Card (accueil.html)
- **Dimensions natives recommandées** : `400 x 267 px` (ratio 3:2)
- **Affichage CSS** : `width: 192px`, `height: 128px`, `object-fit: cover`
- **Fichier** : `accueil.html:1180-1184`

### 9. Loader Background
- **Dimensions natives recommandées** : `1920 x 1080 px` (16:9)
- **Affichage CSS** : `width: 100%`, `height: 100%`, `object-fit: cover`
- **Fichier** : `loader.html:182`

## Récapitulatif des ratios par usage

| Section | Ratio recommandé | Dimensions natives (px) | Hauteur CSS |
|---------|------------------|------------------------|-------------|
| Hero | 16:9 | 1920 x 1080 | 100vh |
| Portfolio (large) | 16:9 | 1600 x 900 | 800px |
| Portfolio (stacked) | 3:4 / 4:5 | 1500 x 2000 | 400px chacun |
| About | 1:1 | 800 x 800 | aspect-ratio |
| Passion | 16:9 | 1920 x 1080 | min 600px |
| Stats | 3:4 | 600 x 800 | 480px |
| Blog | 1:1 | 600 x 600 | aspect-ratio |
| Contact BG | 16:9 | 1600 x 900 | 100% section |
| Floating Card | 3:2 | 400 x 267 | 192x128 |
| Loader | 16:9 | 1920 x 1080 | 100vh |

## Consignes d'ajout de photos

1. **Format** : JPEG haute qualité, sRGB, compression sans perte visible
2. **Poids** : optimiser avec TinyPNG ou Squoosh avant intégration
3. **Thème** : respecter la cohérence sombre/clair (éviter les zones trop claires sur le hero qui pourraient mal réagir avec le overlay)
4. **Cadrage** : prévoir un `safe margin` de 10% sur les bords car `background-size: cover` recadre automatiquement
5. **Cohérence** : garder une palette colorimétrique cohérente sur tout le portfolio

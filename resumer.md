# Créer un nouveau projet Symfony (version API)
composer create-project symfony/skeleton my-api-backend
# 1. Framework de base
composer require symfony/orm-pack
composer require symfony/maker-bundle --dev

# 2. Sécurité et authentification
composer require symfony/security-bundle
composer require lexik/jwt-authentication-bundle

# 3. Sérialisation et validation
composer require symfony/serializer-pack
composer require symfony/validator

# 4. Migrations (CORRECTION)
composer require doctrine/doctrine-migrations-bundle

# 5. Pour l'envoi d'emails (optionnel)
composer require symfony/mailer

# 6. Pour les assets et uploads
composer require symfony/asset
composer require symfony/filesystem

# 7. CORS (pour communiquer avec votre frontend)
composer require nelmio/cors-bundle

# Voir ce qui est déjà installé
composer show --installed | grep -E "doctrine|security|jwt|serializer"


config 

# 1. Modifier .env avec le mot de passe de juliano
sed -i 's/DATABASE_URL="postgresql:\/\/app:!ChangeMe!@127.0.0.1:5432\/app?serverVersion=16&charset=utf8"/DATABASE_URL="postgresql:\/\/juliano:juliano123@127.0.0.1:5432\/app?serverVersion=16&charset=utf8"/' .env

# 2. Vérifier la configuration
cat .env | grep DATABASE_URL

# 3. Tester la connexion à la base
php bin/console doctrine:database:create

# 4. Créer les tables
php bin/console doctrine:schema:update --force

# 5. Vider le cache
php bin/console cache:clear

# 6. Lancer le serveur
symfony server:start

# 7. Générer et appliquer les migrations
php bin/console make:migration
php bin/console doctrine:migrations:migrate --no-interaction

## Relations entre entités

### Medias ↔ Album
- `Medias.albums` : **OneToMany** vers `Album`
- Un média peut être associé à plusieurs albums
- Cascade `persist` + `remove` activée

### Album → Medias
- `Album.media` : **ManyToOne** vers `Medias` (obligatoire, `nullable: false`)
- Chaque album est lié à un seul média

### Category ↔ Album
- `Category.albums` : **OneToMany** vers `Album`
- Une catégorie peut contenir plusieurs albums

### Album → Category
- `Album.category` : **ManyToOne** vers `Category` (obligatoire, `nullable: false`)
- Chaque album est lié à une seule catégorie

### User → Contact
- `User.contacts` : **OneToMany** vers `Contact`
- Un utilisateur peut avoir plusieurs contacts

### Contact → User
- `Contact.user` : **ManyToOne** vers `User` (obligatoire, `nullable: false`)
- Chaque contact est lié à un seul utilisateur

## Entités

### User
Représente un utilisateur de l'application. Champs principaux :
- `id` : identifiant unique
- `email` : adresse email (unique)
- `roles` : rôles de sécurité (tableau JSON)
- `password` : mot de passe hashé
- `firstName` / `lastName` : nom et prénom
- `bio` : biographie (texte long)
- `description` : description courte de l'utilisateur
- `avatar` : URL de l'avatar
- `linkedin` / `twitter` : liens sociaux
- `isActive` : statut actif/inactif
- `createdAt` / `updatedAt` : dates de création et mise à jour
- `contacts` : relation OneToMany vers Contact

### Category
Représente une catégorie de contenu. Champs principaux :
- `id` : identifiant unique
- `name` : nom de la catégorie
- `slug` : slug URL-friendly
- `description` : description courte de la catégorie
- `icon` : icône associée
- `albums` : relation OneToMany vers Album

### Medias
Représente un fichier média (image, vidéo, document). Champs principaux :
- `id` : identifiant unique
- `title` : titre du média
- `slug` : slug URL-friendly (unique)
- `description` : description du contenu média
- `type` : type de média (ex: image, video)
- `imageUrl` : URL de l'image
- `videoUrl` : URL de la vidéo
- `embedUrl` : URL d'intégration (embed)
- `platform` : plateforme source (ex: youtube, vimeo)
- `videoId` : identifiant vidéo sur la plateforme
- `thumbnailUrl` : URL de la miniature
- `width` / `height` : dimensions en pixels
- `orientation` : orientation (portrait, paysage, carré)
- `mimeType` : type MIME du fichier
- `fileSize` : taille du fichier en octets
- `altText` : texte alternatif pour l'accessibilité
- `duration` / `durationFormatted` : durée (pour les vidéos)
- `gallery` : données JSON pour la galerie
- `tags` : tableau JSON de tags
- `isPublished` : statut publication
- `isFeatured` : mise en avant
- `views` / `likes` : compteurs
- `albums` : relation OneToMany vers Album (cascade persist + remove)

### Album
Représente un album liant un média à une catégorie. Champs principaux :
- `id` : identifiant unique
- `title` : titre de l'album
- `description` : description de l'album
- `media` : relation ManyToOne obligatoire vers Medias
- `category` : relation ManyToOne obligatoire vers Category

### SectionPage
Représente une section de page/portfolio. Champs principaux :
- `id` : identifiant unique
- `title` : titre de la section
- `description` : description de la section
- `content` : contenu HTML/markdown de la section
- `type` : type de section (ex: hero, about, projects)
- `position` : ordre d'affichage
- `isActive` : visibilité
- `createdAt` / `updatedAt` : dates de création et mise à jour

### Contact
Représente un message de contact lié à un utilisateur. Champs principaux :
- `id` : identifiant unique
- `name` : nom de l'expéditeur
- `email` : email de l'expéditeur
- `phone` : téléphone
- `message` : contenu du message
- `isRead` : statut lu/non lu
- `user` : relation ManyToOne obligatoire vers User
- `createdAt` : date de création

### Theme
Représente un thème graphique du site. Champs principaux :
- `id` : identifiant unique
- `name` : nom du thème
- `slug` : slug URL-friendly (unique)
- `description` : description du thème
- `price` : prix (null = gratuit)
- `features` : fonctionnalités (JSON)
- `previewImage` : image de prévisualisation (URL)
- `isActive` : visibilité
- `createdAt` / `updatedAt` : dates de création et mise à jour
- `subscriptions` : relation OneToMany vers UserSubscription

### UserSubscription
Représente l'abonnement d'un utilisateur. Champs principaux :
- `id` : identifiant unique
- `user` : relation ManyToOne obligatoire vers User
- `theme` : relation ManyToOne optionnelle vers Theme
- `subscriptionType` : type d'abonnement (`free`, `premium`, `enterprise`)
- `startDate` : date de début
- `endDate` : date de fin (null = illimité)
- `isActive` : statut actif/inactif
- `paymentId` : identifiant de paiement externe
- `createdAt` / `updatedAt` : dates de création et mise à jour

### Relation User ↔ Subscription
- `User.subscriptionType` : type actuel (`free` par défaut)
- `User.subscriptionExpiresAt` : date d'expiration (null = pas d'expiration)
- `User.subscriptions` : **OneToMany** vers `UserSubscription`

## Système d'abonnement et gestion des thèmes

### Rôles
- **Free** : peut consulter tous les thèmes mais ne peut appliquer que le thème par défaut (`slug: light`)
- **Premium** : peut appliquer n'importe quel thème actif
- **Admin** : gère les thèmes et peut promouvoir/rétrograder les utilisateurs

### Flux utilisateur Free → Premium
1. Free user consulte les thèmes via `GET /api/themes`
2. Pour installer un thème payant, il fait `POST /api/subscription/request-premium`
3. Cette action crée un `Contact` avec le préfixe `PREMIUM_REQUEST:` visible par l'admin
4. L'admin valide manuellement via `PUT /api/users/{id}/upgrade-premium`
5. L'utilisateur devient premium et peut appliquer tous les thèmes via `POST /api/themes/{id}/apply`
6. L'admin peut rétrograder via `PUT /api/users/{id}/downgrade-free`

### Règles d'application des thèmes
- Si `user.isPremiumUser()` === true → autorisé pour tous les thèmes
- Si `user.isPremiumUser()` === false → autorisé uniquement pour le thème `slug = "light"`
- Réponse `403 Forbidden` avec message d'upgrade si non autorisé

### Champs User liés
- `subscriptionType` : `free` | `premium` | `enterprise`
- `subscriptionExpiresAt` : DateTimeImmutable nullable (null = illimité)
- `themePreferences` : JSON stockant les préférences (ex: `{"theme": "light", "layout": "default"}`)

## Sécurité API

### Authentification JWT
- Login : `POST /api/auth/login`
- Register : `POST /api/auth/register`
- Me : `GET /api/auth/me`

### Règles d'accès
- `/api/auth/login` / `/api/auth/register` : anonyme
- `/api/auth/me` : authentifié
- `/api/themes` (GET) : anonyme
- `/api/themes` (POST/PUT/DELETE) et `/api/themes/{id}/apply` : authentifié (apply nécessite premium sauf thème par défaut)
- `/api/subscription` : authentifié
- `/api/users/{id}/upgrade-premium` et `/api/users/{id}/downgrade-free` : `ROLE_ADMIN`
- `/api/users`, `/api/categories`, `/api/albums`, `/api/media`, `/api/contacts` : `ROLE_ADMIN`

## Routes API

### User
- `GET    /api/users`
- `POST   /api/users`
- `GET    /api/users/{id}`
- `PUT    /api/users/{id}`
- `DELETE /api/users/{id}`

### Category
- `GET    /api/categories`
- `POST   /api/categories`
- `GET    /api/categories/{id}`
- `PUT    /api/categories/{id}`
- `DELETE /api/categories/{id}`

### Album
- `GET    /api/albums`
- `POST   /api/albums`
- `GET    /api/albums/{id}`
- `PUT    /api/albums/{id}`
- `DELETE /api/albums/{id}`

### Media
- `GET    /api/media`
- `POST   /api/media`
- `GET    /api/media/{id}`
- `PUT    /api/media/{id}`
- `DELETE /api/media/{id}`

### Contact
- `GET    /api/contacts`
- `POST   /api/contacts`
- `GET    /api/contacts/{id}`
- `PUT    /api/contacts/{id}`
- `DELETE /api/contacts/{id}`

### Theme
- `GET    /api/themes` — liste tous les thèmes actifs (public)
- `GET    /api/themes/{id}` — détail d'un thème (public)
- `POST   /api/themes/{id}/apply` — appliquer un thème (authentifié, premium requis sauf thème par défaut)
- `POST   /api/themes` — créer un thème (`ROLE_ADMIN`)
- `PUT    /api/themes/{id}` — modifier un thème (`ROLE_ADMIN`)
- `DELETE /api/themes/{id}` — supprimer un thème (`ROLE_ADMIN`)

### Subscription
- `GET    /api/subscription/status` — statut d'abonnement de l'utilisateur connecté
- `POST   /api/subscription/request-premium` — demande de passage en premium (crée un Contact)

### User — Gestion abonnement (admin)
- `PUT    /api/users/{id}/upgrade-premium` — promouvoir un utilisateur en premium
- `PUT    /api/users/{id}/downgrade-free` — rétrograder un utilisateur en free

## Front-office - Dimensions images

### Hero (frames)
- `assets/images/hero-frames/frame_*.jpg` : **1920×1080** (192 frames, ratio 16:9)

### Home page - Rooms
- `home-rooms-main.jpg` : **800×1000** (ratio 4:5, portrait)
- `home-rooms-1.jpg` : **800×500** (ratio 16:10, paysage)
- `home-rooms-2.jpg` : **800×500** (ratio 16:10, paysage)

### Home page - Portfolio
- `home-rooms-main.jpg` : **800×1000** (ratio 4:5, portrait)
- `home-rooms-1.jpg` : **800×500** (ratio 16:10, paysage)
- `home-portrait.jpg` : **800×1000** (ratio 4:5, portrait)
- `home-events.jpg` : **800×600** (ratio 4:3, paysage)
- `home-fashion.jpg` : **800×600** (ratio 4:3, paysage)

### Home page - About
- `home-about-1.jpg` : **600×400** (ratio 3:2, paysage)
- `home-about-2.jpg` : **600×400** (ratio 3:2, paysage)
- `home-about-3.jpg` : **600×450** (ratio 4:3, paysage)
- `home-about-4.jpg` : **600×400** (ratio 3:2, paysage)

### Home page - Passion
- `home-passion-1.jpg` : **1200×1800** (ratio 2:3, portrait)
- `home-passion-2.jpg` : **1200×900** (ratio 4:3, paysage)

### Hero2
- Images externes Unsplash (résolutions dynamiques via paramètres URL)
- 4 slides : cinéma, tournage, studio photo, projecteur


Compte admin de test :

Email : admin@example.com
Mot de passe : admin123

---

## État actuel du projet (2026-07-27)

### Backend Symfony
- **Statut** : ✅ Fonctionnel en HTTP sur `127.0.0.1:8000`
- **Authentification** : JWT fonctionnelle (`POST /api/auth/login` retourne un token valide)
- **Base de données** : PostgreSQL connecté, données présentes
- **Uploads** : `POST /api/upload/media` fonctionne et retourne une URL
- **CORS** : Configuré pour `localhost:4200` et `127.0.0.1:4200`

### Frontend Angular
- **Statut** : ✅ Application buildée et servie sur `localhost:4200`
- **Environnement** : `apiUrl` modifié pour pointer directement vers `http://127.0.0.1:8000/api`
- **Proxy** : Aucun proxy utilisé (connexion directe au backend)
- **Authentification** : Intercepteur JWT présent, redirection vers `/login` si 401/403

### Erreurs rencontrées et corrigées

1. **Erreur 401 - "JWT Token not found"**
   - **Cause** : Le proxy Angular perdait le header `Authorization` lors de la redirection HTTPS vers HTTP
   - **Solution** : Suppression du proxy, connexion directe vers `http://127.0.0.1:8000/api`

2. **Erreur 307 - Redirection HTTPS infinie**
   - **Cause** : Le backend PHP écoute sur HTTP mais le proxy forwardait en HTTPS, causant une boucle de redirection
   - **Solution** : Utilisation de `http://127.0.0.1:8000` dans `environment.ts`

3. **Erreur ERR_CONNECTION_CLOSED**
   - **Cause** : Le serveur PHP n'était pas démarré ou écoutait sur une interface différente
   - **Solution** : Démarrer le serveur PHP avec `php -S 127.0.0.1:8000 -t public`

4. **Erreur 401 sur `/api/media`, `/api/albums`, `/api/categories`**
   - **Cause** : Token JWT absent ou invalide dans `localStorage`
   - **Solution** : 
     - Ajout d'une vérification `isAuthenticated()` dans `MediaLibraryComponent`
     - Redirection automatique vers `/login` si non authentifié
     - Vérification du token dans `AuthInterceptor`

### Fichiers modifiés

1. **`app/src/environments/environment.ts`**
   - Changement de `apiUrl: '/api'` vers `apiUrl: 'http://127.0.0.1:8000/api'`

2. **`app/src/app/back-office/pages/media-library/media-library.component.ts`**
   - Ajout de `AuthService` dans les imports
   - Ajout de `authService` dans le constructeur
   - Vérification `isAuthenticated()` dans `ngOnInit()` avec redirection vers `/login`

3. **`app/angular.json`**
   - Suppression de la configuration `proxyConfig` du serveur de développement

### Commandes de démarrage

```bash
# Terminal 1 - Backend PHP
cd my-api-backend
php -S 127.0.0.1:8000 -t public

# Terminal 2 - Frontend Angular
cd app
ng serve --port 4200
```

### URL d'accès

- Frontend : `http://localhost:4200`
- Backend API : `http://127.0.0.1:8000/api`
- Login : `http://localhost:4200/login`
- Admin : `http://localhost:4200/admin`

### Points d'attention

- Le backend doit être démarré avant le frontend
- Le token JWT est stocké dans `localStorage` sous la clé `token`
- La durée de vie du token est limitée (vérifier `payload.exp`)
- Les uploads de médias nécessitent un token valide
- CORS doit autoriser `localhost:4200` et `127.0.0.1:4200`
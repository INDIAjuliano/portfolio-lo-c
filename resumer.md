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

## Sécurité API

### Authentification JWT
- Login : `POST /api/auth/login`
- Register : `POST /api/auth/register`
- Me : `GET /api/auth/me`

### Règles d'accès
- `/api/auth/login` / `/api/auth/register` : anonyme
- `/api/auth/me` : authentifié
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
#!/bin/bash
echo "🚀 Installation des dépendances PHP..."

# Installer Composer si nécessaire
if ! command -v composer &> /dev/null; then
    echo "📦 Installation de Composer..."
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    php composer-setup.php --quiet
    php -r "unlink('composer-setup.php');"
    php composer.phar install --no-dev --optimize-autoloader --no-interaction
else
    composer install --no-dev --optimize-autoloader --no-interaction
fi

echo "🗄️  Application des migrations Supabase..."
php bin/console doctrine:migrations:migrate --no-interaction --env=prod || echo "⚠️  Les migrations ont échoué"

echo "🧹 Nettoyage du cache..."
php bin/console cache:clear --env=prod

echo "✅ Build terminé !"

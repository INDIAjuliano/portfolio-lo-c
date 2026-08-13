<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260812000002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create default section pages for home page';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<SQL
            INSERT INTO section_page (page, section, title, description, content, is_active, created_at) VALUES
            ('home', 'hero', 'LOÏC', 'Photography professionnelle', true, NOW()),
            ('home', 'hero2', 'LOÏC', 'Immerse yourself in a visual journey where reality meets the imaginary.', null, true, NOW()),
            ('home', 'portfolio', 'Portfolio', 'Captured moments', null, true, NOW()),
            ('home', 'about', 'About the Photographer', 'I am a professional photographer specializing in capturing authentic moments that tell compelling stories. With over 10 years of experience, I bring a refined artistic vision to every shoot—whether it is a wedding, a corporate event, or a personal portrait session.', null, true, NOW()),
            ('home', 'passion', 'Vision & Style', 'Every frame is composed with intention—balancing light, emotion, and geometry to create images that feel both spontaneous and timeless.', null, true, NOW()),
            ('home', 'offer', 'Offer', 'Promote your company or personal brand with our services.', null, true, NOW())
            SQL
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql("DELETE FROM section_page WHERE page = 'home'");
    }
}

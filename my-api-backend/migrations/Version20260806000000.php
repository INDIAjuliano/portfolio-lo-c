<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260806000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add page, section, imageUrl fields to SectionPage and Album entities';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE section_page ADD page VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE section_page ADD section VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE section_page ADD image_url VARCHAR(500) DEFAULT NULL');
        $this->addSql('ALTER TABLE album ADD page VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE album ADD section VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE album DROP page');
        $this->addSql('ALTER TABLE album DROP section');
        $this->addSql('ALTER TABLE section_page DROP page');
        $this->addSql('ALTER TABLE section_page DROP section');
        $this->addSql('ALTER TABLE section_page DROP image_url');
    }
}
<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260811000002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add is_site_logo field to partner table';
    }

    public function up(Schema $schema): void
    {
        $table = $schema->getTable('partner');
        $table->addColumn('is_site_logo', 'boolean', ['default' => false, 'notnull' => true]);
    }

    public function down(Schema $schema): void
    {
        $table = $schema->getTable('partner');
        $table->dropColumn('is_site_logo');
    }
}

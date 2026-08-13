<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260811000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create partner table';
    }

    public function up(Schema $schema): void
    {
        $table = $schema->createTable('partner');
        $table->addColumn('id', 'integer', ['autoincrement' => true]);
        $table->addColumn('name', 'string', ['length' => 255]);
        $table->addColumn('description', 'text', ['notnull' => false]);
        $table->addColumn('logo_url', 'text', ['notnull' => false]);
        $table->addColumn('link_url', 'text', ['notnull' => false]);
        $table->addColumn('position', 'integer', ['notnull' => false]);
        $table->addColumn('is_published', 'boolean', ['default' => false]);
        $table->setPrimaryKey(['id']);
    }

    public function down(Schema $schema): void
    {
        $schema->dropTable('partner');
    }
}

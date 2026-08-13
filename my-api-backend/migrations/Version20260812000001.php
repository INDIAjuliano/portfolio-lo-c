<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260812000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add unique constraint on album_media to allow media reuse across albums';
    }

    public function up(Schema $schema): void
    {
        $table = $schema->getTable('album_media');
        $table->addUniqueIndex(['album_id', 'media_id'], 'uniq_album_media');
    }

    public function down(Schema $schema): void
    {
        $table = $schema->getTable('album_media');
        $table->removeIndex('uniq_album_media');
    }
}

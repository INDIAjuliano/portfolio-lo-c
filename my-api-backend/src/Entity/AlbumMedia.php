<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'album_media')]
class AlbumMedia
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Album::class, inversedBy: 'albumMedia')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Album $album = null;

    #[ORM\ManyToOne(targetEntity: Medias::class, inversedBy: 'albumMedia')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Medias $media = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAlbum(): ?Album
    {
        return $this->album;
    }

    public function setAlbum(?Album $album): static
    {
        $this->album = $album;

        return $this;
    }

    public function getMedia(): ?Medias
    {
        return $this->media;
    }

    public function setMedia(?Medias $media): static
    {
        $this->media = $media;

        return $this;
    }
}

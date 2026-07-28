<?php

namespace App\Entity;

use App\Repository\AlbumRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AlbumRepository::class)]
class Album
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\ManyToOne(inversedBy: 'albums')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Medias $media = null;

    #[ORM\ManyToOne(inversedBy: 'albums')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Category $category = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $coverUrl = null;

    #[ORM\OneToMany(mappedBy: 'album', targetEntity: AlbumMedia::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $albumMedia;

    public function __construct()
    {
        $this->albumMedia = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

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

    public function getCategory(): ?Category
    {
        return $this->category;
    }

    public function setCategory(?Category $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function getCoverUrl(): ?string
    {
        return $this->coverUrl;
    }

    public function setCoverUrl(?string $coverUrl): static
    {
        $this->coverUrl = $coverUrl;

        return $this;
    }

    /**
     * @return Collection<int, AlbumMedia>
     */
    public function getAlbumMedia(): Collection
    {
        return $this->albumMedia;
    }

    public function addAlbumMedia(AlbumMedia $albumMedia): static
    {
        if (!$this->albumMedia->contains($albumMedia)) {
            $this->albumMedia->add($albumMedia);
            $albumMedia->setAlbum($this);
        }

        return $this;
    }

    public function removeAlbumMedia(AlbumMedia $albumMedia): static
    {
        if ($this->albumMedia->removeElement($albumMedia)) {
            if ($albumMedia->getAlbum() === $this) {
                $albumMedia->setAlbum(null);
            }
        }

        return $this;
    }
}

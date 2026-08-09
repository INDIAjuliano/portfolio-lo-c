<?php

namespace App\Entity;

use App\Repository\MediasRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MediasRepository::class)]
class Medias
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(length: 255, unique: true)]
    private ?string $slug = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 50)]
    private ?string $type = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $imageUrl = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $videoUrl = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $embedUrl = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $platform = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $videoId = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $thumbnailUrl = null;

    #[ORM\Column(nullable: true)]
    private ?int $width = null;

    #[ORM\Column(nullable: true)]
    private ?int $height = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $orientation = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $mimeType = null;

    #[ORM\Column(nullable: true)]
    private ?int $fileSize = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $altText = null;

    #[ORM\Column(nullable: true)]
    private ?int $duration = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $durationFormatted = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private array $gallery = [];

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private array $tags = [];

    #[ORM\Column(type: Types::BOOLEAN)]
    private bool $isPublished = false;

    #[ORM\Column(type: Types::BOOLEAN)]
    private bool $isFeatured = false;

    #[ORM\Column]
    private int $views = 0;

    #[ORM\Column]
    private int $likes = 0;

    #[ORM\OneToMany(mappedBy: 'media', targetEntity: AlbumMedia::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $albumMedia;

    #[ORM\OneToMany(mappedBy: 'media', targetEntity: Album::class)]
    private Collection $albums;

    public function __construct()
    {
        $this->albums = new ArrayCollection();
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

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;

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

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getImageUrl(): ?string
    {
        return $this->imageUrl;
    }

    public function setImageUrl(?string $imageUrl): static
    {
        $this->imageUrl = $imageUrl;

        return $this;
    }

    public function getVideoUrl(): ?string
    {
        return $this->videoUrl;
    }

    public function setVideoUrl(?string $videoUrl): static
    {
        $this->videoUrl = $videoUrl;

        return $this;
    }

    public function getEmbedUrl(): ?string
    {
        return $this->embedUrl;
    }

    public function setEmbedUrl(?string $embedUrl): static
    {
        $this->embedUrl = $embedUrl;

        return $this;
    }

    public function getPlatform(): ?string
    {
        return $this->platform;
    }

    public function setPlatform(?string $platform): static
    {
        $this->platform = $platform;

        return $this;
    }

    public function getVideoId(): ?string
    {
        return $this->videoId;
    }

    public function setVideoId(?string $videoId): static
    {
        $this->videoId = $videoId;

        return $this;
    }

    public function getThumbnailUrl(): ?string
    {
        return $this->thumbnailUrl;
    }

    public function setThumbnailUrl(?string $thumbnailUrl): static
    {
        $this->thumbnailUrl = $thumbnailUrl;

        return $this;
    }

    public function getWidth(): ?int
    {
        return $this->width;
    }

    public function setWidth(?int $width): static
    {
        $this->width = $width;

        return $this;
    }

    public function getHeight(): ?int
    {
        return $this->height;
    }

    public function setHeight(?int $height): static
    {
        $this->height = $height;

        return $this;
    }

    public function getOrientation(): ?string
    {
        return $this->orientation;
    }

    public function setOrientation(?string $orientation): static
    {
        $this->orientation = $orientation;

        return $this;
    }

    public function getMimeType(): ?string
    {
        return $this->mimeType;
    }

    public function setMimeType(?string $mimeType): static
    {
        $this->mimeType = $mimeType;

        return $this;
    }

    public function getFileSize(): ?int
    {
        return $this->fileSize;
    }

    public function setFileSize(?int $fileSize): static
    {
        $this->fileSize = $fileSize;

        return $this;
    }

    public function getAltText(): ?string
    {
        return $this->altText;
    }

    public function setAltText(?string $altText): static
    {
        $this->altText = $altText;

        return $this;
    }

    public function getDuration(): ?int
    {
        return $this->duration;
    }

    public function setDuration(?int $duration): static
    {
        $this->duration = $duration;

        return $this;
    }

    public function getDurationFormatted(): ?string
    {
        return $this->durationFormatted;
    }

    public function setDurationFormatted(?string $durationFormatted): static
    {
        $this->durationFormatted = $durationFormatted;

        return $this;
    }

    public function getGallery(): array
    {
        return $this->gallery;
    }

    public function setGallery(array $gallery): static
    {
        $this->gallery = $gallery;

        return $this;
    }

    public function getTags(): array
    {
        return $this->tags;
    }

    public function setTags(array $tags): static
    {
        $this->tags = $tags;

        return $this;
    }

    public function isPublished(): bool
    {
        return $this->isPublished;
    }

    public function setIsPublished(bool $isPublished): static
    {
        $this->isPublished = $isPublished;

        return $this;
    }

    public function isFeatured(): bool
    {
        return $this->isFeatured;
    }

    public function setIsFeatured(bool $isFeatured): static
    {
        $this->isFeatured = $isFeatured;

        return $this;
    }

    public function getViews(): int
    {
        return $this->views;
    }

    public function setViews(int $views): static
    {
        $this->views = $views;

        return $this;
    }

    public function getLikes(): int
    {
        return $this->likes;
    }

    public function setLikes(int $likes): static
    {
        $this->likes = $likes;

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
            $albumMedia->setMedia($this);
        }

        return $this;
    }

    public function removeAlbumMedia(AlbumMedia $albumMedia): static
    {
        if ($this->albumMedia->removeElement($albumMedia)) {
            if ($albumMedia->getMedia() === $this) {
                $albumMedia->setMedia(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Album>
     */
    public function getAlbums(): Collection
    {
        return $this->albums;
    }

    public function addAlbum(Album $album): static
    {
        if (!$this->albums->contains($album)) {
            $this->albums[] = $album;
            $album->setMedia($this);
        }

        return $this;
    }

    public function removeAlbum(Album $album): static
    {
        if ($this->albums->removeElement($album)) {
            if ($album->getMedia() === $this) {
                $album->setMedia(null);
            }
        }

        return $this;
    }
}

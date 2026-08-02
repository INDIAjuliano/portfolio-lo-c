<?php

namespace App\Dto;

use App\Entity\Album;

readonly class AlbumResponse
{
    public int $id;
    public string $title;
    public ?string $description;
    public ?int $coverMediaId;
    public ?int $categoryId;
    public ?string $coverUrl;
    public bool $isPublished;
    public array $mediaIds;

    private function __construct(
        int $id,
        string $title,
        ?string $description,
        ?int $coverMediaId,
        ?int $categoryId,
        ?string $coverUrl,
        bool $isPublished,
        array $mediaIds
    ) {
        $this->id = $id;
        $this->title = $title;
        $this->description = $description;
        $this->coverMediaId = $coverMediaId;
        $this->categoryId = $categoryId;
        $this->coverUrl = $coverUrl;
        $this->isPublished = $isPublished;
        $this->mediaIds = $mediaIds;
    }

    public static function fromEntity(Album $album): self
    {
        $mediaIds = [];
        foreach ($album->getAlbumMedia() as $albumMedia) {
            $mediaIds[] = $albumMedia->getMedia()?->getId();
        }
        $mediaIds = array_values(array_filter($mediaIds));

        return new self(
            id: $album->getId(),
            title: $album->getTitle(),
            description: $album->getDescription(),
            coverMediaId: $album->getMedia()?->getId(),
            categoryId: $album->getCategory()?->getId(),
            coverUrl: $album->getCoverUrl(),
            isPublished: $album->isPublished(),
            mediaIds: $mediaIds
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'coverMediaId' => $this->coverMediaId,
            'categoryId' => $this->categoryId,
            'coverUrl' => $this->coverUrl,
            'isPublished' => $this->isPublished,
            'mediaIds' => $this->mediaIds,
        ];
    }
}

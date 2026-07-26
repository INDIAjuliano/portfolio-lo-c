<?php

namespace App\Dto;

use App\Entity\Album;

readonly class AlbumResponse
{
    public int $id;
    public string $title;
    public ?string $description;
    public ?int $mediaId;
    public ?int $categoryId;

    private function __construct(
        int $id,
        string $title,
        ?string $description,
        ?int $mediaId,
        ?int $categoryId
    ) {
        $this->id = $id;
        $this->title = $title;
        $this->description = $description;
        $this->mediaId = $mediaId;
        $this->categoryId = $categoryId;
    }

    public static function fromEntity(Album $album): self
    {
        return new self(
            id: $album->getId(),
            title: $album->getTitle(),
            description: $album->getDescription(),
            mediaId: $album->getMedia()?->getId(),
            categoryId: $album->getCategory()?->getId()
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'mediaId' => $this->mediaId,
            'categoryId' => $this->categoryId,
        ];
    }
}

class AlbumCreateRequest
{
    public string $title;
    public ?string $description;
    public int $mediaId;
    public int $categoryId;
}

class AlbumUpdateRequest
{
    public ?string $title;
    public ?string $description;
    public ?int $mediaId;
    public ?int $categoryId;
}

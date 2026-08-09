<?php

namespace App\Dto;

use App\Entity\Album;
use App\Entity\AlbumMedia;

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
    public array $media;
    public ?string $page;
    public ?string $section;

    private function __construct(
        int $id,
        string $title,
        ?string $description,
        ?int $coverMediaId,
        ?int $categoryId,
        ?string $coverUrl,
        bool $isPublished,
        array $mediaIds,
        array $media,
        ?string $page,
        ?string $section
    ) {
        $this->id = $id;
        $this->title = $title;
        $this->description = $description;
        $this->coverMediaId = $coverMediaId;
        $this->categoryId = $categoryId;
        $this->coverUrl = $coverUrl;
        $this->isPublished = $isPublished;
        $this->mediaIds = $mediaIds;
        $this->media = $media;
        $this->page = $page;
        $this->section = $section;
    }

    public static function fromEntity(Album $album): self
    {
        $mediaIds = [];
        $media = [];
        foreach ($album->getAlbumMedia() as $albumMedia) {
            $mediaEntity = $albumMedia->getMedia();
            if (!$mediaEntity) continue;
            $mediaIds[] = $mediaEntity->getId();
            $media[] = [
                'id' => $mediaEntity->getId(),
                'title' => $mediaEntity->getTitle(),
                'type' => $mediaEntity->getType(),
                'imageUrl' => $mediaEntity->getImageUrl(),
                'videoUrl' => $mediaEntity->getVideoUrl(),
                'thumbnailUrl' => $mediaEntity->getThumbnailUrl(),
                'url' => $mediaEntity->getImageUrl() ?: $mediaEntity->getVideoUrl(),
            ];
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
            mediaIds: $mediaIds,
            media: $media,
            page: $album->getPage(),
            section: $album->getSection()
        );
    }

    public function toArray(string $baseUrl = ''): array
    {
        $baseUrl = rtrim($baseUrl, '/');

        $media = [];
        foreach ($this->media as $item) {
            $media[] = [
                'id' => $item['id'],
                'title' => $item['title'],
                'type' => $item['type'],
                'imageUrl' => $this->prependBaseUrl($item['imageUrl'], $baseUrl),
                'videoUrl' => $this->prependBaseUrl($item['videoUrl'], $baseUrl),
                'thumbnailUrl' => $this->prependBaseUrl($item['thumbnailUrl'], $baseUrl),
                'url' => $this->prependBaseUrl($item['url'], $baseUrl),
            ];
        }

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'coverMediaId' => $this->coverMediaId,
            'categoryId' => $this->categoryId,
            'coverUrl' => $this->prependBaseUrl($this->coverUrl, $baseUrl),
            'isPublished' => $this->isPublished,
            'mediaIds' => $this->mediaIds,
            'media' => $media,
            'page' => $this->page,
            'section' => $this->section,
        ];
    }

    private function prependBaseUrl(?string $url, string $baseUrl): ?string
    {
        if (!$url) {
            return null;
        }

        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://') || str_starts_with($url, '//')) {
            return $url;
        }

        return $baseUrl . $url;
    }
}

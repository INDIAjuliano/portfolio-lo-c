<?php

namespace App\Dto;

use App\Entity\Medias;

readonly class MediaResponse
{
    public int $id;
    public string $title;
    public string $slug;
    public ?string $description;
    public string $type;
    public ?string $imageUrl;
    public ?string $videoUrl;
    public ?string $embedUrl;
    public ?string $platform;
    public ?string $videoId;
    public ?string $thumbnailUrl;
    public ?int $width;
    public ?int $height;
    public ?string $orientation;
    public ?string $mimeType;
    public ?int $fileSize;
    public ?string $altText;
    public ?int $duration;
    public ?string $durationFormatted;
    public array $gallery;
    public array $tags;
    public bool $isPublished;
    public bool $isFeatured;
    public int $views;
    public int $likes;
    public ?int $albumId;
    public ?string $albumName;
    public ?string $category;
    public array $albums;

    private function __construct(
        int $id,
        string $title,
        string $slug,
        ?string $description,
        string $type,
        ?string $imageUrl,
        ?string $videoUrl,
        ?string $embedUrl,
        ?string $platform,
        ?string $videoId,
        ?string $thumbnailUrl,
        ?int $width,
        ?int $height,
        ?string $orientation,
        ?string $mimeType,
        ?int $fileSize,
        ?string $altText,
        ?int $duration,
        ?string $durationFormatted,
        array $gallery,
        array $tags,
        bool $isPublished,
        bool $isFeatured,
        int $views,
        int $likes,
        ?int $albumId,
        ?string $albumName,
        ?string $category,
        array $albums
    ) {
        $this->id = $id;
        $this->title = $title;
        $this->slug = $slug;
        $this->description = $description;
        $this->type = $type;
        $this->imageUrl = $imageUrl;
        $this->videoUrl = $videoUrl;
        $this->embedUrl = $embedUrl;
        $this->platform = $platform;
        $this->videoId = $videoId;
        $this->thumbnailUrl = $thumbnailUrl;
        $this->width = $width;
        $this->height = $height;
        $this->orientation = $orientation;
        $this->mimeType = $mimeType;
        $this->fileSize = $fileSize;
        $this->altText = $altText;
        $this->duration = $duration;
        $this->durationFormatted = $durationFormatted;
        $this->gallery = $gallery;
        $this->tags = $tags;
        $this->isPublished = $isPublished;
        $this->isFeatured = $isFeatured;
        $this->views = $views;
        $this->likes = $likes;
        $this->albumId = $albumId;
        $this->albumName = $albumName;
        $this->category = $category;
        $this->albums = $albums;
    }

    public static function fromEntity(Medias $media): self
    {
        $albumId = null;
        $albumName = null;
        $category = null;
        $albums = [];
        foreach ($media->getAlbumMedia() as $albumMedia) {
            $album = $albumMedia->getAlbum();
            if (!$album) continue;
            $albums[] = ['id' => $album->getId(), 'name' => $album->getTitle()];
            if ($albumId === null) {
                $albumId = $album->getId();
                $albumName = $album->getTitle();
                $category = $album->getCategory()?->getName();
            }
        }

        return new self(
            id: $media->getId(),
            title: $media->getTitle(),
            slug: $media->getSlug() ?? '',
            description: $media->getDescription(),
            type: $media->getType() ?? '',
            imageUrl: $media->getImageUrl(),
            videoUrl: $media->getVideoUrl(),
            embedUrl: $media->getEmbedUrl(),
            platform: $media->getPlatform(),
            videoId: $media->getVideoId(),
            thumbnailUrl: $media->getThumbnailUrl(),
            width: $media->getWidth(),
            height: $media->getHeight(),
            orientation: $media->getOrientation(),
            mimeType: $media->getMimeType(),
            fileSize: $media->getFileSize(),
            altText: $media->getAltText(),
            duration: $media->getDuration(),
            durationFormatted: $media->getDurationFormatted(),
            gallery: $media->getGallery(),
            tags: $media->getTags(),
            isPublished: $media->isPublished(),
            isFeatured: $media->isFeatured(),
            views: $media->getViews(),
            likes: $media->getLikes(),
            albumId: $albumId,
            albumName: $albumName,
            category: $category,
            albums: $albums
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'type' => $this->type,
            'imageUrl' => $this->imageUrl,
            'videoUrl' => $this->videoUrl,
            'embedUrl' => $this->embedUrl,
            'platform' => $this->platform,
            'videoId' => $this->videoId,
            'thumbnailUrl' => $this->thumbnailUrl,
            'width' => $this->width,
            'height' => $this->height,
            'orientation' => $this->orientation,
            'mimeType' => $this->mimeType,
            'fileSize' => $this->fileSize,
            'altText' => $this->altText,
            'duration' => $this->duration,
            'durationFormatted' => $this->durationFormatted,
            'gallery' => $this->gallery ?: null,
            'tags' => $this->tags ?: null,
            'isPublished' => $this->isPublished,
            'isFeatured' => $this->isFeatured,
            'views' => $this->views,
            'likes' => $this->likes,
            'albumId' => $this->albumId,
            'albumName' => $this->albumName,
            'category' => $this->category,
            'albums' => $this->albums,
        ];
    }
}

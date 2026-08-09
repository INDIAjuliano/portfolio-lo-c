<?php

namespace App\Dto;

class AlbumUpdateRequest
{
    public ?string $title;
    public ?string $description;
    public ?string $coverUrl;
    public ?int $mediaId;
    public ?int $categoryId;
    public ?string $page;
    public ?string $section;
    public ?array $mediaUrls;
}

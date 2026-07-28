<?php

namespace App\Dto;

class AlbumUpdateRequest
{
    public ?string $title;
    public ?string $description;
    public ?string $coverUrl;
    public ?int $mediaId;
    public ?int $categoryId;
}

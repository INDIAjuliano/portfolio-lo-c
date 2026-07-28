<?php

namespace App\Dto;

class AlbumCreateRequest
{
    public string $title;
    public ?string $description;
    public ?string $coverUrl;
    public int $mediaId;
    public int $categoryId;
}

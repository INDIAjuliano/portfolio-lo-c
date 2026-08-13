<?php

namespace App\Dto;

class CategoryUpdateRequest
{
    public ?string $name;
    public ?string $slug;
    public ?string $description;
    public ?string $icon;
}

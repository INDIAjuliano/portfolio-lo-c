<?php

namespace App\Dto;

class CategoryCreateRequest
{
    public string $name;
    public string $slug;
    public ?string $description;
    public ?string $icon;
}

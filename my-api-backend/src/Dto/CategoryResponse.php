<?php

namespace App\Dto;

use App\Entity\Category;

readonly class CategoryResponse
{
    public int $id;
    public string $name;
    public string $slug;
    public ?string $description;
    public ?string $icon;
    public array $albums;

    private function __construct(
        int $id,
        string $name,
        string $slug,
        ?string $description,
        ?string $icon,
        array $albums
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->slug = $slug;
        $this->description = $description;
        $this->icon = $icon;
        $this->albums = $albums;
    }

    public static function fromEntity(Category $category): self
    {
        $albums = array_map(static fn ($a) => [
            'id' => $a->getId(),
            'title' => $a->getTitle(),
            'description' => $a->getDescription(),
            'mediaId' => $a->getMedia()?->getId(),
            'categoryId' => $a->getCategory()?->getId(),
        ], $category->getAlbums()->toArray());

        return new self(
            id: $category->getId(),
            name: $category->getName(),
            slug: $category->getSlug(),
            description: $category->getDescription(),
            icon: $category->getIcon(),
            albums: $albums
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'icon' => $this->icon,
            'albums' => $this->albums,
        ];
    }
}

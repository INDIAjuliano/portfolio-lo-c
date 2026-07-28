<?php

namespace App\Dto;

use App\Entity\Theme;

readonly class ThemeResponse
{
    public int $id;
    public string $name;
    public string $slug;
    public ?string $description;
    public ?string $price;
    public ?array $features;
    public ?string $previewImage;
    public bool $isActive;
    public ?string $createdAt;
    public ?string $updatedAt;

    private function __construct(
        int $id,
        string $name,
        string $slug,
        ?string $description,
        ?string $price,
        ?array $features,
        ?string $previewImage,
        bool $isActive,
        ?string $createdAt,
        ?string $updatedAt
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->slug = $slug;
        $this->description = $description;
        $this->price = $price;
        $this->features = $features;
        $this->previewImage = $previewImage;
        $this->isActive = $isActive;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    public static function fromEntity(Theme $theme): self
    {
        return new self(
            id: $theme->getId(),
            name: $theme->getName(),
            slug: $theme->getSlug(),
            description: $theme->getDescription(),
            price: $theme->getPrice(),
            features: $theme->getFeatures(),
            previewImage: $theme->getPreviewImage(),
            isActive: $theme->isActive(),
            createdAt: $theme->getCreatedAt()?->format('Y-m-d\TH:i:s'),
            updatedAt: $theme->getUpdatedAt()?->format('Y-m-d\TH:i:s')
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'features' => $this->features,
            'previewImage' => $this->previewImage,
            'isActive' => $this->isActive,
            'createdAt' => $this->createdAt,
            'updatedAt' => $this->updatedAt,
        ];
    }
}

<?php

namespace App\Dto;

use App\Entity\SectionPage;

readonly class SectionPageResponse
{
    public int $id;
    public string $page;
    public string $section;
    public string $title;
    public ?string $description;
    public ?string $content;
    public ?string $imageUrl;
    public ?string $type;
    public ?int $position;
    public bool $isActive;
    public string $createdAt;
    public ?string $updatedAt;

    private function __construct(
        int $id,
        string $page,
        string $section,
        string $title,
        ?string $description,
        ?string $content,
        ?string $imageUrl,
        ?string $type,
        ?int $position,
        bool $isActive,
        string $createdAt,
        ?string $updatedAt
    ) {
        $this->id = $id;
        $this->page = $page;
        $this->section = $section;
        $this->title = $title;
        $this->description = $description;
        $this->content = $content;
        $this->imageUrl = $imageUrl;
        $this->type = $type;
        $this->position = $position;
        $this->isActive = $isActive;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    public static function fromEntity(SectionPage $page): self
    {
        return new self(
            id: $page->getId(),
            page: $page->getPage() ?? '',
            section: $page->getSection() ?? '',
            title: $page->getTitle() ?? '',
            description: $page->getDescription(),
            content: $page->getContent(),
            imageUrl: $page->getImageUrl(),
            type: $page->getType(),
            position: $page->getPosition(),
            isActive: $page->isActive(),
            createdAt: $page->getCreatedAt()?->format('Y-m-d\TH:i:s') ?? '',
            updatedAt: $page->getUpdatedAt()?->format('Y-m-d\TH:i:s')
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'page' => $this->page,
            'section' => $this->section,
            'title' => $this->title,
            'description' => $this->description,
            'content' => $this->content,
            'imageUrl' => $this->imageUrl,
            'type' => $this->type,
            'position' => $this->position,
            'isActive' => $this->isActive,
            'createdAt' => $this->createdAt,
            'updatedAt' => $this->updatedAt,
        ];
    }
}
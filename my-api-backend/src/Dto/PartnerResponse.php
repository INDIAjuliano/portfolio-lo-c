<?php

namespace App\Dto;

readonly class PartnerResponse
{
    public int $id;
    public string $name;
    public ?string $description;
    public ?string $logoUrl;
    public ?string $linkUrl;
    public ?int $position;
    public bool $isPublished;
    public bool $isSiteLogo;

    private function __construct(
        int $id,
        string $name,
        ?string $description,
        ?string $logoUrl,
        ?string $linkUrl,
        ?int $position,
        bool $isPublished,
        bool $isSiteLogo
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->logoUrl = $logoUrl;
        $this->linkUrl = $linkUrl;
        $this->position = $position;
        $this->isPublished = $isPublished;
        $this->isSiteLogo = $isSiteLogo;
    }

    public static function fromEntity(\App\Entity\Partner $partner): self
    {
        return new self(
            id: $partner->getId(),
            name: $partner->getName(),
            description: $partner->getDescription(),
            logoUrl: $partner->getLogoUrl(),
            linkUrl: $partner->getLinkUrl(),
            position: $partner->getPosition(),
            isPublished: $partner->isPublished(),
            isSiteLogo: $partner->isSiteLogo()
        );
    }

    public function toArray(string $baseUrl = ''): array
    {
        $baseUrl = rtrim($baseUrl, '/');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'logoUrl' => $this->prependBaseUrl($this->logoUrl, $baseUrl),
            'linkUrl' => $this->linkUrl,
            'position' => $this->position,
            'isPublished' => $this->isPublished,
            'isSiteLogo' => $this->isSiteLogo,
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

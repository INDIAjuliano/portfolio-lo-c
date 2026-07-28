<?php

namespace App\Controller;

use App\Repository\MediasRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/public', name: 'api_public_')]
class PublicController
{
    public function __construct(private MediasRepository $mediaRepository) {}

    #[Route('/media', name: 'media_list', methods: ['GET'])]
    public function listMedia(): JsonResponse
    {
        $media = $this->mediaRepository->findPublished();
        $data = array_map(static fn ($m) => [
            'id' => $m->getId(),
            'title' => $m->getTitle(),
            'slug' => $m->getSlug(),
            'description' => $m->getDescription(),
            'type' => $m->getType(),
            'imageUrl' => $m->getImageUrl(),
            'videoUrl' => $m->getVideoUrl(),
            'thumbnailUrl' => $m->getThumbnailUrl(),
            'tags' => $m->getTags(),
            'isPublished' => $m->isPublished(),
            'isFeatured' => $m->isFeatured(),
            'views' => $m->getViews(),
            'likes' => $m->getLikes(),
        ], $media);

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }
}

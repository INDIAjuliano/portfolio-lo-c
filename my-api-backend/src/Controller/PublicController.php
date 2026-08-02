<?php

namespace App\Controller;

use App\Dto\AlbumResponse;
use App\Dto\MediaResponse;
use App\Repository\AlbumRepository;
use App\Repository\MediasRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/public', name: 'api_public_')]
class PublicController
{
    public function __construct(
        private MediasRepository $mediaRepository,
        private AlbumRepository $albumRepository
    ) {}

    #[Route('/media', name: 'media_list', methods: ['GET'])]
    public function listMedia(): JsonResponse
    {
        $media = $this->mediaRepository->findPublic();
        $data = array_map(static fn ($m) => MediaResponse::fromEntity($m)->toArray(), $media);

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('/albums/published', name: 'published_albums', methods: ['GET'])]
    public function publishedAlbums(): JsonResponse
    {
        $albums = $this->albumRepository->createQueryBuilder('a')
            ->andWhere('a.isPublished = :published')
            ->setParameter('published', true)
            ->orderBy('a.id', 'DESC')
            ->getQuery()
            ->getResult();

        $data = array_map(static fn ($a) => AlbumResponse::fromEntity($a)->toArray(), $albums);

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }
}

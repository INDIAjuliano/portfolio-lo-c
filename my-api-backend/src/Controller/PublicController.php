<?php

namespace App\Controller;

use App\Dto\AlbumResponse;
use App\Dto\MediaResponse;
use App\Repository\AlbumRepository;
use App\Repository\MediasRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/public', name: 'api_public_')]
class PublicController
{
    public function __construct(
        private MediasRepository $mediaRepository,
        private AlbumRepository $albumRepository
    ) {}

    #[Route('/media', name: 'media_list', methods: ['GET'])]
    public function listMedia(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = max(1, (int) $request->query->get('limit', 20));
        $offset = ($page - 1) * $limit;

        $qb = $this->mediaRepository->createQueryBuilder('m')
            ->leftJoin('m.albumMedia', 'am')
            ->leftJoin('am.album', 'a');

        $qb->where($qb->expr()->orX(
            'm.isPublished = :published',
            'a.isPublished = :albumPublished'
        ))
            ->setParameter('published', true)
            ->setParameter('albumPublished', true)
            ->orderBy('m.id', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        $type = $request->query->get('type');
        if ($type !== null) {
            $qb->andWhere('m.type = :type')
                ->setParameter('type', $type);
        }

        $media = $qb->getQuery()->getResult();

        $baseUrl = rtrim($_ENV['PUBLIC_BASE_URL'] ?? 'http://127.0.0.1:8000', '/');
        $data = array_map(static fn ($m) => MediaResponse::fromEntity($m)->toArray($baseUrl), $media);

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('/albums/published', name: 'published_albums', methods: ['GET'])]
    public function publishedAlbums(Request $request): JsonResponse
    {
        $page = $request->query->get('page');
        $section = $request->query->get('section');

        $qb = $this->albumRepository->createQueryBuilder('a')
            ->andWhere('a.isPublished = :published')
            ->setParameter('published', true)
            ->orderBy('a.id', 'DESC');

        if ($page) {
            $qb->andWhere('a.page = :page')
                ->setParameter('page', $page);
        }

        if ($section) {
            $qb->andWhere('a.section = :section')
                ->setParameter('section', $section);
        }

        $albums = $qb->getQuery()->getResult();

        $baseUrl = rtrim($_ENV['PUBLIC_BASE_URL'] ?? 'http://127.0.0.1:8000', '/');
        $data = array_map(static fn ($a) => AlbumResponse::fromEntity($a)->toArray($baseUrl), $albums);

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }
}

<?php

namespace App\Controller;

use App\Dto\AlbumCreateRequest;
use App\Dto\AlbumResponse;
use App\Dto\AlbumUpdateRequest;
use App\Entity\Album;
use App\Entity\AlbumMedia;
use App\Repository\AlbumRepository;
use App\Repository\CategoryRepository;
use App\Repository\MediasRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/albums', name: 'api_albums_')]
class AlbumController
{
    public function __construct(
        private EntityManagerInterface $em,
        private AlbumRepository $repository,
        private MediasRepository $mediaRepository,
        private CategoryRepository $categoryRepository,
        private SerializerInterface $serializer
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $albums = $this->repository->findAll();
        $data = array_map(static fn (Album $a) => AlbumResponse::fromEntity($a)->toArray(), $albums);
        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?: [];

        $category = $this->categoryRepository->find($data['categoryId'] ?? 0);
        if (!$category) {
            return new JsonResponse(['error' => 'Category not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $album = new Album();
        $album->setTitle($data['title'] ?? '');
        if (!empty($data['description'])) $album->setDescription($data['description']);
        if (!empty($data['coverUrl'])) $album->setCoverUrl($data['coverUrl']);
        $album->setCategory($category);

        $this->em->persist($album);
        $this->em->flush();

        $this->syncAlbumMedia($album, $data['mediaIds'] ?? []);

        return new JsonResponse(AlbumResponse::fromEntity($album)->toArray(), JsonResponse::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $album = $this->repository->find($id);
        if (!$album) {
            return new JsonResponse(['error' => 'Album not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        return new JsonResponse(AlbumResponse::fromEntity($album)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $album = $this->repository->find($id);
        if (!$album) {
            return new JsonResponse(['error' => 'Album not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?: [];

        if (isset($data['title'])) $album->setTitle((string) $data['title']);
        if (array_key_exists('description', $data)) $album->setDescription($data['description'] ?: null);
        if (array_key_exists('coverUrl', $data)) $album->setCoverUrl($data['coverUrl'] ?: null);

        if (array_key_exists('mediaIds', $data)) {
            $this->syncAlbumMedia($album, $data['mediaIds']);
        } elseif (array_key_exists('mediaId', $data)) {
            $album->setMedia($data['mediaId'] ? $this->mediaRepository->find($data['mediaId']) : null);
        }

        if (array_key_exists('categoryId', $data) && $data['categoryId'] !== null) {
            $category = $this->categoryRepository->find($data['categoryId']);
            if (!$category) {
                return new JsonResponse(['error' => 'Category not found'], JsonResponse::HTTP_NOT_FOUND);
            }
            $album->setCategory($category);
        }

        $this->em->flush();

        return new JsonResponse(AlbumResponse::fromEntity($album)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $album = $this->repository->find($id);
        if (!$album) {
            return new JsonResponse(['error' => 'Album not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $mediaToEvaluate = [$album->getMedia()];

        $this->em->remove($album);
        $this->em->flush();

        foreach ($mediaToEvaluate as $media) {
            if (!$media) {
                continue;
            }

            if ($media->isFeatured()) {
                continue;
            }

            $usageCount = $this->repository->count(['media' => $media]);
            if ($usageCount > 0) {
                continue;
            }

            $this->em->remove($media);
        }

        $this->em->flush();

        return new JsonResponse(['message' => 'Album deleted'], JsonResponse::HTTP_NO_CONTENT);
    }

    #[Route('/{id}/media', name: 'add_media', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function addMedia(int $id, Request $request): JsonResponse
    {
        $album = $this->repository->find($id);
        if (!$album) {
            return new JsonResponse(['error' => 'Album not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?: [];
        $mediaId = $data['mediaId'] ?? null;

        if (!$mediaId) {
            return new JsonResponse(['error' => 'mediaId is required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $media = $this->mediaRepository->find($mediaId);
        if (!$media) {
            return new JsonResponse(['error' => 'Media not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $exists = $this->em->getRepository(AlbumMedia::class)->findOneBy(['album' => $album, 'media' => $media]);
        if (!$exists) {
            $albumMedia = new AlbumMedia();
            $albumMedia->setAlbum($album);
            $albumMedia->setMedia($media);
            $this->em->persist($albumMedia);
            $this->em->flush();
        }

        return new JsonResponse(AlbumResponse::fromEntity($album)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('/{id}/media/{mediaId}', name: 'remove_media', methods: ['DELETE'], requirements: ['id' => '\d+', 'mediaId' => '\d+'])]
    public function removeMedia(int $id, int $mediaId): JsonResponse
    {
        $album = $this->repository->find($id);
        if (!$album) {
            return new JsonResponse(['error' => 'Album not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $media = $this->mediaRepository->find($mediaId);
        if (!$media) {
            return new JsonResponse(['error' => 'Media not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $albumMedia = $this->em->getRepository(AlbumMedia::class)->findOneBy(['album' => $album, 'media' => $media]);
        if ($albumMedia) {
            $this->em->remove($albumMedia);
            $this->em->flush();
        }

        return new JsonResponse(AlbumResponse::fromEntity($album)->toArray(), JsonResponse::HTTP_OK);
    }

    private function syncAlbumMedia(Album $album, array $mediaIds): void
    {
        $existing = $album->getAlbumMedia();
        $existingIds = [];
        foreach ($existing as $am) {
            $existingIds[] = $am->getMedia()?->getId();
        }
        $existingIds = array_values(array_filter($existingIds));

        $toRemove = array_diff($existingIds, $mediaIds);
        foreach ($toRemove as $mediaId) {
            $media = $this->mediaRepository->find($mediaId);
            if (!$media) continue;
            $albumMedia = $existing->filter(fn (AlbumMedia $am) => $am->getMedia()?->getId() === $mediaId)->first();
            if ($albumMedia) {
                $this->em->remove($albumMedia);
            }
        }

        $toAdd = array_diff($mediaIds, $existingIds);
        foreach ($toAdd as $mediaId) {
            $media = $this->mediaRepository->find($mediaId);
            if (!$media) continue;
            $albumMedia = new AlbumMedia();
            $albumMedia->setAlbum($album);
            $albumMedia->setMedia($media);
            $this->em->persist($albumMedia);
        }

        $this->em->flush();
    }
}

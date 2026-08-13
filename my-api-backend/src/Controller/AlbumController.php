<?php

namespace App\Controller;

use App\Dto\AlbumCreateRequest;
use App\Dto\AlbumResponse;
use App\Dto\AlbumUpdateRequest;
use App\Entity\Album;
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

        $media = $this->mediaRepository->find($data['mediaId'] ?? 0);
        if (!$media) {
            return new JsonResponse(['error' => 'Media not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $category = $this->categoryRepository->find($data['categoryId'] ?? 0);
        if (!$category) {
            return new JsonResponse(['error' => 'Category not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $album = new Album();
        $album->setTitle($data['title'] ?? '');
        if (!empty($data['description'])) $album->setDescription($data['description']);
        $album->setMedia($media);
        $album->setCategory($category);

        $this->em->persist($album);
        $this->em->flush();

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

        if (array_key_exists('mediaId', $data) && $data['mediaId'] !== null) {
            $media = $this->mediaRepository->find($data['mediaId']);
            if (!$media) {
                return new JsonResponse(['error' => 'Media not found'], JsonResponse::HTTP_NOT_FOUND);
            }
            $album->setMedia($media);
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

        $this->em->remove($album);
        $this->em->flush();

        return new JsonResponse(['message' => 'Album deleted'], JsonResponse::HTTP_NO_CONTENT);
    }
}

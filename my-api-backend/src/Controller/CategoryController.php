<?php

namespace App\Controller;

use App\Dto\CategoryCreateRequest;
use App\Dto\CategoryResponse;
use App\Dto\CategoryUpdateRequest;
use App\Entity\Category;
use App\Repository\CategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/categories', name: 'api_categories_')]
class CategoryController
{
    public function __construct(
        private EntityManagerInterface $em,
        private CategoryRepository $repository,
        private SerializerInterface $serializer
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $categories = $this->repository->findAll();
        $data = array_map(static fn (Category $c) => CategoryResponse::fromEntity($c)->toArray(), $categories);
        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?: [];

        $category = new Category();
        $category->setName($data['name'] ?? '');
        $category->setSlug($data['slug'] ?? '');
        if (!empty($data['description'])) $category->setDescription($data['description']);
        if (!empty($data['icon'])) $category->setIcon($data['icon']);

        $this->em->persist($category);
        $this->em->flush();

        return new JsonResponse(CategoryResponse::fromEntity($category)->toArray(), JsonResponse::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $category = $this->repository->find($id);
        if (!$category) {
            return new JsonResponse(['error' => 'Category not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        return new JsonResponse(CategoryResponse::fromEntity($category)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $category = $this->repository->find($id);
        if (!$category) {
            return new JsonResponse(['error' => 'Category not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?: [];

        if (isset($data['name'])) $category->setName((string) $data['name']);
        if (array_key_exists('slug', $data)) $category->setSlug((string) $data['slug']);
        if (array_key_exists('description', $data)) $category->setDescription($data['description'] ?: null);
        if (array_key_exists('icon', $data)) $category->setIcon($data['icon'] ?: null);

        $this->em->flush();

        return new JsonResponse(CategoryResponse::fromEntity($category)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $category = $this->repository->find($id);
        if (!$category) {
            return new JsonResponse(['error' => 'Category not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->em->remove($category);
        $this->em->flush();

        return new JsonResponse(['message' => 'Category deleted'], JsonResponse::HTTP_NO_CONTENT);
    }
}

<?php

namespace App\Controller;

use App\Dto\ThemeResponse;
use App\Entity\Theme;
use App\Repository\ThemeRepository;
use App\Service\SubscriptionService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/themes')]
class ThemeController
{
    public function __construct(
        private ThemeRepository $themeRepository,
        private SubscriptionService $subscriptionService,
        private SerializerInterface $serializer
    ) {}

    #[Route('', name: 'api_themes_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $themes = $this->themeRepository->findAllActive();
        $data = array_map(static fn (Theme $t) => ThemeResponse::fromEntity($t)->toArray(), $themes);

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'api_themes_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $theme = $this->themeRepository->find($id);
        if (!$theme) {
            return new JsonResponse(['error' => 'Theme not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        return new JsonResponse(ThemeResponse::fromEntity($theme)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('/{id}/apply', name: 'api_themes_apply', methods: ['POST'], requirements: ['id' => '\d+'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function apply(int $id, \Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface $tokenStorage): JsonResponse
    {
        $user = $tokenStorage->getToken()?->getUser();
        if (!$user instanceof \App\Entity\User) {
            return new JsonResponse(['error' => 'Unauthenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $theme = $this->themeRepository->find($id);
        if (!$theme) {
            return new JsonResponse(['error' => 'Theme not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        return $this->subscriptionService->applyTheme($user, $theme);
    }

    #[Route('', name: 'api_themes_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(\Symfony\Component\HttpFoundation\Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!$data || empty($data['name']) || empty($data['slug'])) {
            return new JsonResponse(['error' => 'Name and slug are required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $theme = new Theme();
        $theme->setName($data['name']);
        $theme->setSlug($data['slug']);
        $theme->setDescription($data['description'] ?? null);
        $theme->setPrice($data['price'] ?? null);
        $theme->setFeatures($data['features'] ?? null);
        $theme->setPreviewImage($data['previewImage'] ?? null);
        $theme->setIsActive($data['isActive'] ?? true);

        $this->themeRepository->getEntityManager()->persist($theme);
        $this->themeRepository->getEntityManager()->flush();

        return new JsonResponse(ThemeResponse::fromEntity($theme)->toArray(), JsonResponse::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_themes_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(int $id, \Symfony\Component\HttpFoundation\Request $request): JsonResponse
    {
        $theme = $this->themeRepository->find($id);
        if (!$theme) {
            return new JsonResponse(['error' => 'Theme not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return new JsonResponse(['error' => 'Invalid JSON'], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (isset($data['name'])) $theme->setName($data['name']);
        if (isset($data['slug'])) $theme->setSlug($data['slug']);
        if (isset($data['description'])) $theme->setDescription($data['description']);
        if (isset($data['price'])) $theme->setPrice($data['price']);
        if (isset($data['features'])) $theme->setFeatures($data['features']);
        if (isset($data['previewImage'])) $theme->setPreviewImage($data['previewImage']);
        if (isset($data['isActive'])) $theme->setIsActive($data['isActive']);

        $this->themeRepository->getEntityManager()->flush();

        return new JsonResponse(ThemeResponse::fromEntity($theme)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'api_themes_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id): JsonResponse
    {
        $theme = $this->themeRepository->find($id);
        if (!$theme) {
            return new JsonResponse(['error' => 'Theme not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->themeRepository->getEntityManager()->remove($theme);
        $this->themeRepository->getEntityManager()->flush();

        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }
}

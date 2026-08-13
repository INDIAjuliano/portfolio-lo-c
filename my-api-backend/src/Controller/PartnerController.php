<?php

namespace App\Controller;

use App\Dto\PartnerResponse;
use App\Entity\Partner;
use App\Repository\PartnerRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/partners')]
class PartnerController
{
    public function __construct(
        private PartnerRepository $partnerRepository,
        private SerializerInterface $serializer
    ) {}

    #[Route('', name: 'api_partners_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $partners = $this->partnerRepository->findAllOrdered();
        $data = array_map(static fn (Partner $p) => PartnerResponse::fromEntity($p)->toArray(), $partners);

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('', name: 'api_partners_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!$data || empty($data['name'])) {
            return new JsonResponse(['error' => 'Name is required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $partner = new Partner();
        $partner->setName($data['name']);
        $partner->setDescription($data['description'] ?? null);
        $partner->setLogoUrl($data['logoUrl'] ?? null);
        $partner->setLinkUrl($data['linkUrl'] ?? null);
        $partner->setPosition($data['position'] ?? null);
        $partner->setIsPublished($data['isPublished'] ?? false);
        $partner->setIsSiteLogo($data['isSiteLogo'] ?? false);

        $this->partnerRepository->getEntityManager()->persist($partner);
        $this->partnerRepository->getEntityManager()->flush();

        return new JsonResponse(PartnerResponse::fromEntity($partner)->toArray(), JsonResponse::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_partners_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $partner = $this->partnerRepository->find($id);
        if (!$partner) {
            return new JsonResponse(['error' => 'Partner not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        return new JsonResponse(PartnerResponse::fromEntity($partner)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'api_partners_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(int $id, Request $request): JsonResponse
    {
        $partner = $this->partnerRepository->find($id);
        if (!$partner) {
            return new JsonResponse(['error' => 'Partner not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return new JsonResponse(['error' => 'Invalid JSON'], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (array_key_exists('name', $data)) {
            $partner->setName($data['name']);
        }
        if (array_key_exists('description', $data)) {
            $partner->setDescription($data['description']);
        }
        if (array_key_exists('logoUrl', $data)) {
            $partner->setLogoUrl($data['logoUrl']);
        }
        if (array_key_exists('linkUrl', $data)) {
            $partner->setLinkUrl($data['linkUrl']);
        }
        if (array_key_exists('position', $data)) {
            $partner->setPosition($data['position']);
        }
        if (array_key_exists('isPublished', $data)) {
            $partner->setIsPublished($data['isPublished']);
        }
        if (array_key_exists('isSiteLogo', $data)) {
            $partner->setIsSiteLogo($data['isSiteLogo']);
        }

        $this->partnerRepository->getEntityManager()->flush();

        return new JsonResponse(PartnerResponse::fromEntity($partner)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'api_partners_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id): JsonResponse
    {
        $partner = $this->partnerRepository->find($id);
        if (!$partner) {
            return new JsonResponse(['error' => 'Partner not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->partnerRepository->getEntityManager()->remove($partner);
        $this->partnerRepository->getEntityManager()->flush();

        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }

    #[Route('/published', name: 'api_partners_published', methods: ['GET'])]
    public function published(): JsonResponse
    {
        $partners = $this->partnerRepository->findAllPublished();
        $data = array_map(static fn (Partner $p) => PartnerResponse::fromEntity($p)->toArray(), $partners);

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('/site-logo', name: 'api_partners_site_logo', methods: ['GET'])]
    public function siteLogo(): JsonResponse
    {
        $partner = $this->partnerRepository->findOneBy(['isSiteLogo' => true, 'isPublished' => true]);
        if (!$partner) {
            return new JsonResponse(null, JsonResponse::HTTP_NOT_FOUND);
        }

        return new JsonResponse(PartnerResponse::fromEntity($partner)->toArray(), JsonResponse::HTTP_OK);
    }
}

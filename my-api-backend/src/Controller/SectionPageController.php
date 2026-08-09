<?php

namespace App\Controller;

use App\Dto\SectionPageResponse;
use App\Entity\SectionPage;
use App\Repository\SectionPageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/section-pages', name: 'api_section_pages_')]
class SectionPageController
{
    public function __construct(
        private EntityManagerInterface $em,
        private SectionPageRepository $repository,
        private SerializerInterface $serializer
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $page = $request->query->get('page');
        $section = $request->query->get('section');

        $qb = $this->repository->createQueryBuilder('s')
            ->orderBy('s.position', 'ASC');

        if ($page) {
            $qb->andWhere('s.page = :page')
                ->setParameter('page', $page);
        }

        if ($section) {
            $qb->andWhere('s.section = :section')
                ->setParameter('section', $section);
        }

        $pages = $qb->getQuery()->getResult();
        $data = array_map(static fn (SectionPage $p) => SectionPageResponse::fromEntity($p)->toArray(), $pages);

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('/{page}', name: 'list_by_page', methods: ['GET'], requirements: ['page' => '[a-z]+'])]
    public function listByPage(string $page): JsonResponse
    {
        $pages = $this->repository->findBy(['page' => $page, 'isActive' => true], ['position' => 'ASC']);
        $data = array_map(static fn (SectionPage $p) => SectionPageResponse::fromEntity($p)->toArray(), $pages);

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('/{page}/{section}', name: 'list_by_page_section', methods: ['GET'], requirements: ['page' => '[a-z]+', 'section' => '[a-z0-9_-]+'])]
    public function listByPageAndSection(string $page, string $section): JsonResponse
    {
        $pageEntity = $this->repository->findOneBy(['page' => $page, 'section' => $section, 'isActive' => true]);

        if (!$pageEntity) {
            return new JsonResponse([], JsonResponse::HTTP_OK);
        }

        $data = SectionPageResponse::fromEntity($pageEntity)->toArray();

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $page = $this->repository->find($id);

        if (!$page) {
            return new JsonResponse(['error' => 'Section page not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        return new JsonResponse(SectionPageResponse::fromEntity($page)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?: [];

        $sectionPage = new SectionPage();
        $sectionPage->setPage($data['page'] ?? '');
        $sectionPage->setSection($data['section'] ?? '');
        $sectionPage->setTitle($data['title'] ?? '');
        $sectionPage->setDescription($data['description'] ?? null);
        $sectionPage->setContent($data['content'] ?? null);
        $sectionPage->setImageUrl($data['imageUrl'] ?? null);
        $sectionPage->setType($data['type'] ?? null);
        $sectionPage->setPosition($data['position'] ?? 0);
        $sectionPage->setIsActive($data['isActive'] ?? true);

        $this->em->persist($sectionPage);
        $this->em->flush();

        return new JsonResponse(SectionPageResponse::fromEntity($sectionPage)->toArray(), JsonResponse::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(int $id, Request $request): JsonResponse
    {
        $sectionPage = $this->repository->find($id);

        if (!$sectionPage) {
            return new JsonResponse(['error' => 'Section page not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?: [];

        if (array_key_exists('page', $data)) $sectionPage->setPage((string) $data['page']);
        if (array_key_exists('section', $data)) $sectionPage->setSection((string) ($data['section'] ?? null));
        if (array_key_exists('title', $data)) $sectionPage->setTitle((string) $data['title']);
        if (array_key_exists('description', $data)) $sectionPage->setDescription($data['description'] ?: null);
        if (array_key_exists('content', $data)) $sectionPage->setContent($data['content'] ?: null);
        if (array_key_exists('imageUrl', $data)) $sectionPage->setImageUrl($data['imageUrl'] ?: null);
        if (array_key_exists('type', $data)) $sectionPage->setType((string) ($data['type'] ?? null));
        if (array_key_exists('position', $data)) $sectionPage->setPosition((int) $data['position']);
        if (array_key_exists('isActive', $data)) $sectionPage->setIsActive((bool) $data['isActive']);

        $this->em->flush();

        return new JsonResponse(SectionPageResponse::fromEntity($sectionPage)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id): JsonResponse
    {
        $sectionPage = $this->repository->find($id);

        if (!$sectionPage) {
            return new JsonResponse(['error' => 'Section page not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->em->remove($sectionPage);
        $this->em->flush();

        return new JsonResponse(['message' => 'Section page deleted'], JsonResponse::HTTP_NO_CONTENT);
    }
}
<?php

namespace App\Controller;

use App\Dto\MediaResponse;
use App\Entity\Medias;
use App\Entity\User;
use App\Repository\MediasRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/media', name: 'api_media_')]
class MediaController
{
    public function __construct(
        private EntityManagerInterface $em,
        private MediasRepository $repository,
        private SerializerInterface $serializer,
        private TokenStorageInterface $tokenStorage
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $user = $this->tokenStorage->getToken()?->getUser();
        $isAdmin = $user instanceof User && in_array('ROLE_ADMIN', $user->getRoles(), true);

        if ($isAdmin) {
            $media = $this->repository->findAll();
        } else {
            $type = $request->query->get('type');
            $media = $type !== null ? $this->repository->findPublished($type) : $this->repository->findPublished();
        }

        $data = array_map(static fn (Medias $m) => MediaResponse::fromEntity($m)->toArray(), $media);

        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?: [];

        $slug = $data['slug'] ?? '';
        if ($slug === '') {
            $slug = $this->generateUniqueSlug($data['title'] ?? 'media');
        } else {
            $slug = $this->generateUniqueSlug($slug);
        }

        $media = new Medias();
        $media->setTitle($data['title'] ?? '');
        $media->setSlug($slug);
        $media->setDescription($data['description'] ?? null);
        $media->setType($data['type'] ?? '');
        $media->setImageUrl($data['imageUrl'] ?? null);
        $media->setVideoUrl($data['videoUrl'] ?? null);
        $media->setEmbedUrl($data['embedUrl'] ?? null);
        $media->setPlatform($data['platform'] ?? null);
        $media->setVideoId($data['videoId'] ?? null);
        $media->setThumbnailUrl($data['thumbnailUrl'] ?? null);
        $media->setWidth($data['width'] ?? null);
        $media->setHeight($data['height'] ?? null);
        $media->setOrientation($data['orientation'] ?? null);
        $media->setMimeType($data['mimeType'] ?? null);
        $media->setFileSize($data['fileSize'] ?? null);
        $media->setAltText($data['altText'] ?? null);
        $media->setDuration($data['duration'] ?? null);
        $media->setDurationFormatted($data['durationFormatted'] ?? null);
        $media->setGallery($data['gallery'] ?? []);
        $media->setTags($data['tags'] ?? []);
        $media->setIsPublished($data['isPublished'] ?? false);
        $media->setIsFeatured($data['isFeatured'] ?? false);
        $media->setViews($data['views'] ?? 0);
        $media->setLikes($data['likes'] ?? 0);

        $this->em->persist($media);
        $this->em->flush();

        return new JsonResponse(MediaResponse::fromEntity($media)->toArray(), JsonResponse::HTTP_CREATED);
    }

    private function generateUniqueSlug(string $base): string
    {
        $slug = strtolower(trim($base));
        $slug = preg_replace('/[^a-z0-9]+/i', '-', $slug) ?: 'media';
        $slug = trim($slug, '-');

        $originalSlug = $slug;
        $counter = 1;
        while ($this->repository->findOneBy(['slug' => $slug])) {
            $slug = $originalSlug . '-' . $counter;
            ++$counter;
        }

        return $slug;
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $media = $this->repository->find($id);

        if ($media === null) {
            return new JsonResponse(['error' => 'Media not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $user = $this->tokenStorage->getToken()?->getUser();
        $isAdmin = $user instanceof User && in_array('ROLE_ADMIN', $user->getRoles(), true);

        if (!$media->isPublished() && !$isAdmin) {
            return new JsonResponse(['error' => 'Media not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        return new JsonResponse(MediaResponse::fromEntity($media)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function update(int $id, Request $request): JsonResponse
    {
        $media = $this->repository->find($id);
        if (!$media) {
            return new JsonResponse(['error' => 'Media not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?: [];

        if (isset($data['title'])) $media->setTitle((string) $data['title']);
        if (array_key_exists('slug', $data)) $media->setSlug((string) $data['slug']);
        if (array_key_exists('description', $data)) $media->setDescription($data['description'] ?: null);
        if (array_key_exists('type', $data)) $media->setType((string) $data['type']);
        if (array_key_exists('imageUrl', $data)) $media->setImageUrl($data['imageUrl'] ?: null);
        if (array_key_exists('videoUrl', $data)) $media->setVideoUrl($data['videoUrl'] ?: null);
        if (array_key_exists('embedUrl', $data)) $media->setEmbedUrl($data['embedUrl'] ?: null);
        if (array_key_exists('platform', $data)) $media->setPlatform($data['platform'] ?: null);
        if (array_key_exists('videoId', $data)) $media->setVideoId($data['videoId'] ?: null);
        if (array_key_exists('thumbnailUrl', $data)) $media->setThumbnailUrl($data['thumbnailUrl'] ?: null);
        if (array_key_exists('width', $data)) $media->setWidth($data['width'] ?: null);
        if (array_key_exists('height', $data)) $media->setHeight($data['height'] ?: null);
        if (array_key_exists('orientation', $data)) $media->setOrientation($data['orientation'] ?: null);
        if (array_key_exists('mimeType', $data)) $media->setMimeType($data['mimeType'] ?: null);
        if (array_key_exists('fileSize', $data)) $media->setFileSize($data['fileSize'] ?: null);
        if (array_key_exists('altText', $data)) $media->setAltText($data['altText'] ?: null);
        if (array_key_exists('duration', $data)) $media->setDuration($data['duration'] ?: null);
        if (array_key_exists('durationFormatted', $data)) $media->setDurationFormatted($data['durationFormatted'] ?: null);
        if (array_key_exists('gallery', $data)) $media->setGallery((array) $data['gallery']);
        if (array_key_exists('tags', $data)) $media->setTags((array) $data['tags']);
        if (array_key_exists('isPublished', $data)) $media->setIsPublished((bool) $data['isPublished']);
        if (array_key_exists('isFeatured', $data)) $media->setIsFeatured((bool) $data['isFeatured']);
        if (array_key_exists('views', $data)) $media->setViews((int) $data['views']);
        if (array_key_exists('likes', $data)) $media->setLikes((int) $data['likes']);

        $this->em->flush();

        return new JsonResponse(MediaResponse::fromEntity($media)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id): JsonResponse
    {
        $media = $this->repository->find($id);
        if (!$media) {
            return new JsonResponse(['error' => 'Media not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->em->remove($media);
        $this->em->flush();

        return new JsonResponse(['message' => 'Media deleted'], JsonResponse::HTTP_NO_CONTENT);
    }
}

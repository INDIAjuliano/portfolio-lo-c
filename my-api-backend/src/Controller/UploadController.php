<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/upload', name: 'api_upload_')]
class UploadController
{
    private const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    private const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/avi', 'video/x-msvideo'];
    private const MAX_FILE_SIZE = 50 * 1024 * 1024;
    private const ALBUM_COVER_DIR = __DIR__ . '/../../public/uploads/album-covers';
    private const MEDIA_DIR = __DIR__ . '/../../public/uploads/media';
    private const PAGE_MEDIA_DIR = __DIR__ . '/../../public/uploads/pages';

    private const PAGE_DIRS = [
        'home' => 'home',
        'gallery' => 'gallery',
        'portfolio' => 'portfolio',
        'about' => 'about',
        'contact' => 'contact',
    ];

    #[Route('/album-cover', name: 'album_cover', methods: ['POST'])]
    public function uploadAlbumCover(Request $request): JsonResponse
    {
        $file = $request->files->get('file');

        if (!$file) {
            return new JsonResponse(['error' => 'No file uploaded'], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (!in_array($file->getMimeType(), self::ALLOWED_IMAGE_MIME_TYPES, true)) {
            return new JsonResponse(['error' => 'Invalid file type. Allowed: jpg, png, webp, gif'], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $size = $file->getSize();
        } catch (\RuntimeException $e) {
            $size = 0;
        }

        if ($size > self::MAX_FILE_SIZE) {
            return new JsonResponse(['error' => 'File too large. Max 50MB'], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (!is_dir(self::ALBUM_COVER_DIR) && !mkdir(self::ALBUM_COVER_DIR, 0755, true)) {
            return new JsonResponse(['error' => 'Failed to create upload directory'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

        $extension = $file->guessExtension() ?: pathinfo($file->getClientOriginalName(), PATHINFO_EXTENSION);
        $filename = uniqid('cover_', true) . '.' . $extension;
        $file->move(self::ALBUM_COVER_DIR, $filename);

        return new JsonResponse(['url' => '/uploads/album-covers/' . $filename], JsonResponse::HTTP_OK);
    }

    #[Route('/media', name: 'media', methods: ['POST'])]
    public function uploadMedia(Request $request): JsonResponse
    {
        $file = $request->files->get('file');

        if (!$file) {
            return new JsonResponse(['error' => 'No file uploaded'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $mimeType = $file->getMimeType();
        $allowedTypes = array_merge(self::ALLOWED_IMAGE_MIME_TYPES, self::ALLOWED_VIDEO_MIME_TYPES);

        if (!in_array($mimeType, $allowedTypes, true)) {
            return new JsonResponse([
                'error' => 'Invalid file type. Allowed: jpg, jpeg, png, webp, gif for images and mp4, avi for videos'
            ], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $size = $file->getSize();
        } catch (\RuntimeException $e) {
            $size = 0;
        }

        if ($size > self::MAX_FILE_SIZE) {
            return new JsonResponse(['error' => 'File too large. Max 50MB'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $type = in_array($mimeType, self::ALLOWED_IMAGE_MIME_TYPES, true) ? 'image' : 'video';
        $uploadDir = self::MEDIA_DIR . '/' . $type;

        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
            return new JsonResponse(['error' => 'Failed to create upload directory'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

        $extension = $file->guessExtension() ?: pathinfo($file->getClientOriginalName(), PATHINFO_EXTENSION);
        $filename = uniqid('media_', true) . '.' . $extension;
        $file->move($uploadDir, $filename);

        $url = '/uploads/media/' . $type . '/' . $filename;

        return new JsonResponse([
            'url' => $url,
            'type' => $type,
            'mimeType' => $mimeType,
            'size' => $size
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/media/page/{page}', name: 'media_page', methods: ['POST'], requirements: ['page' => '[a-z]+'])]
    public function uploadMediaForPage(Request $request, string $page): JsonResponse
    {
        if (!isset(self::PAGE_DIRS[$page])) {
            return new JsonResponse(['error' => 'Invalid page. Allowed: ' . implode(', ', array_keys(self::PAGE_DIRS))], JsonResponse::HTTP_BAD_REQUEST);
        }

        $file = $request->files->get('file');

        if (!$file) {
            return new JsonResponse(['error' => 'No file uploaded'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $mimeType = $file->getMimeType();
        if (!in_array($mimeType, self::ALLOWED_IMAGE_MIME_TYPES, true)) {
            return new JsonResponse(['error' => 'Invalid file type. Allowed: jpg, png, webp, gif'], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $size = $file->getSize();
        } catch (\RuntimeException $e) {
            $size = 0;
        }

        if ($size > self::MAX_FILE_SIZE) {
            return new JsonResponse(['error' => 'File too large. Max 50MB'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $uploadDir = self::PAGE_MEDIA_DIR . '/' . $page;

        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
            return new JsonResponse(['error' => 'Failed to create upload directory'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

        $extension = $file->guessExtension() ?: pathinfo($file->getClientOriginalName(), PATHINFO_EXTENSION);
        $filename = uniqid('page_' . $page . '_', true) . '.' . $extension;
        $file->move($uploadDir, $filename);

        $url = '/uploads/pages/' . $page . '/' . $filename;

        return new JsonResponse([
            'url' => $url,
            'type' => 'image',
            'mimeType' => $mimeType,
            'size' => $size,
            'page' => $page
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/media/url', name: 'media_url', methods: ['POST'])]
    public function storeMediaUrl(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?: [];

        $url = $data['url'] ?? '';
        $page = $data['page'] ?? null;
        $type = $data['type'] ?? 'image';

        if (!$url) {
            return new JsonResponse(['error' => 'URL is required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        if ($page && !isset(self::PAGE_DIRS[$page])) {
            return new JsonResponse(['error' => 'Invalid page. Allowed: ' . implode(', ', array_keys(self::PAGE_DIRS))], JsonResponse::HTTP_BAD_REQUEST);
        }

        return new JsonResponse([
            'url' => $url,
            'type' => $type,
            'page' => $page,
            'stored' => false
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/pages', name: 'pages_list', methods: ['GET'])]
    public function listPages(): JsonResponse
    {
        $pages = [];
        foreach (self::PAGE_DIRS as $key => $dir) {
            $uploadDir = self::PAGE_MEDIA_DIR . '/' . $dir;
            $files = [];
            if (is_dir($uploadDir)) {
                $files = array_values(array_filter(scandir($uploadDir), fn ($f) => $f !== '.' && $f !== '..'));
            }
            $pages[] = [
                'name' => $key,
                'label' => ucfirst($key),
                'uploadDir' => '/uploads/pages/' . $dir,
                'files' => $files
            ];
        }

        return new JsonResponse($pages, JsonResponse::HTTP_OK);
    }
}

<?php

namespace App\Controller;

use App\Dto\ContactCreateRequest;
use App\Dto\ContactResponse;
use App\Dto\ContactUpdateRequest;
use App\Entity\Contact;
use App\Repository\ContactRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/contacts', name: 'api_contacts_')]
class ContactController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ContactRepository $repository,
        private UserRepository $userRepository,
        private SerializerInterface $serializer
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $contacts = $this->repository->findAll();
        $data = array_map(static fn (Contact $c) => ContactResponse::fromEntity($c)->toArray(), $contacts);
        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?: [];

        $user = $this->userRepository->find($data['userId'] ?? 0);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $contact = new Contact();
        $contact->setName($data['name'] ?? '');
        $contact->setEmail($data['email'] ?? '');
        $contact->setPhone($data['phone'] ?? null);
        $contact->setMessage($data['message'] ?? null);
        $contact->setIsRead((bool) ($data['isRead'] ?? false));
        $contact->setUser($user);

        $this->em->persist($contact);
        $this->em->flush();

        return new JsonResponse(ContactResponse::fromEntity($contact)->toArray(), JsonResponse::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $contact = $this->repository->find($id);
        if (!$contact) {
            return new JsonResponse(['error' => 'Contact not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        return new JsonResponse(ContactResponse::fromEntity($contact)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $contact = $this->repository->find($id);
        if (!$contact) {
            return new JsonResponse(['error' => 'Contact not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?: [];

        if (isset($data['name'])) $contact->setName((string) $data['name']);
        if (isset($data['email'])) $contact->setEmail((string) $data['email']);
        if (array_key_exists('phone', $data)) $contact->setPhone($data['phone'] ?: null);
        if (array_key_exists('message', $data)) $contact->setMessage($data['message'] ?: null);
        if (array_key_exists('isRead', $data)) $contact->setIsRead((bool) $data['isRead']);

        if (array_key_exists('userId', $data) && $data['userId'] !== null) {
            $user = $this->userRepository->find($data['userId']);
            if (!$user) {
                return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
            }
            $contact->setUser($user);
        }

        $this->em->flush();

        return new JsonResponse(ContactResponse::fromEntity($contact)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $contact = $this->repository->find($id);
        if (!$contact) {
            return new JsonResponse(['error' => 'Contact not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->em->remove($contact);
        $this->em->flush();

        return new JsonResponse(['message' => 'Contact deleted'], JsonResponse::HTTP_NO_CONTENT);
    }
}

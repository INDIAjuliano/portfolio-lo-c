<?php

namespace App\Controller;

use App\Dto\LoginRequest;
use App\Dto\RegisterRequest;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

#[Route('/api/auth')]
class AuthController
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private SerializerInterface $serializer,
        private TokenStorageInterface $tokenStorage
    ) {}

    #[Route('/register', name: 'auth_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $json = $request->getContent();
        $dto = $this->serializer->deserialize($json, RegisterRequest::class, 'json');

        if (empty($dto->email) || empty($dto->password)) {
            return new JsonResponse(['error' => 'Email and password are required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $existing = $this->em->getRepository(User::class)->findOneBy(['email' => $dto->email]);
        if ($existing) {
            return new JsonResponse(['error' => 'User already exists'], JsonResponse::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setEmail($dto->email);
        $user->setPassword($this->passwordHasher->hashPassword($user, $dto->password));
        if ($dto->firstName !== null) $user->setFirstName($dto->firstName);
        if ($dto->lastName !== null) $user->setLastName($dto->lastName);
        $user->setRoles(['ROLE_USER']);

        $this->em->persist($user);
        $this->em->flush();

        return new JsonResponse(['message' => 'User registered successfully'], JsonResponse::HTTP_CREATED);
    }

    #[Route('/login', name: 'auth_login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        return new JsonResponse(['message' => 'Use /api/auth/login with JSON body {email, password}'], JsonResponse::HTTP_OK);
    }

    #[Route('/me', name: 'auth_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->tokenStorage->getToken()?->getUser();

        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Unauthenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ], JsonResponse::HTTP_OK);
    }
}

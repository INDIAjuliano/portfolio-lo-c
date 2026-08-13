<?php

namespace App\Controller;

use App\Dto\LoginRequest;
use App\Dto\RegisterRequest;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
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
        private TokenStorageInterface $tokenStorage,
        private JWTTokenManagerInterface $jwtManager,
        private UserRepository $userRepository
    ) {}

    #[Route('/register', name: 'auth_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || empty($data['password'])) {
            return new JsonResponse(['error' => 'Email and password are required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $existing = $this->em->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existing) {
            return new JsonResponse(['error' => 'User already exists'], JsonResponse::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setPseudo($data['pseudo'] ?? null);
        $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
        if (!empty($data['firstName'])) $user->setFirstName($data['firstName']);
        if (!empty($data['lastName'])) $user->setLastName($data['lastName']);
        $user->setRoles(['ROLE_USER']);

        $this->em->persist($user);
        $this->em->flush();

        return new JsonResponse(['message' => 'User registered successfully'], JsonResponse::HTTP_CREATED);
    }

    #[Route('/login', name: 'auth_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?: [];

        $login = $data['email'] ?? $data['pseudo'] ?? $data['username'] ?? null;
        $password = $data['password'] ?? null;

        if (!$login || !$password) {
            return new JsonResponse(['error' => 'Email/pseudo and password are required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user = $this->userRepository->findOneBy(['email' => $login])
            ?? $this->userRepository->findOneByPseudo($login);

        if (!$user || !$this->passwordHasher->isPasswordValid($user, $password)) {
            return new JsonResponse(['error' => 'Invalid credentials'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $token = $this->jwtManager->create($user);

        return new JsonResponse(['token' => $token], JsonResponse::HTTP_OK);
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
            'subscriptionType' => $user->getSubscriptionType(),
            'isPremium' => $user->isPremiumUser(),
        ], JsonResponse::HTTP_OK);
    }
}

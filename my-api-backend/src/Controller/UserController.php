<?php

namespace App\Controller;

use App\Dto\UserCreateRequest;
use App\Dto\UserResponse;
use App\Dto\UserUpdateRequest;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\SubscriptionService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/users', name: 'api_users_')]
class UserController
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserRepository $repository,
        private UserPasswordHasherInterface $passwordHasher,
        private SerializerInterface $serializer,
        private SubscriptionService $subscriptionService
    ) {}

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $users = $this->repository->findAll();
        $data = array_map(static fn (User $u) => UserResponse::fromEntity($u)->toArray(), $users);
        return new JsonResponse($data, JsonResponse::HTTP_OK);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $dto = $this->serializer->deserialize($request->getContent(), UserCreateRequest::class, 'json');

        $user = new User();
        $user->setEmail($dto->email);
        $user->setPassword($this->passwordHasher->hashPassword($user, $dto->password));
        if ($dto->firstName !== null) $user->setFirstName($dto->firstName);
        if ($dto->lastName !== null) $user->setLastName($dto->lastName);
        if ($dto->bio !== null) $user->setBio($dto->bio);
        if ($dto->description !== null) $user->setDescription($dto->description);
        if ($dto->avatar !== null) $user->setAvatar($dto->avatar);
        if ($dto->linkedin !== null) $user->setLinkedin($dto->linkedin);
        if ($dto->twitter !== null) $user->setTwitter($dto->twitter);
        $user->setIsActive($dto->isActive);
        $user->setRoles($dto->roles ?: ['ROLE_USER']);

        $this->em->persist($user);
        $this->em->flush();

        return new JsonResponse(UserResponse::fromEntity($user)->toArray(), JsonResponse::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $user = $this->repository->find($id);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        return new JsonResponse(UserResponse::fromEntity($user)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->repository->find($id);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $dto = $this->serializer->deserialize($request->getContent(), UserUpdateRequest::class, 'json');

        if ($dto->email !== null) $user->setEmail($dto->email);
        if ($dto->password !== null) $user->setPassword($this->passwordHasher->hashPassword($user, $dto->password));
        if ($dto->firstName !== null) $user->setFirstName($dto->firstName);
        if ($dto->lastName !== null) $user->setLastName($dto->lastName);
        if ($dto->bio !== null) $user->setBio($dto->bio);
        if ($dto->description !== null) $user->setDescription($dto->description);
        if ($dto->avatar !== null) $user->setAvatar($dto->avatar);
        if ($dto->linkedin !== null) $user->setLinkedin($dto->linkedin);
        if ($dto->twitter !== null) $user->setTwitter($dto->twitter);
        if ($dto->isActive !== null) $user->setIsActive($dto->isActive);
        if ($dto->roles !== null) $user->setRoles($dto->roles);

        $user->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        return new JsonResponse(UserResponse::fromEntity($user)->toArray(), JsonResponse::HTTP_OK);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->repository->find($id);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->em->remove($user);
        $this->em->flush();

        return new JsonResponse(['message' => 'User deleted'], JsonResponse::HTTP_NO_CONTENT);
    }

    #[Route('/{id}/upgrade-premium', name: 'upgrade_premium', methods: ['PUT'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function upgradeToPremium(int $id): JsonResponse
    {
        $user = $this->repository->find($id);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->subscriptionService->upgradeToPremium($user);

        return new JsonResponse([
            'message' => 'User upgraded to premium successfully',
            'user' => UserResponse::fromEntity($user)->toArray(),
        ], JsonResponse::HTTP_OK);
    }

    #[Route('/{id}/downgrade-free', name: 'downgrade_free', methods: ['PUT'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function downgradeToFree(int $id): JsonResponse
    {
        $user = $this->repository->find($id);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->subscriptionService->downgradeToFree($user);

        return new JsonResponse([
            'message' => 'User downgraded to free successfully',
            'user' => UserResponse::fromEntity($user)->toArray(),
        ], JsonResponse::HTTP_OK);
    }
}

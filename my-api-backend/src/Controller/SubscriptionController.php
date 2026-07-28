<?php

namespace App\Controller;

use App\Entity\Contact;
use App\Entity\User;
use App\Repository\ContactRepository;
use App\Repository\UserRepository;
use App\Service\SubscriptionService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

#[Route('/api/subscription')]
class SubscriptionController
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserRepository $userRepository,
        private ContactRepository $contactRepository,
        private SubscriptionService $subscriptionService
    ) {}

    #[Route('/status', name: 'api_subscription_status', methods: ['GET'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function status(TokenStorageInterface $tokenStorage): JsonResponse
    {
        $user = $tokenStorage->getToken()?->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Unauthenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse($this->subscriptionService->getUserSubscriptionStatus($user), JsonResponse::HTTP_OK);
    }

    #[Route('/request-premium', name: 'api_subscription_request_premium', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function requestPremium(
        \Symfony\Component\HttpFoundation\Request $request,
        TokenStorageInterface $tokenStorage
    ): JsonResponse {
        $user = $tokenStorage->getToken()?->getUser();
        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Unauthenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        if ($user->isPremiumUser()) {
            return new JsonResponse(['error' => 'You are already a premium user'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $data = json_decode($request->getContent(), true);
        $message = $data['message'] ?? 'I would like to upgrade to premium';

        $contact = new Contact();
        $contact->setUser($user);
        $contact->setMessage('PREMIUM_REQUEST: ' . $message);
        $contact->setIsRead(false);

        $this->em->persist($contact);
        $this->em->flush();

        return new JsonResponse([
            'message' => 'Your premium request has been sent to the admin. You will be contacted shortly.',
            'contactId' => $contact->getId(),
        ], JsonResponse::HTTP_CREATED);
    }
}

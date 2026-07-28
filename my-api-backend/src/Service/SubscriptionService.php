<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\Theme;
use App\Repository\UserRepository;
use App\Repository\ThemeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

class SubscriptionService
{
    public const DEFAULT_THEME_SLUG = 'light';
    public const FREE_TYPE = 'free';
    public const PREMIUM_TYPE = 'premium';

    public function __construct(
        private EntityManagerInterface $em,
        private UserRepository $userRepository,
        private ThemeRepository $themeRepository
    ) {}

    public function getUserSubscriptionStatus(User $user): array
    {
        return [
            'subscriptionType' => $user->getSubscriptionType(),
            'isPremium' => $user->isPremiumUser(),
            'hasActiveSubscription' => $user->hasActiveSubscription(),
            'subscriptionExpiresAt' => $user->getSubscriptionExpiresAt()?->format('Y-m-d\TH:i:s'),
            'canInstallThemes' => $user->isPremiumUser(),
        ];
    }

    public function canApplyTheme(User $user, Theme $theme): bool
    {
        if ($user->isPremiumUser()) {
            return true;
        }

        return $theme->getSlug() === self::DEFAULT_THEME_SLUG;
    }

    public function applyTheme(User $user, Theme $theme): JsonResponse
    {
        if (!$this->canApplyTheme($user, $theme)) {
            return new JsonResponse([
                'error' => 'Upgrade required',
                'message' => 'Only premium users can install this theme. Please contact admin to upgrade your account.',
            ], JsonResponse::HTTP_FORBIDDEN);
        }

        $user->setTheme($theme->getSlug());
        $this->em->flush();

        return new JsonResponse([
            'message' => 'Theme applied successfully',
            'theme' => $theme->getSlug(),
        ], JsonResponse::HTTP_OK);
    }

    public function upgradeToPremium(User $user): void
    {
        $user->setSubscriptionType(self::PREMIUM_TYPE);
        $user->setSubscriptionExpiresAt(null);
        $this->em->flush();
    }

    public function downgradeToFree(User $user): void
    {
        $user->setSubscriptionType(self::FREE_TYPE);
        $user->setSubscriptionExpiresAt(null);
        $this->em->flush();
    }

    public function getDefaultTheme(): ?Theme
    {
        return $this->themeRepository->findOneBy(['slug' => self::DEFAULT_THEME_SLUG, 'isActive' => true]);
    }
}

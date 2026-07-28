<?php
// src/Entity/UserSubscription.php

namespace App\Entity;

use App\Repository\UserSubscriptionRepository;
use DateTime;
use DateTimeInterface;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserSubscriptionRepository::class)]
#[ORM\Table(name: 'user_subscription')]
#[ORM\HasLifecycleCallbacks]
class UserSubscription
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'subscriptions')]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotNull]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Theme::class, inversedBy: 'subscriptions')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Theme $theme = null;

    #[ORM\Column(type: Types::STRING, length: 50)]
    #[Assert\Choice(choices: ['free', 'premium', 'enterprise'])]
    private ?string $subscriptionType = 'free';

    #[ORM\Column(type: Types::DATETIME_MUTABLE, options: ['default' => 'CURRENT_TIMESTAMP'])]
    private ?DateTimeInterface $startDate = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?DateTimeInterface $endDate = null;

    #[ORM\Column(type: Types::BOOLEAN)]
    private bool $isActive = true;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $paymentId = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, options: ['default' => 'CURRENT_TIMESTAMP'])]
    private ?DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?DateTimeInterface $updatedAt = null;

    public function __construct()
    {
        $this->startDate = new DateTime();
        $this->createdAt = new DateTime();
    }

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new DateTime();
        if ($this->startDate === null) {
            $this->startDate = new DateTime();
        }
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new DateTime();
    }

    // GETTERS ET SETTERS

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;
        return $this;
    }

    public function getTheme(): ?Theme
    {
        return $this->theme;
    }

    public function setTheme(?Theme $theme): self
    {
        $this->theme = $theme;
        return $this;
    }

    public function getSubscriptionType(): ?string
    {
        return $this->subscriptionType;
    }

    public function setSubscriptionType(string $subscriptionType): self
    {
        $this->subscriptionType = $subscriptionType;
        return $this;
    }

    public function getStartDate(): ?DateTimeInterface
    {
        return $this->startDate;
    }

    public function setStartDate(DateTimeInterface $startDate): self
    {
        $this->startDate = $startDate;
        return $this;
    }

    public function getEndDate(): ?DateTimeInterface
    {
        return $this->endDate;
    }

    public function setEndDate(?DateTimeInterface $endDate): self
    {
        $this->endDate = $endDate;
        return $this;
    }

    public function isActive(): bool
    {
        if (!$this->isActive) {
            return false;
        }

        if ($this->endDate !== null && $this->endDate < new DateTime()) {
            return false;
        }

        return true;
    }

    public function setIsActive(bool $isActive): self
    {
        $this->isActive = $isActive;
        return $this;
    }

    public function getPaymentId(): ?string
    {
        return $this->paymentId;
    }

    public function setPaymentId(?string $paymentId): self
    {
        $this->paymentId = $paymentId;
        return $this;
    }

    public function getCreatedAt(): ?DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function getDuration(): string
    {
        if ($this->endDate === null) {
            return 'Illimité';
        }

        $interval = $this->startDate->diff($this->endDate);
        return $interval->format('%a jours, %h heures');
    }

    public function isExpired(): bool
    {
        if ($this->endDate === null) {
            return false;
        }
        return $this->endDate < new DateTime();
    }

    public function getRemainingDays(): ?int
    {
        if ($this->endDate === null) {
            return null;
        }

        $now = new DateTime();
        if ($this->endDate < $now) {
            return 0;
        }

        return $now->diff($this->endDate)->days;
    }
}

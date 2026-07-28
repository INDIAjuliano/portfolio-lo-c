<?php
// src/Entity/User.php

namespace App\Entity;

use App\Repository\UserRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\HasLifecycleCallbacks]
#[UniqueEntity(fields: ['email'], message: 'Cet email est déjà utilisé')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Assert\NotBlank(message: 'L\'email est obligatoire')]
    #[Assert\Email(message: 'Veuillez entrer un email valide')]
    private ?string $email = null;

    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'Le mot de passe est obligatoire')]
    #[Assert\Length(min: 6, minMessage: 'Le mot de passe doit faire au moins 6 caractères')]
    private ?string $password = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Assert\Length(max: 100)]
    private ?string $firstName = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Assert\Length(max: 100)]
    private ?string $lastName = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $bio = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 500, nullable: true)]
    #[Assert\Url(message: 'L\'avatar doit être une URL valide')]
    private ?string $avatar = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Url(message: 'Le lien LinkedIn doit être une URL valide')]
    private ?string $linkedin = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Url(message: 'Le lien Twitter doit être une URL valide')]
    private ?string $twitter = null;

    #[ORM\Column(type: Types::BOOLEAN)]
    private bool $isActive = true;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private ?DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?DateTimeImmutable $lastLoginAt = null;

    #[ORM\Column(type: Types::STRING, length: 50, options: ['default' => 'free'])]
    #[Assert\Choice(choices: ['free', 'premium', 'enterprise'])]
    private string $subscriptionType = 'free';

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?DateTimeImmutable $subscriptionExpiresAt = null;

    #[ORM\Column(type: Types::JSON, options: ['default' => '{"theme": "light", "layout": "default"}'])]
    private array $themePreferences = ['theme' => 'light', 'layout' => 'default'];

    #[ORM\Column(type: Types::BOOLEAN)]
    private bool $emailVerified = false;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $resetToken = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?DateTimeImmutable $resetTokenExpiresAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?DateTimeImmutable $deletedAt = null;

    // RELATIONS
    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Contact::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $contacts;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: UserSubscription::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $subscriptions;

    public function __construct()
    {
        $this->createdAt = new DateTimeImmutable();
        $this->isActive = true;
        $this->emailVerified = false;
        $this->roles = ['ROLE_USER'];
        $this->contacts = new ArrayCollection();
        $this->subscriptions = new ArrayCollection();
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new DateTimeImmutable();
    }

    // GETTERS ET SETTERS

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;
        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;
        return $this;
    }

    public function eraseCredentials(): void
    {
        // Efface les données sensibles
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(?string $firstName): self
    {
        $this->firstName = $firstName;
        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(?string $lastName): self
    {
        $this->lastName = $lastName;
        return $this;
    }

    public function getFullName(): string
    {
        return trim($this->firstName . ' ' . $this->lastName) ?: $this->email;
    }

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function setBio(?string $bio): self
    {
        $this->bio = $bio;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;
        return $this;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(?string $avatar): self
    {
        $this->avatar = $avatar;
        return $this;
    }

    public function getLinkedin(): ?string
    {
        return $this->linkedin;
    }

    public function setLinkedin(?string $linkedin): self
    {
        $this->linkedin = $linkedin;
        return $this;
    }

    public function getTwitter(): ?string
    {
        return $this->twitter;
    }

    public function setTwitter(?string $twitter): self
    {
        $this->twitter = $twitter;
        return $this;
    }

    public function isActive(): bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): self
    {
        $this->isActive = $isActive;
        return $this;
    }

    public function getCreatedAt(): ?DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?DateTimeImmutable $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function getLastLoginAt(): ?DateTimeImmutable
    {
        return $this->lastLoginAt;
    }

    public function setLastLoginAt(?DateTimeImmutable $lastLoginAt): self
    {
        $this->lastLoginAt = $lastLoginAt;
        return $this;
    }

    public function getSubscriptionType(): string
    {
        return $this->subscriptionType;
    }

    public function setSubscriptionType(string $subscriptionType): self
    {
        $this->subscriptionType = $subscriptionType;
        return $this;
    }

    public function getSubscriptionExpiresAt(): ?DateTimeImmutable
    {
        return $this->subscriptionExpiresAt;
    }

    public function setSubscriptionExpiresAt(?DateTimeImmutable $subscriptionExpiresAt): self
    {
        $this->subscriptionExpiresAt = $subscriptionExpiresAt;
        return $this;
    }

    public function isPremiumUser(): bool
    {
        return $this->subscriptionType === 'premium' && $this->hasActiveSubscription();
    }

    public function hasActiveSubscription(): bool
    {
        if ($this->subscriptionType === 'free') {
            return false;
        }

        if ($this->subscriptionExpiresAt === null) {
            return true;
        }

        return $this->subscriptionExpiresAt > new DateTimeImmutable();
    }

    public function getThemePreferences(): array
    {
        return $this->themePreferences;
    }

    public function setThemePreferences(array $themePreferences): self
    {
        $this->themePreferences = $themePreferences;
        return $this;
    }

    public function getTheme(): string
    {
        return $this->themePreferences['theme'] ?? 'light';
    }

    public function setTheme(string $theme): self
    {
        $this->themePreferences['theme'] = $theme;
        return $this;
    }

    public function isEmailVerified(): bool
    {
        return $this->emailVerified;
    }

    public function setEmailVerified(bool $emailVerified): self
    {
        $this->emailVerified = $emailVerified;
        return $this;
    }

    public function getResetToken(): ?string
    {
        return $this->resetToken;
    }

    public function setResetToken(?string $resetToken): self
    {
        $this->resetToken = $resetToken;
        return $this;
    }

    public function getResetTokenExpiresAt(): ?DateTimeImmutable
    {
        return $this->resetTokenExpiresAt;
    }

    public function setResetTokenExpiresAt(?DateTimeImmutable $resetTokenExpiresAt): self
    {
        $this->resetTokenExpiresAt = $resetTokenExpiresAt;
        return $this;
    }

    public function getDeletedAt(): ?DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?DateTimeImmutable $deletedAt): self
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }

    public function softDelete(): self
    {
        $this->deletedAt = new DateTimeImmutable();
        $this->isActive = false;
        return $this;
    }

    public function restore(): self
    {
        $this->deletedAt = null;
        $this->isActive = true;
        return $this;
    }

    // RELATIONS

    public function getContacts(): Collection
    {
        return $this->contacts;
    }

    public function addContact(Contact $contact): self
    {
        if (!$this->contacts->contains($contact)) {
            $this->contacts->add($contact);
            $contact->setUser($this);
        }
        return $this;
    }

    public function removeContact(Contact $contact): self
    {
        if ($this->contacts->removeElement($contact)) {
            if ($contact->getUser() === $this) {
                $contact->setUser(null);
            }
        }
        return $this;
    }

    public function getSubscriptions(): Collection
    {
        return $this->subscriptions;
    }

    public function addSubscription(UserSubscription $subscription): self
    {
        if (!$this->subscriptions->contains($subscription)) {
            $this->subscriptions->add($subscription);
            $subscription->setUser($this);
        }
        return $this;
    }

    public function removeSubscription(UserSubscription $subscription): self
    {
        if ($this->subscriptions->removeElement($subscription)) {
            if ($subscription->getUser() === $this) {
                $subscription->setUser(null);
            }
        }
        return $this;
    }
}

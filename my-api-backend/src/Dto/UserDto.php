<?php

namespace App\Dto;

use App\Entity\User;

readonly class UserResponse
{
    public int $id;
    public string $email;
    public ?string $firstName;
    public ?string $lastName;
    public ?string $bio;
    public ?string $description;
    public ?string $avatar;
    public ?string $linkedin;
    public ?string $twitter;
    public bool $isActive;
    public array $roles;
    public ?\DateTimeImmutable $createdAt;
    public ?\DateTimeImmutable $updatedAt;

    private function __construct(
        int $id,
        string $email,
        ?string $firstName,
        ?string $lastName,
        ?string $bio,
        ?string $description,
        ?string $avatar,
        ?string $linkedin,
        ?string $twitter,
        bool $isActive,
        array $roles,
        ?\DateTimeImmutable $createdAt,
        ?\DateTimeImmutable $updatedAt
    ) {
        $this->id = $id;
        $this->email = $email;
        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->bio = $bio;
        $this->description = $description;
        $this->avatar = $avatar;
        $this->linkedin = $linkedin;
        $this->twitter = $twitter;
        $this->isActive = $isActive;
        $this->roles = $roles;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }

    public static function fromEntity(User $user): self
    {
        return new self(
            id: $user->getId(),
            email: $user->getEmail(),
            firstName: $user->getFirstName(),
            lastName: $user->getLastName(),
            bio: $user->getBio(),
            description: $user->getDescription(),
            avatar: $user->getAvatar(),
            linkedin: $user->getLinkedin(),
            twitter: $user->getTwitter(),
            isActive: $user->isActive(),
            roles: $user->getRoles(),
            createdAt: $user->getCreatedAt(),
            updatedAt: $user->getUpdatedAt()
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'firstName' => $this->firstName,
            'lastName' => $this->lastName,
            'bio' => $this->bio,
            'description' => $this->description,
            'avatar' => $this->avatar,
            'linkedin' => $this->linkedin,
            'twitter' => $this->twitter,
            'isActive' => $this->isActive,
            'roles' => $this->roles,
            'createdAt' => $this->createdAt ? $this->createdAt->format('Y-m-d\TH:i:s') : null,
            'updatedAt' => $this->updatedAt ? $this->updatedAt->format('Y-m-d\TH:i:s') : null,
        ];
    }
}

class LoginRequest
{
    public string $email;
    public string $password;
}

class RegisterRequest
{
    public string $email;
    public string $password;
    public ?string $firstName;
    public ?string $lastName;
    public string $plainPassword;
}

class UserCreateRequest
{
    public string $email;
    public string $password;
    public ?string $firstName;
    public ?string $lastName;
    public ?string $bio;
    public ?string $description;
    public ?string $avatar;
    public ?string $linkedin;
    public ?string $twitter;
    public bool $isActive;
    public array $roles;
}

class UserUpdateRequest
{
    public ?string $email;
    public ?string $password;
    public ?string $firstName;
    public ?string $lastName;
    public ?string $bio;
    public ?string $description;
    public ?string $avatar;
    public ?string $linkedin;
    public ?string $twitter;
    public ?bool $isActive;
    public ?array $roles;
}

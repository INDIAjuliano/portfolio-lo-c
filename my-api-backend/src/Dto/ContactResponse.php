<?php

namespace App\Dto;

use App\Entity\Contact;

readonly class ContactResponse
{
    public int $id;
    public string $name;
    public string $email;
    public ?string $phone;
    public ?string $message;
    public bool $isRead;
    public ?int $userId;
    public ?\DateTimeImmutable $createdAt;

    private function __construct(
        int $id,
        string $name,
        string $email,
        ?string $phone,
        ?string $message,
        bool $isRead,
        ?int $userId,
        ?\DateTimeImmutable $createdAt
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->phone = $phone;
        $this->message = $message;
        $this->isRead = $isRead;
        $this->userId = $userId;
        $this->createdAt = $createdAt;
    }

    public static function fromEntity(Contact $contact): self
    {
        return new self(
            id: $contact->getId(),
            name: $contact->getName(),
            email: $contact->getEmail(),
            phone: $contact->getPhone(),
            message: $contact->getMessage(),
            isRead: $contact->isRead(),
            userId: $contact->getUser()?->getId(),
            createdAt: $contact->getCreatedAt()
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'message' => $this->message,
            'isRead' => $this->isRead,
            'userId' => $this->userId,
            'createdAt' => $this->createdAt ? $this->createdAt->format('Y-m-d\TH:i:s') : null,
        ];
    }
}

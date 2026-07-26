<?php

namespace App\Dto;

class ContactUpdateRequest
{
    public ?string $name;
    public ?string $email;
    public ?string $phone;
    public ?string $message;
    public ?bool $isRead;
    public ?int $userId;
}

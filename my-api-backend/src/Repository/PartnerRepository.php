<?php

namespace App\Repository;

use App\Entity\Partner;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class PartnerRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Partner::class);
    }

    public function findAllPublished(): array
    {
        return $this->createQueryBuilder('p')
            ->where('p.isPublished = :published')
            ->setParameter('published', true)
            ->orderBy('p.position', 'ASC')
            ->addOrderBy('p.id', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findAllOrdered(): array
    {
        return $this->createQueryBuilder('p')
            ->orderBy('p.position', 'ASC')
            ->addOrderBy('p.id', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findSiteLogo(): ?Partner
    {
        return $this->createQueryBuilder('p')
            ->where('p.isSiteLogo = :siteLogo')
            ->setParameter('siteLogo', true)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}

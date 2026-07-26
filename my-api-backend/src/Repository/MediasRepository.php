<?php

namespace App\Repository;

use App\Entity\Medias;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Medias>
 */
class MediasRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Medias::class);
    }

    public function findPublished(?string $type = null): array
    {
        $qb = $this->createQueryBuilder('m')
            ->andWhere('m.isPublished = :published')
            ->setParameter('published', true)
            ->orderBy('m.id', 'DESC');

        if ($type !== null) {
            $qb->andWhere('m.type = :type')
                ->setParameter('type', $type);
        }

        return $qb->getQuery()->getResult();
    }

    public function findFeatured(): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.isPublished = :published')
            ->setParameter('published', true)
            ->andWhere('m.isFeatured = :featured')
            ->setParameter('featured', true)
            ->orderBy('m.id', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findBySlug(string $slug): ?Medias
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.slug = :slug')
            ->setParameter('slug', $slug)
            ->getQuery()
            ->getOneOrNullResult();
    }
}

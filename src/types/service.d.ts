import { PrismaClient } from '@prisma/client';
import type { Session } from 'next-auth';

export type PublicServiceContext = {
    prisma: PrismaClient;
    session: Session | null;
}

export type PrivateServiceContext = {
    prisma: PrismaClient;
    session: Session;
}
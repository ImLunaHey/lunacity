import { TRPCError } from '@trpc/server';
import {
  PrismaClientValidationError,
  PrismaClientExtensionError,
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime';

const camelToSnakeCase = (string: string) =>
  string.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).replace('_', '');

export const handleTRPCError = (error: unknown) => {
  if (
    error instanceof PrismaClientValidationError ||
    error instanceof PrismaClientExtensionError ||
    error instanceof PrismaClientInitializationError ||
    error instanceof PrismaClientKnownRequestError ||
    error instanceof PrismaClientRustPanicError ||
    error instanceof PrismaClientUnknownRequestError
  ) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: camelToSnakeCase(error.constructor.name).toUpperCase(),
    });
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'UNKNOWN_ERROR',
  });
};

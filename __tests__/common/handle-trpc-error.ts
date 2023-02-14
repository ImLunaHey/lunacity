import { handleTRPCError } from '@app/common/handle-trpc-error';
import { PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientRustPanicError, PrismaClientUnknownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';

import '@testing-library/jest-dom';

describe('handleTRPCError', () => {
    it('throws UNKNOWN_ERROR when a non-prisma error is supplied', () => {
        expect(() => {
            handleTRPCError(new Error('test'));
        }).toThrowError('UNKNOWN_ERROR');
    });

    it('throws INTERNAL_SERVER_ERROR when a prisma error is supplied', () => {
        expect(() => {
            handleTRPCError(
                new PrismaClientValidationError()
            );
        }).toThrowError('PRISMA_CLIENT_VALIDATION_ERROR');
    });

    it('throws INTERNAL_SERVER_ERROR when a prisma error is supplied', () => {
        expect(() => {
            handleTRPCError(
                new PrismaClientInitializationError('', '')
            );
        }).toThrowError('PRISMA_CLIENT_INITIALIZATION_ERROR');
    });

    it('throws INTERNAL_SERVER_ERROR when a prisma error is supplied', () => {
        expect(() => {
            handleTRPCError(
                new PrismaClientKnownRequestError('', { clientVersion: '', code: '' })
            );
        }).toThrowError('PRISMA_CLIENT_KNOWN_REQUEST_ERROR');
    });

    it('throws INTERNAL_SERVER_ERROR when a prisma error is supplied', () => {
        expect(() => {
            handleTRPCError(
                new PrismaClientRustPanicError('', '')
            );
        }).toThrowError('PRISMA_CLIENT_RUST_PANIC_ERROR');
    });

    it('throws INTERNAL_SERVER_ERROR when a prisma error is supplied', () => {
        expect(() => {
            handleTRPCError(
                new PrismaClientUnknownRequestError('', { clientVersion: '' })
            );
        }).toThrowError('PRISMA_CLIENT_UNKNOWN_REQUEST_ERROR');
    });
});

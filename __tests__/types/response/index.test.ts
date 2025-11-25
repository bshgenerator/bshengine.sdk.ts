import { describe, it, expect } from 'vitest';
import { BshResponse, BshError, isOk } from '../../../src/types/response';

describe('BshResponse', () => {
    describe('isOk', () => {
        it('should return false for undefined response', () => {
            expect(isOk(undefined)).toBe(false);
        });

        it('should return true for 2xx status codes', () => {
            const response: BshResponse<unknown> = {
                data: [],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            expect(isOk(response)).toBe(true);

            response.code = 201;
            expect(isOk(response)).toBe(true);

            response.code = 299;
            expect(isOk(response)).toBe(true);
        });

        it('should return false for non-2xx status codes', () => {
            const response: BshResponse<unknown> = {
                data: [],
                code: 400,
                status: 'Bad Request',
                error: 'Error message',
                timestamp: Date.now()
            };
            expect(isOk(response)).toBe(false);

            response.code = 404;
            expect(isOk(response)).toBe(false);

            response.code = 500;
            expect(isOk(response)).toBe(false);
        });
    });
});

describe('BshError', () => {
    it('should create error with status and endpoint', () => {
        const error = new BshError(404, '/api/users/1');
        expect(error.status).toBe(404);
        expect(error.endpoint).toBe('/api/users/1');
        expect(error.name).toBe('BshError');
        expect(error).toBeInstanceOf(Error);
    });

    it('should create error with response', () => {
        const response: BshResponse<unknown> = {
            data: [],
            code: 404,
            status: 'Not Found',
            error: 'Resource not found',
            timestamp: Date.now()
        };
        const error = new BshError(404, '/api/users/1', response);
        expect(error.status).toBe(404);
        expect(error.endpoint).toBe('/api/users/1');
        expect(error.response).toEqual(response);
        expect(response.endpoint).toBe('/api/users/1');
    });

    it('should serialize response in error message', () => {
        const response: BshResponse<unknown> = {
            data: [],
            code: 500,
            status: 'Internal Server Error',
            error: 'Server error',
            timestamp: Date.now()
        };
        const error = new BshError(500, '/api/users', response);
        expect(error.message).toContain('500');
        expect(error.message).toContain('Internal Server Error');
    });
});


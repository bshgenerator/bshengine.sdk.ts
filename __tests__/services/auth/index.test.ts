import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../../src/services/auth';
import { BshClient } from '../../../src/client/bsh-client';
import { BshUser, BshUserInit } from '../../../src/types';

describe('AuthService', () => {
    let authService: AuthService;
    let mockClient: BshClient;
    let mockGet: ReturnType<typeof vi.fn>;
    let mockPost: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockGet = vi.fn();
        mockPost = vi.fn();
        mockClient = {
            get: mockGet,
            post: mockPost,
            put: vi.fn(),
            delete: vi.fn(),
            patch: vi.fn(),
            download: vi.fn(),
        } as unknown as BshClient;
        authService = new AuthService(mockClient);
    });

    describe('login', () => {
        it('should call client.post with correct parameters', async () => {
            const mockResponse = {
                data: [{ access: 'access-token', refresh: 'refresh-token' }],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const params = {
                payload: { email: 'test@example.com', password: 'password123' },
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await authService.login(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/auth/login',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: params.payload,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'auth.login',
            });
            expect(result).toEqual(mockResponse);
        });

        it('should handle login with callbacks', async () => {
            const mockResponse = {
                data: [{ access: 'token', refresh: 'refresh' }],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const onSuccess = vi.fn();
            const onError = vi.fn();

            await authService.login({
                payload: { email: 'test@example.com', password: 'pass' },
                onSuccess,
                onError
            });

            expect(mockPost).toHaveBeenCalled();
        });
    });

    describe('register', () => {
        it('should call client.post with correct parameters', async () => {
            const mockUser: BshUser = {
                userId: '1',
                email: 'test@example.com',
                roles: [],
                status: 'ACTIVATED',
                profile: { firstName: 'Test', lastName: 'User' },
                persistenceId: '1'
            };
            const mockResponse = {
                data: [mockUser],
                code: 201,
                status: 'Created',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const userInit: BshUserInit = {
                email: 'test@example.com',
                password: 'password123',
                profile: { firstName: 'Test', lastName: 'User' }
            } as BshUserInit;

            const params = {
                payload: userInit,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await authService.register(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/auth/register',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: params.payload,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'auth.register',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('refreshToken', () => {
        it('should call client.post with correct parameters', async () => {
            const mockResponse = {
                data: [{ access: 'new-access-token', refresh: 'new-refresh-token' }],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const params = {
                payload: { refresh: 'old-refresh-token' },
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await authService.refreshToken(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/auth/refresh',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: params.payload,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'auth.refreshToken',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('forgetPassword', () => {
        it('should call client.post with correct parameters', async () => {
            const mockResponse = {
                data: [{}],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const params = {
                payload: { email: 'test@example.com' },
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await authService.forgetPassword(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/auth/forget-password',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: params.payload,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'auth.forgetPassword',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('resetPassword', () => {
        it('should call client.post with correct parameters', async () => {
            const mockResponse = {
                data: [{}],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const params = {
                payload: {
                    email: 'test@example.com',
                    code: '123456',
                    newPassword: 'newpassword123'
                },
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await authService.resetPassword(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/auth/reset-password',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: params.payload,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'auth.resetPassword',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('activateAccount', () => {
        it('should call client.post with correct parameters', async () => {
            const mockResponse = {
                data: [{}],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const params = {
                payload: {
                    email: 'test@example.com',
                    code: '123456'
                },
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await authService.activateAccount(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/auth/activate-account',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: params.payload,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'auth.activateAccount',
            });
            expect(result).toEqual(mockResponse);
        });
    });
});


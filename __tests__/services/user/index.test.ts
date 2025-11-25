import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../../../src/services/user';
import { BshClient } from '../../../src/client/bsh-client';
import { BshUser, BshUserInit, BshSearch } from '../../../src/types';

describe('UserService', () => {
    let userService: UserService;
    let mockClient: BshClient;
    let mockGet: ReturnType<typeof vi.fn>;
    let mockPost: ReturnType<typeof vi.fn>;
    let mockPut: ReturnType<typeof vi.fn>;
    let mockDelete: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockGet = vi.fn();
        mockPost = vi.fn();
        mockPut = vi.fn();
        mockDelete = vi.fn();
        mockClient = {
            get: mockGet,
            post: mockPost,
            put: mockPut,
            delete: mockDelete,
            patch: vi.fn(),
            download: vi.fn(),
        } as unknown as BshClient;
        userService = new UserService(mockClient);
    });

    describe('me', () => {
        it('should call client.get with correct parameters', async () => {
            const mockUser: BshUser = {
                id: '1',
                email: 'test@example.com',
                profile: { firstName: 'Test', lastName: 'User' }
            } as BshUser;
            const mockResponse = {
                data: [mockUser],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockGet.mockResolvedValue(mockResponse);

            const params = {
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await userService.me(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/users/me',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('init', () => {
        it('should call client.post with correct parameters', async () => {
            const mockUser: BshUser = {
                id: '1',
                email: 'test@example.com',
                profile: { firstName: 'Test', lastName: 'User' }
            } as BshUser;
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

            const result = await userService.init(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/users/init',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: userInit,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('updateProfile', () => {
        it('should call client.put with correct parameters', async () => {
            const mockUser: BshUser = {
                id: '1',
                email: 'test@example.com',
                profile: { firstName: 'Updated', lastName: 'User' }
            } as BshUser;
            const mockResponse = {
                data: [mockUser],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPut.mockResolvedValue(mockResponse);

            const profileUpdate = { firstName: 'Updated' };
            const params = {
                payload: profileUpdate,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await userService.updateProfile(params);

            expect(mockPut).toHaveBeenCalledWith({
                path: '/api/users/profile',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: profileUpdate,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('updatePicture', () => {
        it('should call client.post with FormData', async () => {
            const mockUser: BshUser = {
                id: '1',
                email: 'test@example.com',
                profile: { firstName: 'Test', lastName: 'User' }
            } as BshUser;
            const mockResponse = {
                data: [mockUser],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const mockFile = new File(['test'], 'picture.jpg', { type: 'image/jpeg' });
            const params = {
                payload: mockFile,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await userService.updatePicture(params);

            expect(mockPost).toHaveBeenCalled();
            const callArgs = mockPost.mock.calls[0][0];
            expect(callArgs.path).toBe('/api/users/picture');
            expect(callArgs.options.body).toBeInstanceOf(FormData);
            expect(result).toEqual(mockResponse);
        });
    });

    describe('updatePassword', () => {
        it('should call client.put with correct parameters', async () => {
            const mockResponse = {
                data: [{ message: 'Password updated successfully' }],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPut.mockResolvedValue(mockResponse);

            const passwordUpdate = {
                currentPassword: 'oldpass',
                newPassword: 'newpass'
            };
            const params = {
                payload: passwordUpdate,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await userService.updatePassword(params);

            expect(mockPut).toHaveBeenCalledWith({
                path: '/api/users/password',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: passwordUpdate,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('getById', () => {
        it('should call client.get with correct parameters', async () => {
            const mockUser: BshUser = {
                id: '1',
                email: 'test@example.com',
                profile: { firstName: 'Test', lastName: 'User' }
            } as BshUser;
            const mockResponse = {
                data: [mockUser],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockGet.mockResolvedValue(mockResponse);

            const params = {
                id: '1',
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await userService.getById(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/users/1',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('search', () => {
        it('should call client.post with correct parameters', async () => {
            const mockUser: BshUser = {
                id: '1',
                email: 'test@example.com',
                profile: { firstName: 'Test', lastName: 'User' }
            } as BshUser;
            const mockResponse = {
                data: [mockUser],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const searchParams: BshSearch<BshUser> = {
                filters: [],
                sort: [],
                pagination: { page: 1, size: 10 }
            };
            const params = {
                payload: searchParams,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await userService.search(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/users/search',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: searchParams,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('list', () => {
        it('should call client.get with query params', async () => {
            const mockUser: BshUser = {
                id: '1',
                email: 'test@example.com',
                profile: { firstName: 'Test', lastName: 'User' }
            } as BshUser;
            const mockResponse = {
                data: [mockUser],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockGet.mockResolvedValue(mockResponse);

            const params = {
                queryParams: {
                    page: '1',
                    size: '10',
                    sort: 'email',
                    filter: 'active'
                },
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await userService.list(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/users?page=1&size=10&sort=email&filter=active',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            });
            expect(result).toEqual(mockResponse);
        });

        it('should call client.get without query params', async () => {
            const mockUser: BshUser = {
                id: '1',
                email: 'test@example.com',
                profile: { firstName: 'Test', lastName: 'User' }
            } as BshUser;
            const mockResponse = {
                data: [mockUser],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockGet.mockResolvedValue(mockResponse);

            const params = {
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await userService.list(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/users',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('update', () => {
        it('should call client.put with correct parameters', async () => {
            const mockUser: BshUser = {
                id: '1',
                email: 'updated@example.com',
                profile: { firstName: 'Updated', lastName: 'User' }
            } as BshUser;
            const mockResponse = {
                data: [mockUser],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPut.mockResolvedValue(mockResponse);

            const userUpdate: Partial<BshUser> = {
                email: 'updated@example.com'
            };
            const params = {
                payload: userUpdate,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await userService.update(params);

            expect(mockPut).toHaveBeenCalledWith({
                path: '/api/users',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: userUpdate,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('deleteById', () => {
        it('should call client.delete with correct parameters', async () => {
            const mockUser: BshUser = {
                id: '1',
                email: 'test@example.com',
                profile: { firstName: 'Test', lastName: 'User' }
            } as BshUser;
            const mockResponse = {
                data: [mockUser],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockDelete.mockResolvedValue(mockResponse);

            const params = {
                id: '1',
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await userService.deleteById(params);

            expect(mockDelete).toHaveBeenCalledWith({
                path: '/api/users/1',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            });
            expect(result).toEqual(mockResponse);
        });
    });
});


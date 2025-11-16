import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '@src/services/user';
import { bshConfigs } from '@config';
import type { BshClientFn, BshAuthFn } from '@src/client/types';
import type { BshUser, BshUserInit, BshSearch } from '@types';
import { BshError } from '@types';

describe('UserService', () => {
  let mockClientFn: BshClientFn;
  let mockAuthFn: BshAuthFn;
  let mockGet: any;
  let mockPost: any;
  let mockPut: any;
  let mockDelete: any;

  beforeEach(() => {
    // Reset singleton
    (UserService as any).instance = undefined;
    bshConfigs.reset();

    // Setup mocks
    mockGet = vi.fn();
    mockPost = vi.fn();
    mockPut = vi.fn();
    mockDelete = vi.fn();

    mockClientFn = vi.fn();
    mockAuthFn = vi.fn().mockResolvedValue({ type: 'JWT', token: 'test-token' });

    // Mock BshClient methods
    const mockClient = {
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
    };

    // Mock createClient to return our mock
    vi.spyOn(bshConfigs, 'createClient').mockReturnValue(mockClient as any);

    bshConfigs.configure({
      clientFn: mockClientFn,
      authFn: mockAuthFn,
      host: 'http://localhost:3000',
    });
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = UserService.getInstance();
      const instance2 = UserService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should create a new instance after reset', () => {
      const instance1 = UserService.getInstance();
      (UserService as any).instance = undefined;
      const instance2 = UserService.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('me', () => {
    it('should call client.get with correct endpoint', async () => {
      const mockUser: BshUser = {
        userId: 'user-123',
        email: 'test@example.com',
        roles: ['user'],
        status: 'ACTIVATED',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: mockUser,
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockResolvedValue(mockResponse);

      const userService = UserService.getInstance();
      await userService.me({});

      expect(mockGet).toHaveBeenCalledWith({
        path: '/api/users/me',
        options: {
          responseType: 'json',
          responseFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onSuccess callback', async () => {
      const mockUser: BshUser = {
        userId: 'user-123',
        email: 'test@example.com',
        roles: ['user'],
        status: 'ACTIVATED',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: mockUser,
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockImplementation(async (params: any) => {
        if (params.bshOptions?.onSuccess) {
          params.bshOptions.onSuccess(mockResponse);
          return undefined;
        }
        return mockResponse;
      });

      const onSuccess = vi.fn();
      const userService = UserService.getInstance();
      await userService.me({ onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('init', () => {
    it('should call client.post with correct endpoint and payload', async () => {
      const userInit: BshUserInit = {
        email: 'newuser@example.com',
        password: 'password123',
        roles: ['user'],
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };
      const mockUser: BshUser = {
        userId: 'user-123',
        email: 'newuser@example.com',
        roles: ['user'],
        status: 'ACTIVATED',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: mockUser,
        code: 201,
        status: 'Created',
        error: '',
      };
      mockPost.mockResolvedValue(mockResponse);

      const userService = UserService.getInstance();
      await userService.init({ payload: userInit });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/users/init',
        options: {
          responseType: 'json',
          responseFormat: 'json',
          body: userInit,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onSuccess callback', async () => {
      const userInit: BshUserInit = {
        email: 'newuser@example.com',
        password: 'password123',
        profile: {},
      };
      const mockUser: BshUser = {
        userId: 'user-123',
        email: 'newuser@example.com',
        roles: [],
        status: 'ACTIVATED',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: mockUser,
        code: 201,
        status: 'Created',
        error: '',
      };
      mockPost.mockImplementation(async (params: any) => {
        if (params.bshOptions?.onSuccess) {
          params.bshOptions.onSuccess(mockResponse);
          return undefined;
        }
        return mockResponse;
      });

      const onSuccess = vi.fn();
      const userService = UserService.getInstance();
      await userService.init({ payload: userInit, onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('updateProfile', () => {
    it('should call client.put with correct endpoint and payload', async () => {
      const profileUpdate = {
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const mockUser: BshUser = {
        userId: 'user-123',
        email: 'test@example.com',
        roles: ['user'],
        status: 'ACTIVATED',
        profile: {
          firstName: 'Jane',
          lastName: 'Smith',
        },
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: mockUser,
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPut.mockResolvedValue(mockResponse);

      const userService = UserService.getInstance();
      await userService.updateProfile({ payload: profileUpdate });

      expect(mockPut).toHaveBeenCalledWith({
        path: '/api/users/profile',
        options: {
          responseType: 'json',
          responseFormat: 'json',
          body: profileUpdate,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });
  });

  describe('updatePicture', () => {
    it('should call client.post with FormData', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockUser: BshUser = {
        userId: 'user-123',
        email: 'test@example.com',
        roles: ['user'],
        status: 'ACTIVATED',
        profile: {
          picture: 'https://example.com/picture.jpg',
        },
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: mockUser,
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockResponse);

      const userService = UserService.getInstance();
      await userService.updatePicture({ payload: file });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/users/picture',
        options: {
          responseType: 'json',
          responseFormat: 'json',
          body: expect.any(FormData),
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });
  });

  describe('updatePassword', () => {
    it('should call client.put with correct endpoint and payload', async () => {
      const passwordUpdate = {
        currentPassword: 'old-password',
        newPassword: 'new-password',
      };
      const mockResponse = {
        data: { message: 'Password updated successfully' },
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPut.mockResolvedValue(mockResponse);

      const userService = UserService.getInstance();
      await userService.updatePassword({ payload: passwordUpdate });

      expect(mockPut).toHaveBeenCalledWith({
        path: '/api/users/password',
        options: {
          responseType: 'json',
          responseFormat: 'json',
          body: passwordUpdate,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });
  });

  describe('getById', () => {
    it('should call client.get with correct endpoint', async () => {
      const userId = 'user-123';
      const mockUser: BshUser = {
        userId: 'user-123',
        email: 'test@example.com',
        roles: ['user'],
        status: 'ACTIVATED',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: mockUser,
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockResolvedValue(mockResponse);

      const userService = UserService.getInstance();
      await userService.getById({ id: userId });

      expect(mockGet).toHaveBeenCalledWith({
        path: '/api/users/user-123',
        options: {
          responseType: 'json',
          responseFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });
  });

  describe('search', () => {
    it('should call client.post with correct endpoint and payload', async () => {
      const searchParams: BshSearch<BshUser> = {
        filters: [
          {
            field: 'email',
            operator: 'eq',
            value: 'test@example.com',
          },
        ],
      };
      const mockUser: BshUser = {
        userId: 'user-123',
        email: 'test@example.com',
        roles: ['user'],
        status: 'ACTIVATED',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: mockUser,
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockResponse);

      const userService = UserService.getInstance();
      await userService.search({ payload: searchParams });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/users/search',
        options: {
          responseType: 'json',
          responseFormat: 'json',
          body: searchParams,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });
  });

  describe('list', () => {
    it('should call client.get with query parameters', async () => {
      const mockUser: BshUser = {
        userId: 'user-123',
        email: 'test@example.com',
        roles: ['user'],
        status: 'ACTIVATED',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: mockUser,
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockResolvedValue(mockResponse);

      const userService = UserService.getInstance();
      await userService.list({
        queryParams: {
          page: '1',
          size: '10',
          sort: 'email',
        },
      });

      expect(mockGet).toHaveBeenCalledWith({
        path: '/api/users?page=1&size=10&sort=email',
        options: {
          responseType: 'json',
          responseFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should call client.get without query parameters', async () => {
      const mockUser: BshUser = {
        userId: 'user-123',
        email: 'test@example.com',
        roles: ['user'],
        status: 'ACTIVATED',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: mockUser,
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockResolvedValue(mockResponse);

      const userService = UserService.getInstance();
      await userService.list({});

      expect(mockGet).toHaveBeenCalledWith({
        path: '/api/users',
        options: {
          responseType: 'json',
          responseFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });
  });

  describe('update', () => {
    it('should call client.put with correct endpoint and payload', async () => {
      const userUpdate: Partial<BshUser> = {
        email: 'updated@example.com',
        profile: {
          firstName: 'Updated',
        },
      };
      const mockUser: BshUser = {
        userId: 'user-123',
        email: 'updated@example.com',
        roles: ['user'],
        status: 'ACTIVATED',
        profile: {
          firstName: 'Updated',
        },
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: mockUser,
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPut.mockResolvedValue(mockResponse);

      const userService = UserService.getInstance();
      await userService.update({ payload: userUpdate });

      expect(mockPut).toHaveBeenCalledWith({
        path: '/api/users',
        options: {
          responseType: 'json',
          responseFormat: 'json',
          body: userUpdate,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });
  });

  describe('deleteById', () => {
    it('should call client.delete with correct endpoint', async () => {
      const userId = 'user-123';
      const mockUser: BshUser = {
        userId: 'user-123',
        email: 'test@example.com',
        roles: ['user'],
        status: 'ACTIVATED',
        persistenceId: '1',
        CreatedAt: { $date: new Date().toISOString() },
      };
      const mockResponse = {
        data: mockUser,
        code: 200,
        status: 'OK',
        error: '',
      };
      mockDelete.mockResolvedValue(mockResponse);

      const userService = UserService.getInstance();
      await userService.deleteById({ id: userId });

      expect(mockDelete).toHaveBeenCalledWith({
        path: '/api/users/user-123',
        options: {
          responseType: 'json',
          responseFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onError callback', async () => {
      const userId = 'user-123';
      const mockError = new BshError(404, '/api/users/user-123');
      mockDelete.mockRejectedValue(mockError);

      const onError = vi.fn();
      const userService = UserService.getInstance();
      await userService.deleteById({ id: userId, onError }).catch(() => {});

      expect(mockDelete).toHaveBeenCalled();
    });
  });
});


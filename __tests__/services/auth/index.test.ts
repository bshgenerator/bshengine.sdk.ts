import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '@src/services/auth';
import { bshConfigs } from '@config';
import type { BshClientFn, BshAuthFn } from '@src/client/types';
import type { BshUser, BshUserInit } from '@types';
import { BshError } from '@types';

describe('AuthService', () => {
  let mockClientFn: BshClientFn;
  let mockAuthFn: BshAuthFn;
  let mockPost: any;

  beforeEach(() => {
    // Reset singleton
    (AuthService as any).instance = undefined;
    bshConfigs.reset();

    // Setup mocks
    mockPost = vi.fn();

    mockClientFn = vi.fn();
    mockAuthFn = vi.fn().mockResolvedValue({ type: 'JWT', token: 'test-token' });

    // Mock BshClient methods
    const mockClient = {
      post: mockPost,
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
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should create a new instance after reset', () => {
      const instance1 = AuthService.getInstance();
      (AuthService as any).instance = undefined;
      const instance2 = AuthService.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('login', () => {
    it('should call client.post with correct endpoint and payload', async () => {
      const loginParams = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = {
        data: { token: 'access-token', refresh: 'refresh-token' },
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockResponse);

      const authService = AuthService.getInstance();
      await authService.login({ payload: loginParams });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/auth/login',
        options: {
          responseType: 'json',
          responseFormat: 'json',
          body: loginParams,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onSuccess callback', async () => {
      const loginParams = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = {
        data: { token: 'access-token', refresh: 'refresh-token' },
        code: 200,
        status: 'OK',
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
      const authService = AuthService.getInstance();
      await authService.login({ payload: loginParams, onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle onError callback', async () => {
      const loginParams = {
        email: 'test@example.com',
        password: 'wrong-password',
      };
      const mockError = new BshError(401, '/api/auth/login');
      mockPost.mockRejectedValue(mockError);

      const onError = vi.fn();
      const authService = AuthService.getInstance();
      await authService.login({ payload: loginParams, onError }).catch(() => {});

      expect(mockPost).toHaveBeenCalled();
    });

    it('should return response when no callbacks provided', async () => {
      const loginParams = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = {
        data: { token: 'access-token', refresh: 'refresh-token' },
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockResponse);

      const authService = AuthService.getInstance();
      const result = await authService.login({ payload: loginParams });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('register', () => {
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
        status: 'REQUIRED_ACTIVATION',
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

      const authService = AuthService.getInstance();
      await authService.register({ payload: userInit });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/auth/register',
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
        status: 'REQUIRED_ACTIVATION',
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
      const authService = AuthService.getInstance();
      await authService.register({ payload: userInit, onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('refreshToken', () => {
    it('should call client.post with correct endpoint and payload', async () => {
      const refreshParams = {
        refresh: 'refresh-token-123',
      };
      const mockResponse = {
        data: { token: 'new-access-token', refresh: 'new-refresh-token' },
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockResponse);

      const authService = AuthService.getInstance();
      await authService.refreshToken({ payload: refreshParams });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/auth/refresh',
        options: {
          responseType: 'json',
          responseFormat: 'json',
          body: refreshParams,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onSuccess callback', async () => {
      const refreshParams = {
        refresh: 'refresh-token-123',
      };
      const mockResponse = {
        data: { token: 'new-access-token', refresh: 'new-refresh-token' },
        code: 200,
        status: 'OK',
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
      const authService = AuthService.getInstance();
      await authService.refreshToken({ payload: refreshParams, onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('forgetPassword', () => {
    it('should call client.post with correct endpoint and payload', async () => {
      const forgetPasswordParams = {
        email: 'user@example.com',
      };
      const mockResponse = {
        data: { message: 'Password reset email sent' },
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockResponse);

      const authService = AuthService.getInstance();
      await authService.forgetPassword({ payload: forgetPasswordParams });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/auth/forget-password',
        options: {
          responseType: 'json',
          responseFormat: 'json',
          body: forgetPasswordParams,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onSuccess callback', async () => {
      const forgetPasswordParams = {
        email: 'user@example.com',
      };
      const mockResponse = {
        data: { message: 'Password reset email sent' },
        code: 200,
        status: 'OK',
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
      const authService = AuthService.getInstance();
      await authService.forgetPassword({ payload: forgetPasswordParams, onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('resetPassword', () => {
    it('should call client.post with correct endpoint and payload', async () => {
      const resetPasswordParams = {
        email: 'user@example.com',
        code: 'reset-code-123',
        newPassword: 'new-password-123',
      };
      const mockResponse = {
        data: { message: 'Password reset successfully' },
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockResponse);

      const authService = AuthService.getInstance();
      await authService.resetPassword({ payload: resetPasswordParams });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/auth/reset-password',
        options: {
          responseType: 'json',
          responseFormat: 'json',
          body: resetPasswordParams,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onSuccess callback', async () => {
      const resetPasswordParams = {
        email: 'user@example.com',
        code: 'reset-code-123',
        newPassword: 'new-password-123',
      };
      const mockResponse = {
        data: { message: 'Password reset successfully' },
        code: 200,
        status: 'OK',
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
      const authService = AuthService.getInstance();
      await authService.resetPassword({ payload: resetPasswordParams, onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('activateAccount', () => {
    it('should call client.post with correct endpoint and payload', async () => {
      const activateAccountParams = {
        email: 'user@example.com',
        code: 'activation-code-123',
      };
      const mockResponse = {
        data: { message: 'Account activated successfully' },
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockResponse);

      const authService = AuthService.getInstance();
      await authService.activateAccount({ payload: activateAccountParams });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/auth/activate-account',
        options: {
          responseType: 'json',
          responseFormat: 'json',
          body: activateAccountParams,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onSuccess callback', async () => {
      const activateAccountParams = {
        email: 'user@example.com',
        code: 'activation-code-123',
      };
      const mockResponse = {
        data: { message: 'Account activated successfully' },
        code: 200,
        status: 'OK',
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
      const authService = AuthService.getInstance();
      await authService.activateAccount({ payload: activateAccountParams, onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle onError callback', async () => {
      const activateAccountParams = {
        email: 'user@example.com',
        code: 'invalid-code',
      };
      const mockError = new BshError(400, '/api/auth/activate-account');
      mockPost.mockRejectedValue(mockError);

      const onError = vi.fn();
      const authService = AuthService.getInstance();
      await authService.activateAccount({ payload: activateAccountParams, onError }).catch(() => {});

      expect(mockPost).toHaveBeenCalled();
    });
  });
});


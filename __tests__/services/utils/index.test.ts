import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BshUtilsService } from '@src/services/utils';
import { bshConfigs } from '@config';
import type { BshClientFn, BshAuthFn } from '@src/client/types';
import type { BshTriggerPlugin, BshTriggerAction } from '@types';
import { BshError } from '@types';

describe('BshUtilsService', () => {
  let mockClientFn: BshClientFn;
  let mockAuthFn: BshAuthFn;
  let mockGet: any;

  beforeEach(() => {
    // Reset singleton
    (BshUtilsService as any).instance = undefined;
    bshConfigs.reset();

    // Setup mocks
    mockGet = vi.fn();

    mockClientFn = vi.fn();
    mockAuthFn = vi.fn().mockResolvedValue({ type: 'JWT', token: 'test-token' });

    // Mock BshClient methods
    const mockClient = {
      get: mockGet,
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
      const instance1 = BshUtilsService.getInstance();
      const instance2 = BshUtilsService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should create a new instance after reset', () => {
      const instance1 = BshUtilsService.getInstance();
      (BshUtilsService as any).instance = undefined;
      const instance2 = BshUtilsService.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('triggerPlugins', () => {
    it('should call client.get with correct endpoint', async () => {
      const mockPlugin: BshTriggerPlugin = {
        name: 'test-plugin',
        category: 'notification',
        input: { type: 'object' },
        output: { type: 'object' },
      };
      const mockResponse = {
        data: [mockPlugin],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockResolvedValue(mockResponse);

      const utilsService = BshUtilsService.getInstance();
      await utilsService.triggerPlugins({});

      expect(mockGet).toHaveBeenCalledWith({
        path: '/api/utils/triggers/plugins',
        options: {
          responseType: 'json',
          requestFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onSuccess callback', async () => {
      const mockPlugin: BshTriggerPlugin = {
        name: 'test-plugin',
        category: 'notification',
        input: { type: 'object' },
        output: { type: 'object' },
      };
      const mockResponse = {
        data: [mockPlugin],
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
      const utilsService = BshUtilsService.getInstance();
      await utilsService.triggerPlugins({ onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });

    it('should return response when no callbacks provided', async () => {
      const mockPlugin: BshTriggerPlugin = {
        name: 'test-plugin',
        category: 'notification',
        input: { type: 'object' },
        output: { type: 'object' },
      };
      const mockResponse = {
        data: [mockPlugin],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockResolvedValue(mockResponse);

      const utilsService = BshUtilsService.getInstance();
      const result = await utilsService.triggerPlugins({});

      expect(result).toEqual(mockResponse);
    });

    it('should handle onError callback', async () => {
      const mockError = new BshError(500, '/api/utils/triggers/plugins');
      mockGet.mockRejectedValue(mockError);

      const onError = vi.fn();
      const utilsService = BshUtilsService.getInstance();
      await utilsService.triggerPlugins({ onError }).catch(() => {});

      expect(mockGet).toHaveBeenCalled();
    });
  });

  describe('triggerActions', () => {
    it('should call client.get with correct endpoint', async () => {
      const mockAction: BshTriggerAction = {
        name: 'send-email',
      };
      const mockResponse = {
        data: [mockAction],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockResolvedValue(mockResponse);

      const utilsService = BshUtilsService.getInstance();
      await utilsService.triggerActions({});

      expect(mockGet).toHaveBeenCalledWith({
        path: '/api/utils/triggers/actions',
        options: {
          responseType: 'json',
          requestFormat: 'json',
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onSuccess callback', async () => {
      const mockAction: BshTriggerAction = {
        name: 'send-email',
      };
      const mockResponse = {
        data: [mockAction],
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
      const utilsService = BshUtilsService.getInstance();
      await utilsService.triggerActions({ onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });

    it('should return response when no callbacks provided', async () => {
      const mockAction: BshTriggerAction = {
        name: 'send-email',
      };
      const mockResponse = {
        data: [mockAction],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockGet.mockResolvedValue(mockResponse);

      const utilsService = BshUtilsService.getInstance();
      const result = await utilsService.triggerActions({});

      expect(result).toEqual(mockResponse);
    });

    it('should handle onError callback', async () => {
      const mockError = new BshError(500, '/api/utils/triggers/actions');
      mockGet.mockRejectedValue(mockError);

      const onError = vi.fn();
      const utilsService = BshUtilsService.getInstance();
      await utilsService.triggerActions({ onError }).catch(() => {});

      expect(mockGet).toHaveBeenCalled();
    });
  });
});


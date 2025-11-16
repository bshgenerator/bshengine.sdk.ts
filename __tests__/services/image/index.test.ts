import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImageService } from '@src/services/image';
import { bshConfigs } from '@config';
import type { BshClientFn, BshAuthFn } from '@src/client/types';
import type { UploadResponse, UploadOptions } from '@types';
import { BshError } from '@types';

describe('ImageService', () => {
  let mockClientFn: BshClientFn;
  let mockAuthFn: BshAuthFn;
  let mockPost: any;

  beforeEach(() => {
    // Reset singleton
    (ImageService as any).instance = undefined;
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
      const instance1 = ImageService.getInstance();
      const instance2 = ImageService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should create a new instance after reset', () => {
      const instance1 = ImageService.getInstance();
      (ImageService as any).instance = undefined;
      const instance2 = ImageService.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('upload', () => {
    it('should call client.post with correct endpoint and FormData', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse: UploadResponse = {
        fileId: 'file-123',
        publicId: 'public-123',
        assetId: 'asset-123',
        uri: 'https://example.com/image.jpg',
        secureUri: 'https://example.com/secure/image.jpg',
        tags: ['test'],
        context: {},
      };
      const mockApiResponse = {
        data: [mockResponse],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockApiResponse);

      const imageService = ImageService.getInstance();
      await imageService.upload({ file });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/images/upload',
        options: {
          responseType: 'json',
          requestFormat: 'form',
          body: expect.any(FormData),
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });

      // Verify FormData contains the file
      const callArgs = mockPost.mock.calls[0][0];
      const formData = callArgs.options.body as FormData;
      expect(formData.get('file')).toBe(file);
    });

    it('should include namespace in FormData when provided', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const namespace = 'my-namespace';
      const mockResponse: UploadResponse = {
        fileId: 'file-123',
        publicId: 'public-123',
        assetId: 'asset-123',
        uri: 'https://example.com/image.jpg',
        secureUri: 'https://example.com/secure/image.jpg',
        tags: [],
        context: {},
      };
      const mockApiResponse = {
        data: [mockResponse],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockApiResponse);

      const imageService = ImageService.getInstance();
      await imageService.upload({ file, namespace });

      const callArgs = mockPost.mock.calls[0][0];
      const formData = callArgs.options.body as FormData;
      expect(formData.get('namespace')).toBe(namespace);
    });

    it('should include assetId in FormData when provided', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const assetId = 'asset-123';
      const mockResponse: UploadResponse = {
        fileId: 'file-123',
        publicId: 'public-123',
        assetId: 'asset-123',
        uri: 'https://example.com/image.jpg',
        secureUri: 'https://example.com/secure/image.jpg',
        tags: [],
        context: {},
      };
      const mockApiResponse = {
        data: [mockResponse],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockApiResponse);

      const imageService = ImageService.getInstance();
      await imageService.upload({ file, assetId });

      const callArgs = mockPost.mock.calls[0][0];
      const formData = callArgs.options.body as FormData;
      expect(formData.get('assetId')).toBe(assetId);
    });

    it('should include options in FormData when provided', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const options: UploadOptions = {
        tags: ['tag1', 'tag2'],
        context: { key: 'value' },
      };
      const mockResponse: UploadResponse = {
        fileId: 'file-123',
        publicId: 'public-123',
        assetId: 'asset-123',
        uri: 'https://example.com/image.jpg',
        secureUri: 'https://example.com/secure/image.jpg',
        tags: ['tag1', 'tag2'],
        context: { key: 'value' },
      };
      const mockApiResponse = {
        data: [mockResponse],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockApiResponse);

      const imageService = ImageService.getInstance();
      await imageService.upload({ file, options });

      const callArgs = mockPost.mock.calls[0][0];
      const formData = callArgs.options.body as FormData;
      expect(formData.get('options')).toBe(JSON.stringify(options));
    });

    it('should handle all optional parameters together', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const namespace = 'my-namespace';
      const assetId = 'asset-123';
      const options: UploadOptions = {
        tags: ['tag1'],
        context: {},
      };
      const mockResponse: UploadResponse = {
        fileId: 'file-123',
        publicId: 'public-123',
        assetId: 'asset-123',
        uri: 'https://example.com/image.jpg',
        secureUri: 'https://example.com/secure/image.jpg',
        tags: ['tag1'],
        context: {},
      };
      const mockApiResponse = {
        data: [mockResponse],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockApiResponse);

      const imageService = ImageService.getInstance();
      await imageService.upload({ file, namespace, assetId, options });

      const callArgs = mockPost.mock.calls[0][0];
      const formData = callArgs.options.body as FormData;
      expect(formData.get('file')).toBe(file);
      expect(formData.get('namespace')).toBe(namespace);
      expect(formData.get('assetId')).toBe(assetId);
      expect(formData.get('options')).toBe(JSON.stringify(options));
    });

    it('should handle onSuccess callback', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse: UploadResponse = {
        fileId: 'file-123',
        publicId: 'public-123',
        assetId: 'asset-123',
        uri: 'https://example.com/image.jpg',
        secureUri: 'https://example.com/secure/image.jpg',
        tags: [],
        context: {},
      };
      const mockApiResponse = {
        data: [mockResponse],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockImplementation(async (params: any) => {
        if (params.bshOptions?.onSuccess) {
          params.bshOptions.onSuccess(mockApiResponse);
          return undefined;
        }
        return mockApiResponse;
      });

      const onSuccess = vi.fn();
      const imageService = ImageService.getInstance();
      await imageService.upload({ file, onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockApiResponse);
    });

    it('should return response when no callbacks provided', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse: UploadResponse = {
        fileId: 'file-123',
        publicId: 'public-123',
        assetId: 'asset-123',
        uri: 'https://example.com/image.jpg',
        secureUri: 'https://example.com/secure/image.jpg',
        tags: [],
        context: {},
      };
      const mockApiResponse = {
        data: [mockResponse],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockApiResponse);

      const imageService = ImageService.getInstance();
      const result = await imageService.upload({ file });

      expect(result).toEqual(mockApiResponse);
    });

    it('should handle onError callback', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockError = new BshError(400, '/api/images/upload');
      mockPost.mockRejectedValue(mockError);

      const onError = vi.fn();
      const imageService = ImageService.getInstance();
      await imageService.upload({ file, onError }).catch(() => {});

      expect(mockPost).toHaveBeenCalled();
    });
  });
});


import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageService } from '../../../src/services/image';
import { BshClient } from '../../../src/client/bsh-client';
import { UploadResponse, UploadOptions } from '../../../src/types';

describe('ImageService', () => {
    let imageService: ImageService;
    let mockClient: BshClient;
    let mockPost: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockPost = vi.fn();
        mockClient = {
            get: vi.fn(),
            post: mockPost,
            put: vi.fn(),
            delete: vi.fn(),
            patch: vi.fn(),
            download: vi.fn(),
        } as unknown as BshClient;
        imageService = new ImageService(mockClient);
    });

    describe('upload', () => {
        it('should call client.post with FormData and correct parameters', async () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const mockUploadResponse: UploadResponse = {
                url: 'https://example.com/image.jpg',
                id: 'image-123'
            } as UploadResponse;
            const mockResponse = {
                data: [mockUploadResponse],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const params = {
                payload: {
                    file: mockFile
                },
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await imageService.upload(params);

            expect(mockPost).toHaveBeenCalled();
            const callArgs = mockPost.mock.calls[0][0];
            expect(callArgs.path).toBe('/api/images/upload');
            expect(callArgs.options.responseType).toBe('json');
            expect(callArgs.options.requestFormat).toBe('form');
            expect(callArgs.options.body).toBeInstanceOf(FormData);
            expect(result).toEqual(mockResponse);
        });

        it('should include namespace in FormData when provided', async () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const mockUploadResponse: UploadResponse = {
                url: 'https://example.com/image.jpg',
                id: 'image-123'
            } as UploadResponse;
            const mockResponse = {
                data: [mockUploadResponse],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const params = {
                payload: {
                    file: mockFile,
                    namespace: 'user-avatars'
                },
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            await imageService.upload(params);

            const callArgs = mockPost.mock.calls[0][0];
            const formData = callArgs.options.body as FormData;
            expect(formData.get('namespace')).toBe('user-avatars');
        });

        it('should include assetId in FormData when provided', async () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const mockUploadResponse: UploadResponse = {
                url: 'https://example.com/image.jpg',
                id: 'image-123'
            } as UploadResponse;
            const mockResponse = {
                data: [mockUploadResponse],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const params = {
                payload: {
                    file: mockFile,
                    assetId: 'asset-456'
                },
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            await imageService.upload(params);

            const callArgs = mockPost.mock.calls[0][0];
            const formData = callArgs.options.body as FormData;
            expect(formData.get('assetId')).toBe('asset-456');
        });

        it('should include options in FormData when provided', async () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const uploadOptions: UploadOptions = {
                width: 800,
                height: 600,
                quality: 90
            } as UploadOptions;
            const mockUploadResponse: UploadResponse = {
                url: 'https://example.com/image.jpg',
                id: 'image-123'
            } as UploadResponse;
            const mockResponse = {
                data: [mockUploadResponse],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const params = {
                payload: {
                    file: mockFile,
                    options: uploadOptions
                },
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            await imageService.upload(params);

            const callArgs = mockPost.mock.calls[0][0];
            const formData = callArgs.options.body as FormData;
            const optionsStr = formData.get('options') as string;
            expect(optionsStr).toBe(JSON.stringify(uploadOptions));
        });
    });
});


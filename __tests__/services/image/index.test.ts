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
                fileId: 'image-123',
                publicId: 'public-123',
                assetId: 'asset-123',
                uri: 'https://example.com/image.jpg',
                secureUri: 'https://example.com/image.jpg',
                tags: [],
                context: {}
            };
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

        it('should include folder in FormData when provided', async () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const mockUploadResponse: UploadResponse = {
                fileId: 'image-123',
                publicId: 'public-123',
                assetId: 'asset-123',
                uri: 'https://example.com/image.jpg',
                secureUri: 'https://example.com/image.jpg',
                tags: [],
                context: {}
            };
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
                    folder: 'user-avatars'
                },
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            await imageService.upload(params);

            const callArgs = mockPost.mock.calls[0][0];
            const formData = callArgs.options.body as FormData;
            expect(formData.get('folder')).toBe('user-avatars');
        });

        it('should include filename in FormData when provided', async () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const mockUploadResponse: UploadResponse = {
                fileId: 'image-123',
                publicId: 'public-123',
                assetId: 'asset-123',
                uri: 'https://example.com/image.jpg',
                secureUri: 'https://example.com/image.jpg',
                tags: [],
                context: {}
            };
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
                    filename: 'custom-name.jpg'
                },
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            await imageService.upload(params);

            const callArgs = mockPost.mock.calls[0][0];
            const formData = callArgs.options.body as FormData;
            expect(formData.get('filename')).toBe('custom-name.jpg');
        });

        it('should include options in FormData when provided', async () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const uploadOptions: UploadOptions = {
                tags: [],
                context: {},
                width: 800,
                height: 600,
                quality: 90
            };
            const mockUploadResponse: UploadResponse = {
                fileId: 'image-123',
                publicId: 'public-123',
                assetId: 'asset-123',
                uri: 'https://example.com/image.jpg',
                secureUri: 'https://example.com/image.jpg',
                tags: [],
                context: {}
            };
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


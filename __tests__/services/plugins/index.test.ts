import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PluginService } from '../../../src/services/plugins';
import { BshClient } from '../../../src/client/bsh-client';
import { PluginInstalledResponse } from '../../../src/types';
import { CoreEntities } from '../../../src/types/core';

describe('PluginService', () => {
    let pluginService: PluginService;
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
        pluginService = new PluginService(mockClient);
    });

    describe('installZip', () => {
        it('should call client.post with FormData and correct parameters', async () => {
            const mockFile = new File(['test-plugin-content'], 'plugin.zip', { type: 'application/zip' });
            const mockPluginResponse: PluginInstalledResponse = {
                history: 1,
                pluginId: 'plugin-123',
                pluginName: 'test-plugin',
                totalFiles: 10,
                successCount: 10,
                failedCount: 0,
            };
            const mockResponse = {
                data: [mockPluginResponse],
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

            const result = await pluginService.installZip(params);

            expect(mockPost).toHaveBeenCalled();
            const callArgs = mockPost.mock.calls[0][0];
            expect(callArgs.path).toBe('/api/plugins/install/zip');
            expect(callArgs.options.responseType).toBe('json');
            expect(callArgs.options.requestFormat).toBe('form');
            expect(callArgs.options.body).toBeInstanceOf(FormData);
            expect(callArgs.bshOptions).toEqual({ onSuccess: params.onSuccess, onError: params.onError });
            expect(callArgs.api).toBe('plugins.installZip');
            expect(callArgs.entity).toBe(CoreEntities.BshPlugins);
            expect(result).toEqual(mockResponse);
        });

        it('should include file in FormData', async () => {
            const mockFile = new File(['test-plugin-content'], 'plugin.zip', { type: 'application/zip' });
            const mockPluginResponse: PluginInstalledResponse = {
                history: 1,
                pluginId: 'plugin-456',
                pluginName: 'another-plugin',
                totalFiles: 5,
                successCount: 5,
                failedCount: 0,
            };
            const mockResponse = {
                data: [mockPluginResponse],
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

            await pluginService.installZip(params);

            const callArgs = mockPost.mock.calls[0][0];
            const formData = callArgs.options.body as FormData;
            expect(formData.get('file')).toBe(mockFile);
        });

        it('should pass callbacks to bshOptions', async () => {
            const mockFile = new File(['content'], 'plugin.zip', { type: 'application/zip' });
            const mockResponse = {
                data: [],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const onSuccess = vi.fn();
            const onError = vi.fn();

            await pluginService.installZip({
                payload: { file: mockFile },
                onSuccess,
                onError
            });

            const callArgs = mockPost.mock.calls[0][0];
            expect(callArgs.bshOptions.onSuccess).toBe(onSuccess);
            expect(callArgs.bshOptions.onError).toBe(onError);
        });
    });

    describe('installCore', () => {
        const mockPayload: PluginInstalledResponse = {
            history: 1,
            pluginId: 'core-plugin-123',
            pluginName: 'core-plugin',
            totalFiles: 15,
            successCount: 15,
            failedCount: 0,
        };

        it('should call client.post with correct parameters', async () => {
            const mockResponse = {
                data: [mockPayload],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const params = {
                payload: mockPayload,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await pluginService.installCore(params);

            expect(mockPost).toHaveBeenCalled();
            const callArgs = mockPost.mock.calls[0][0];
            expect(callArgs.path).toBe('/api/plugins/install/core');
            expect(callArgs.options.responseType).toBe('json');
            expect(callArgs.bshOptions).toEqual({ onSuccess: params.onSuccess, onError: params.onError });
            expect(callArgs.api).toBe('plugins.installZip');
            expect(callArgs.entity).toBe(CoreEntities.BshPlugins);
            expect(result).toEqual(mockResponse);
        });

        it('should pass callbacks to bshOptions', async () => {
            const mockResponse = {
                data: [],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const onSuccess = vi.fn();
            const onError = vi.fn();

            await pluginService.installCore({
                payload: mockPayload,
                onSuccess,
                onError
            });

            const callArgs = mockPost.mock.calls[0][0];
            expect(callArgs.bshOptions.onSuccess).toBe(onSuccess);
            expect(callArgs.bshOptions.onError).toBe(onError);
        });

        it('should not include requestFormat or body in options', async () => {
            const mockResponse = {
                data: [],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            await pluginService.installCore({
                payload: mockPayload,
                onSuccess: vi.fn(),
                onError: vi.fn()
            });

            const callArgs = mockPost.mock.calls[0][0];
            expect(callArgs.options.requestFormat).toBeUndefined();
            expect(callArgs.options.body).toBeUndefined();
        });
    });
});

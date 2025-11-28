import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsService } from '../../../src/services/settings';
import { BshClient } from '../../../src/client/bsh-client';
import { BshSettings } from '../../../src/types';

describe('SettingsService', () => {
    let settingsService: SettingsService;
    let mockClient: BshClient;
    let mockGet: ReturnType<typeof vi.fn>;
    let mockPut: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockGet = vi.fn();
        mockPut = vi.fn();
        mockClient = {
            get: mockGet,
            post: vi.fn(),
            put: mockPut,
            delete: vi.fn(),
            patch: vi.fn(),
            download: vi.fn(),
        } as unknown as BshClient;
        settingsService = new SettingsService(mockClient);
    });

    describe('load', () => {
        it('should call client.get with correct parameters', async () => {
            const mockSettings: BshSettings = {
                name: 'BshEngine',
                api: {}
            };
            const mockResponse = {
                data: [mockSettings],
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

            const result = await settingsService.load(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/settings',
                options: {
                    responseType: 'json',
                    requestFormat: 'json'
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'settings.load',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('update', () => {
        it('should call client.put with correct parameters and add name', async () => {
            const mockSettings: BshSettings = {
                name: 'BshEngine',
                api: {}
            };
            const mockResponse = {
                data: [mockSettings],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPut.mockResolvedValue(mockResponse);

            const updatePayload: BshSettings = {
                name: 'BshEngine',
                api: {
                    response: {
                        showSql: false
                    }
                }
            };

            const params = {
                payload: updatePayload,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await settingsService.update(params);

            expect(mockPut).toHaveBeenCalledWith({
                path: '/api/settings',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: { ...updatePayload, name: 'BshEngine' },
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'settings.update',
            });
            expect(result).toEqual(mockResponse);
        });
    });
});


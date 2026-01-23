import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BshUtilsService } from '../../../src/services/utils';
import { BshClient } from '../../../src/client/bsh-client';
import { BshTriggerFunction, BshTriggerAction, SecretSource } from '../../../src/types';

describe('BshUtilsService', () => {
    let utilsService: BshUtilsService;
    let mockClient: BshClient;
    let mockGet: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockGet = vi.fn();
        mockClient = {
            get: mockGet,
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
            patch: vi.fn(),
            download: vi.fn(),
        } as unknown as BshClient;
        utilsService = new BshUtilsService(mockClient);
    });

    describe('triggerPlugins', () => {
        it('should call client.get with correct parameters', async () => {
            const mockPlugin: BshTriggerFunction = {
                name: 'Test Plugin',
                category: 'test',
                input: {},
                output: {}
            };
            const mockResponse = {
                data: [mockPlugin],
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

            const result = await utilsService.triggerFunctions(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/utils/triggers/functions',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'utils.triggerFunctions',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('triggerActions', () => {
        it('should call client.get with correct parameters', async () => {
            const mockAction: BshTriggerAction = {
                id: 'action1',
                name: 'Test Action'
            } as BshTriggerAction;
            const mockResponse = {
                data: [mockAction],
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

            const result = await utilsService.triggerActions(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/utils/triggers/actions',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'utils.triggerActions',
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('secrets', () => {
        it('should call client.get with default source "env" when source is not provided', async () => {
            const mockSecretSource: SecretSource = {
                id: 'env-1',
                name: 'Environment Variables',
                prefix: 'ENV_',
                secrets: {
                    API_KEY: 'test-api-key',
                    DATABASE_URL: 'postgres://localhost:5432/test'
                }
            };
            const mockResponse = {
                data: mockSecretSource,
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

            const result = await utilsService.secrets(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/utils/secrets/env',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'utils.secretsEnv',
            });
            expect(result).toEqual(mockResponse);
        });

        it('should call client.get with custom source when provided', async () => {
            const mockSecretSource: SecretSource = {
                id: 'vault-1',
                name: 'Vault Secrets',
                prefix: 'VAULT_',
                secrets: {
                    SECRET_KEY: 'vault-secret-value'
                }
            };
            const mockResponse = {
                data: mockSecretSource,
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockGet.mockResolvedValue(mockResponse);

            const params = {
                onSuccess: vi.fn(),
                onError: vi.fn(),
                source: 'vault'
            };

            const result = await utilsService.secrets(params);

            expect(mockGet).toHaveBeenCalledWith({
                path: '/api/utils/secrets/vault',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
                api: 'utils.secretsEnv',
            });
            expect(result).toEqual(mockResponse);
        });
    });
});


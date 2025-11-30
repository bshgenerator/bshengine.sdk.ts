import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BshEngine } from '../src/bshengine';
import { BshClientFn, BshAuthFn, BshPostInterceptor, BshPreInterceptor, BshErrorInterceptor, BshRefreshTokenFn } from '../src/client/types';
import { EntityService } from '../src/services/entities';
import { AuthService } from '../src/services/auth';
import { UserService } from '../src/services/user';
import { SettingsService } from '../src/services/settings';
import { ImageService } from '../src/services/image';
import { MailingService } from '../src/services/mailing';
import { BshUtilsService } from '../src/services/utils';
import { CachingService } from '../src/services/caching';
import { ApiKeyService } from '../src/services/api-key';
import { BshResponse } from '../src/types';
import { BshError } from '../src/types';
import { fetchClientFn } from '@client';

// Mock the client module
vi.mock('../src/client/bsh-client', () => {
    return {
        BshClient: vi.fn().mockImplementation(() => ({
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
            patch: vi.fn(),
            download: vi.fn(),
        }))
    };
});

describe('BshEngine', () => {
    let engine: BshEngine;
    let mockClientFn: BshClientFn;
    let mockAuthFn: BshAuthFn;

    beforeEach(() => {
        mockClientFn = vi.fn();
        mockAuthFn = vi.fn();
        engine = new BshEngine();
    });

    describe('constructor', () => {
        it('should create engine with default values when no params provided', () => {
            const engine = new BshEngine();
            expect(engine).toBeInstanceOf(BshEngine);
            expect(engine.getPostInterceptors()).toEqual([]);
            expect(engine.getPreInterceptors()).toEqual([]);
            expect(engine.getErrorInterceptors()).toEqual([]);
        });

        it('should initialize with host parameter', () => {
            const engine = new BshEngine({ host: 'https://api.example.com' });
            expect(engine).toBeInstanceOf(BshEngine);
        });

        it('should initialize with apiKey and set authFn to return APIKEY token', async () => {
            const engine = new BshEngine({ apiKey: 'test-api-key' });
            expect(engine).toBeInstanceOf(BshEngine);
            
            const authFn = (engine as any).authFn as BshAuthFn;
            expect(authFn).toBeDefined();
            expect(await authFn()).toEqual({ type: 'APIKEY', token: 'test-api-key' });
        });

        it('should initialize with jwtToken and set authFn to return JWT token', async () => {
            const engine = new BshEngine({ jwtToken: 'test-jwt-token' });
            expect(engine).toBeInstanceOf(BshEngine);

            const authFn = (engine as any).authFn as BshAuthFn;
            expect(authFn).toBeDefined();
            expect(await authFn()).toEqual({ type: 'JWT', token: 'test-jwt-token' });
        });

        it('should initialize with refreshToken and set refreshTokenFn', async () => {
            const engine = new BshEngine({ refreshToken: 'test-refresh-token' });
            expect(engine).toBeInstanceOf(BshEngine);

            const refreshTokenFn = (engine as any).refreshTokenFn as BshRefreshTokenFn;
            expect(refreshTokenFn).toBeDefined();
            expect(await refreshTokenFn()).toEqual('test-refresh-token');
        });

        it('should initialize with custom clientFn', () => {
            const customClientFn = vi.fn();
            const engine = new BshEngine({ clientFn: customClientFn });
            expect(engine).toBeInstanceOf(BshEngine);
            expect((engine as any).clientFn).toBe(customClientFn);
        });

        it('should use default fetchClientFn when clientFn is not provided', () => {
            const engine = new BshEngine();
            expect(engine).toBeInstanceOf(BshEngine);
            expect((engine as any).clientFn).toBe(fetchClientFn);
        });

        it('should initialize with custom authFn', () => {
            const customAuthFn = vi.fn().mockResolvedValue({ type: 'JWT', token: 'token' });
            const engine = new BshEngine({ authFn: customAuthFn });
            expect(engine).toBeInstanceOf(BshEngine);
            expect((engine as any).authFn).toBe(customAuthFn);
        });

        it('should initialize with custom refreshTokenFn', () => {
            const customRefreshTokenFn = vi.fn().mockResolvedValue('refresh-token');
            const engine = new BshEngine({ refreshTokenFn: customRefreshTokenFn });
            expect(engine).toBeInstanceOf(BshEngine);
            expect((engine as any).refreshTokenFn).toBe(customRefreshTokenFn);
        });

        it('should initialize with postInterceptors array', () => {
            const postInterceptor: BshPostInterceptor = vi.fn();
            const engine = new BshEngine({ postInterceptors: [postInterceptor] });
            expect(engine).toBeInstanceOf(BshEngine);
            expect(engine.getPostInterceptors()).toHaveLength(1);
            expect(engine.getPostInterceptors()[0]).toBe(postInterceptor);
        });

        it('should initialize with preInterceptors array', () => {
            const preInterceptor: BshPreInterceptor = vi.fn();
            const engine = new BshEngine({ preInterceptors: [preInterceptor] });
            expect(engine).toBeInstanceOf(BshEngine);
            expect(engine.getPreInterceptors()).toHaveLength(1);
            expect(engine.getPreInterceptors()[0]).toBe(preInterceptor);
        });

        it('should initialize with errorInterceptors array', () => {
            const errorInterceptor: BshErrorInterceptor = vi.fn();
            const engine = new BshEngine({ errorInterceptors: [errorInterceptor] });
            expect(engine).toBeInstanceOf(BshEngine);
            expect(engine.getErrorInterceptors()).toHaveLength(1);
            expect(engine.getErrorInterceptors()[0]).toBe(errorInterceptor);
        });

        it('should default to empty arrays when interceptors are not provided', () => {
            const engine = new BshEngine();
            expect(engine.getPostInterceptors()).toEqual([]);
            expect(engine.getPreInterceptors()).toEqual([]);
            expect(engine.getErrorInterceptors()).toEqual([]);
        });

        it('should initialize with all parameters', () => {
            const postInterceptor: BshPostInterceptor = vi.fn();
            const preInterceptor: BshPreInterceptor = vi.fn();
            const errorInterceptor: BshErrorInterceptor = vi.fn();
            const customClientFn = vi.fn();
            const customAuthFn = vi.fn().mockResolvedValue({ type: 'JWT', token: 'token' });
            const customRefreshTokenFn = vi.fn().mockResolvedValue('refresh-token');

            const engine = new BshEngine({
                host: 'https://api.example.com',
                apiKey: 'test-key',
                refreshToken: 'refresh-token',
                clientFn: customClientFn,
                authFn: customAuthFn,
                refreshTokenFn: customRefreshTokenFn,
                postInterceptors: [postInterceptor],
                preInterceptors: [preInterceptor],
                errorInterceptors: [errorInterceptor]
            });

            expect(engine).toBeInstanceOf(BshEngine);
            expect(engine.getPostInterceptors()).toHaveLength(1);
            expect(engine.getPreInterceptors()).toHaveLength(1);
            expect(engine.getErrorInterceptors()).toHaveLength(1);

            expect((engine as any).host).toBe('https://api.example.com');
            expect((engine as any).clientFn).toBe(customClientFn);
            expect((engine as any).authFn).toBe(customAuthFn);
            expect((engine as any).refreshTokenFn).toBe(customRefreshTokenFn);
            expect(engine.getPostInterceptors()).toHaveLength(1);
            expect(engine.getPreInterceptors()).toHaveLength(1);
            expect(engine.getErrorInterceptors()).toHaveLength(1);
        });

        it('should prioritize jwtToken over apiKey when both are provided', async () => {
            const engine = new BshEngine({
                apiKey: 'api-key',
                jwtToken: 'jwt-token'
            });
            expect(engine).toBeInstanceOf(BshEngine);
            const authFn = (engine as any).authFn as BshAuthFn;
            expect(authFn).toBeDefined();
            expect(await authFn()).toEqual({ type: 'JWT', token: 'jwt-token' });
        });
    });

    describe('withClient', () => {
        it('should set client function and return engine instance', () => {
            const result = engine.withClient(mockClientFn);
            expect(result).toBe(engine);
        });
    });

    describe('withAuth', () => {
        it('should set auth function and return engine instance', () => {
            const result = engine.withAuth(mockAuthFn);
            expect(result).toBe(engine);
        });
    });

    describe('entities', () => {
        it('should return EntityService instance', () => {
            const entities = engine.entities;
            expect(entities).toBeInstanceOf(EntityService);
        });
    });

    describe('entity', () => {
        it('should return EntityService instance with entity name', () => {
            const entityService = engine.entity('CustomEntity');
            expect(entityService).toBeInstanceOf(EntityService);
        });
    });

    describe('core', () => {
        it('should return object with all core entity services', () => {
            const core = engine.core;
            expect(core).toBeDefined();
            expect(core.BshEntities).toBeInstanceOf(EntityService);
            expect(core.BshSchemas).toBeInstanceOf(EntityService);
            expect(core.BshTypes).toBeInstanceOf(EntityService);
            expect(core.BshUsers).toBeInstanceOf(EntityService);
            expect(core.BshPolicies).toBeInstanceOf(EntityService);
            expect(core.BshRoles).toBeInstanceOf(EntityService);
            expect(core.BshFiles).toBeInstanceOf(EntityService);
            expect(core.BshConfigurations).toBeInstanceOf(EntityService);
            expect(core.BshEmails).toBeInstanceOf(EntityService);
            expect(core.BshEmailTemplates).toBeInstanceOf(EntityService);
            expect(core.BshEventLogs).toBeInstanceOf(EntityService);
            expect(core.BshTriggers).toBeInstanceOf(EntityService);
            expect(core.BshTriggerInstances).toBeInstanceOf(EntityService);
        });
    });

    describe('auth', () => {
        it('should return AuthService instance', () => {
            const auth = engine.auth;
            expect(auth).toBeInstanceOf(AuthService);
        });
    });

    describe('user', () => {
        it('should return UserService instance', () => {
            const user = engine.user;
            expect(user).toBeInstanceOf(UserService);
        });
    });

    describe('settings', () => {
        it('should return SettingsService instance', () => {
            const settings = engine.settings;
            expect(settings).toBeInstanceOf(SettingsService);
        });
    });

    describe('image', () => {
        it('should return ImageService instance', () => {
            const image = engine.image;
            expect(image).toBeInstanceOf(ImageService);
        });
    });

    describe('mailing', () => {
        it('should return MailingService instance', () => {
            const mailing = engine.mailing;
            expect(mailing).toBeInstanceOf(MailingService);
        });
    });

    describe('utils', () => {
        it('should return BshUtilsService instance', () => {
            const utils = engine.utils;
            expect(utils).toBeInstanceOf(BshUtilsService);
        });
    });

    describe('caching', () => {
        it('should return CachingService instance', () => {
            const caching = engine.caching;
            expect(caching).toBeInstanceOf(CachingService);
        });
    });

    describe('apiKey', () => {
        it('should return ApiKeyService instance', () => {
            const apiKey = engine.apiKey;
            expect(apiKey).toBeInstanceOf(ApiKeyService);
        });
    });

    describe('chaining', () => {
        it('should allow method chaining', () => {
            const result = engine
                .withClient(mockClientFn)
                .withAuth(mockAuthFn);
            
            expect(result).toBe(engine);
        });
    });

    describe('interceptors', () => {
        describe('postInterceptor', () => {
            it('should add post interceptor and return engine instance', () => {
                const interceptor: BshPostInterceptor = vi.fn();
                const result = engine.postInterceptor(interceptor);
                
                expect(result).toBe(engine);
                expect(engine.getPostInterceptors()).toHaveLength(1);
                expect(engine.getPostInterceptors()[0]).toBe(interceptor);
            });

            it('should allow adding multiple post interceptors', () => {
                const interceptor1: BshPostInterceptor = vi.fn();
                const interceptor2: BshPostInterceptor = vi.fn();
                
                engine.postInterceptor(interceptor1);
                engine.postInterceptor(interceptor2);
                
                expect(engine.getPostInterceptors()).toHaveLength(2);
                expect(engine.getPostInterceptors()[0]).toBe(interceptor1);
                expect(engine.getPostInterceptors()[1]).toBe(interceptor2);
            });

            it('should allow chaining post interceptors', () => {
                const interceptor1: BshPostInterceptor = vi.fn();
                const interceptor2: BshPostInterceptor = vi.fn();
                
                const result = engine
                    .postInterceptor(interceptor1)
                    .postInterceptor(interceptor2);
                
                expect(result).toBe(engine);
                expect(engine.getPostInterceptors()).toHaveLength(2);
            });
        });

        describe('preInterceptor', () => {
            it('should add pre interceptor and return engine instance', () => {
                const interceptor: BshPreInterceptor = vi.fn();
                const result = engine.preInterceptor(interceptor);
                
                expect(result).toBe(engine);
                expect(engine.getPreInterceptors()).toHaveLength(1);
                expect(engine.getPreInterceptors()[0]).toBe(interceptor);
            });

            it('should allow adding multiple pre interceptors', () => {
                const interceptor1: BshPreInterceptor = vi.fn();
                const interceptor2: BshPreInterceptor = vi.fn();
                
                engine.preInterceptor(interceptor1);
                engine.preInterceptor(interceptor2);
                
                expect(engine.getPreInterceptors()).toHaveLength(2);
                expect(engine.getPreInterceptors()[0]).toBe(interceptor1);
                expect(engine.getPreInterceptors()[1]).toBe(interceptor2);
            });

            it('should allow chaining pre interceptors', () => {
                const interceptor1: BshPreInterceptor = vi.fn();
                const interceptor2: BshPreInterceptor = vi.fn();
                
                const result = engine
                    .preInterceptor(interceptor1)
                    .preInterceptor(interceptor2);
                
                expect(result).toBe(engine);
                expect(engine.getPreInterceptors()).toHaveLength(2);
            });
        });

        describe('errorInterceptor', () => {
            it('should add error interceptor and return engine instance', () => {
                const interceptor: BshErrorInterceptor = vi.fn();
                const result = engine.errorInterceptor(interceptor);
                
                expect(result).toBe(engine);
                expect(engine.getErrorInterceptors()).toHaveLength(1);
                expect(engine.getErrorInterceptors()[0]).toBe(interceptor);
            });

            it('should allow adding multiple error interceptors', () => {
                const interceptor1: BshErrorInterceptor = vi.fn();
                const interceptor2: BshErrorInterceptor = vi.fn();
                
                engine.errorInterceptor(interceptor1);
                engine.errorInterceptor(interceptor2);
                
                expect(engine.getErrorInterceptors()).toHaveLength(2);
                expect(engine.getErrorInterceptors()[0]).toBe(interceptor1);
                expect(engine.getErrorInterceptors()[1]).toBe(interceptor2);
            });

            it('should allow chaining error interceptors', () => {
                const interceptor1: BshErrorInterceptor = vi.fn();
                const interceptor2: BshErrorInterceptor = vi.fn();
                
                const result = engine
                    .errorInterceptor(interceptor1)
                    .errorInterceptor(interceptor2);
                
                expect(result).toBe(engine);
                expect(engine.getErrorInterceptors()).toHaveLength(2);
            });
        });

        describe('getPostInterceptors', () => {
            it('should return empty array when no interceptors added', () => {
                expect(engine.getPostInterceptors()).toEqual([]);
            });

            it('should return all post interceptors', () => {
                const interceptor1: BshPostInterceptor = vi.fn();
                const interceptor2: BshPostInterceptor = vi.fn();
                
                engine.postInterceptor(interceptor1);
                engine.postInterceptor(interceptor2);
                
                const interceptors = engine.getPostInterceptors();
                expect(interceptors).toHaveLength(2);
                expect(interceptors).toContain(interceptor1);
                expect(interceptors).toContain(interceptor2);
            });
        });

        describe('getPreInterceptors', () => {
            it('should return empty array when no interceptors added', () => {
                expect(engine.getPreInterceptors()).toEqual([]);
            });

            it('should return all pre interceptors', () => {
                const interceptor1: BshPreInterceptor = vi.fn();
                const interceptor2: BshPreInterceptor = vi.fn();
                
                engine.preInterceptor(interceptor1);
                engine.preInterceptor(interceptor2);
                
                const interceptors = engine.getPreInterceptors();
                expect(interceptors).toHaveLength(2);
                expect(interceptors).toContain(interceptor1);
                expect(interceptors).toContain(interceptor2);
            });
        });

        describe('getErrorInterceptors', () => {
            it('should return empty array when no interceptors added', () => {
                expect(engine.getErrorInterceptors()).toEqual([]);
            });

            it('should return all error interceptors', () => {
                const interceptor1: BshErrorInterceptor = vi.fn();
                const interceptor2: BshErrorInterceptor = vi.fn();
                
                engine.errorInterceptor(interceptor1);
                engine.errorInterceptor(interceptor2);
                
                const interceptors = engine.getErrorInterceptors();
                expect(interceptors).toHaveLength(2);
                expect(interceptors).toContain(interceptor1);
                expect(interceptors).toContain(interceptor2);
            });
        });

        describe('interceptor integration', () => {
            it('should allow mixing all interceptor types', () => {
                const postInterceptor: BshPostInterceptor = vi.fn();
                const preInterceptor: BshPreInterceptor = vi.fn();
                const errorInterceptor: BshErrorInterceptor = vi.fn();
                
                engine
                    .postInterceptor(postInterceptor)
                    .preInterceptor(preInterceptor)
                    .errorInterceptor(errorInterceptor);
                
                expect(engine.getPostInterceptors()).toHaveLength(1);
                expect(engine.getPreInterceptors()).toHaveLength(1);
                expect(engine.getErrorInterceptors()).toHaveLength(1);
            });

            it('should maintain separate arrays for each interceptor type', () => {
                const postInterceptor: BshPostInterceptor = vi.fn();
                const preInterceptor: BshPreInterceptor = vi.fn();
                const errorInterceptor: BshErrorInterceptor = vi.fn();
                
                engine.postInterceptor(postInterceptor);
                engine.preInterceptor(preInterceptor);
                engine.errorInterceptor(errorInterceptor);
                
                expect(engine.getPostInterceptors()).not.toContain(preInterceptor);
                expect(engine.getPostInterceptors()).not.toContain(errorInterceptor);
                expect(engine.getPreInterceptors()).not.toContain(postInterceptor);
                expect(engine.getPreInterceptors()).not.toContain(errorInterceptor);
                expect(engine.getErrorInterceptors()).not.toContain(postInterceptor);
                expect(engine.getErrorInterceptors()).not.toContain(preInterceptor);
            });
        });
    });
});


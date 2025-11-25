import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BshEngine } from '../src/bshengine';
import { BshClientFn, BshAuthFn } from '../src/client/types';
import { EntityService } from '../src/services/entities';
import { AuthService } from '../src/services/auth';
import { UserService } from '../src/services/user';
import { SettingsService } from '../src/services/settings';
import { ImageService } from '../src/services/image';
import { MailingService } from '../src/services/mailing';
import { BshUtilsService } from '../src/services/utils';
import { CachingService } from '../src/services/caching';
import { ApiKeyService } from '../src/services/api-key';

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

    describe('withHost', () => {
        it('should set host and return engine instance', () => {
            const result = engine.withHost('https://api.example.com');
            expect(result).toBe(engine);
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
                .withHost('https://api.example.com')
                .withClient(mockClientFn)
                .withAuth(mockAuthFn);
            
            expect(result).toBe(engine);
        });
    });
});


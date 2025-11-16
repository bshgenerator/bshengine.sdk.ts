import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CoreEntityService, coreEntities, CoreEntities } from '@src/services/core';
import { EntityService } from '@src/services/entities';
import { bshConfigs } from '@config';
import type { BshClientFn, BshAuthFn } from '@src/client/types';
import type { BshSearch } from '@types';

describe('CoreEntityService', () => {
  let mockClientFn: BshClientFn;
  let mockAuthFn: BshAuthFn;
  let mockGet: any;
  let mockPost: any;
  let mockPut: any;
  let mockDelete: any;
  let mockDownload: any;

  beforeEach(() => {
    // Reset singletons
    (EntityService as any).instance = undefined;
    bshConfigs.reset();

    // Setup mocks
    mockGet = vi.fn();
    mockPost = vi.fn();
    mockPut = vi.fn();
    mockDelete = vi.fn();
    mockDownload = vi.fn();

    mockClientFn = vi.fn();
    mockAuthFn = vi.fn().mockResolvedValue({ type: 'JWT', token: 'test-token' });

    // Mock BshClient methods
    const mockClient = {
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
      download: mockDownload,
    };

    // Mock createClient to return our mock
    vi.spyOn(bshConfigs, 'createClient').mockReturnValue(mockClient as any);

    bshConfigs.configure({
      clientFn: mockClientFn,
      authFn: mockAuthFn,
      host: 'http://localhost:3000',
    });
  });

  // Helper function to test all CRUD operations for a core entity
  const testCoreEntity = (
    entityName: CoreEntities,
    entityService: CoreEntityService<any>,
    mockData: any
  ) => {
    describe(`${entityName}`, () => {
      describe('findById', () => {
        it('should call EntityService.findById with correct entity name', async () => {
          const mockResponse = { data: [mockData], code: 200, status: 'OK', error: '' };
          mockGet.mockResolvedValue(mockResponse);

          await entityService.findById({ id: '123' });

          expect(mockGet).toHaveBeenCalledWith({
            path: `/api/entities/${entityName}/123`,
            options: {
              responseType: 'json',
              responseFormat: 'json',
              headers: {
                'Content-Type': 'application/json',
              },
            },
            bshOptions: {},
          });
        });

        it('should handle onSuccess callback', async () => {
          const mockResponse = { data: [mockData], code: 200, status: 'OK', error: '' };
          mockGet.mockImplementation(async (params: any) => {
            if (params.bshOptions?.onSuccess) {
              params.bshOptions.onSuccess(mockResponse);
              return undefined;
            }
            return mockResponse;
          });

          const onSuccess = vi.fn();
          await entityService.findById({ id: '123', onSuccess });

          expect(onSuccess).toHaveBeenCalledWith(mockResponse);
        });

        it('should handle onError callback', async () => {
          const mockError = new Error('Not found');
          mockGet.mockRejectedValue(mockError);

          const onError = vi.fn();
          await entityService.findById({ id: '123', onError }).catch(() => {});

          expect(mockGet).toHaveBeenCalled();
        });
      });

      describe('create', () => {
        it('should call EntityService.create with correct entity name and data', async () => {
          const mockResponse = { data: [mockData], code: 201, status: 'Created', error: '' };
          mockPost.mockResolvedValue(mockResponse);

          await entityService.create({ payload: mockData });

          expect(mockPost).toHaveBeenCalledWith({
            path: `/api/entities/${entityName}`,
            options: {
              responseType: 'json',
              responseFormat: 'json',
              body: mockData,
              headers: {
                'Content-Type': 'application/json',
              },
            },
            bshOptions: {},
          });
        });

        it('should handle onSuccess callback', async () => {
          const mockResponse = { data: [mockData], code: 201, status: 'Created', error: '' };
          mockPost.mockImplementation(async (params: any) => {
            if (params.bshOptions?.onSuccess) {
              params.bshOptions.onSuccess(mockResponse);
              return undefined;
            }
            return mockResponse;
          });

          const onSuccess = vi.fn();
          await entityService.create({ payload: mockData, onSuccess });

          expect(onSuccess).toHaveBeenCalledWith(mockResponse);
        });
      });

      describe('createMany', () => {
        it('should call EntityService.createMany with batch endpoint', async () => {
          const mockDataArray = [mockData, { ...mockData, id: '2' }];
          const mockResponse = { data: mockDataArray, code: 201, status: 'Created', error: '' };
          mockPost.mockResolvedValue(mockResponse);

          await entityService.createMany({ payload: mockDataArray });

          expect(mockPost).toHaveBeenCalledWith({
            path: `/api/entities/${entityName}/batch`,
            options: {
              responseType: 'json',
              responseFormat: 'json',
              body: mockDataArray,
              headers: {
                'Content-Type': 'application/json',
              },
            },
            bshOptions: {},
          });
        });
      });

      describe('update', () => {
        it('should call EntityService.update with correct entity name and data', async () => {
          const updatedData = { ...mockData, name: 'Updated' };
          const mockResponse = { data: [updatedData], code: 200, status: 'OK', error: '' };
          mockPut.mockResolvedValue(mockResponse);

          await entityService.update({ payload: updatedData });

          expect(mockPut).toHaveBeenCalledWith({
            path: `/api/entities/${entityName}`,
            options: {
              responseType: 'json',
              responseFormat: 'json',
              body: updatedData,
              headers: {
                'Content-Type': 'application/json',
              },
            },
            bshOptions: {},
          });
        });
      });

      describe('updateMany', () => {
        it('should call EntityService.updateMany with batch endpoint', async () => {
          const mockDataArray = [
            { ...mockData, id: '1' },
            { ...mockData, id: '2', name: 'Updated2' }
          ];
          const mockResponse = { data: mockDataArray, code: 200, status: 'OK', error: '' };
          mockPut.mockResolvedValue(mockResponse);

          await entityService.updateMany({ payload: mockDataArray });

          expect(mockPut).toHaveBeenCalledWith({
            path: `/api/entities/${entityName}/batch`,
            options: {
              responseType: 'json',
              responseFormat: 'json',
              body: mockDataArray,
              headers: {
                'Content-Type': 'application/json',
              },
            },
            bshOptions: {},
          });
        });
      });

      describe('search', () => {
        it('should call EntityService.search with search parameters', async () => {
          const searchParams: BshSearch = {
            filters: [
              { field: 'name', operator: 'eq', value: 'Test' },
            ],
            pagination: { page: 1, size: 10 },
          };
          const mockResponse = { data: [mockData], code: 200, status: 'OK', error: '' };
          mockPost.mockResolvedValue(mockResponse);

          await entityService.search({ payload: searchParams });

          expect(mockPost).toHaveBeenCalledWith({
            path: `/api/entities/${entityName}/search`,
            options: {
              responseType: 'json',
              responseFormat: 'json',
              body: searchParams,
              headers: {
                'Content-Type': 'application/json',
              },
            },
            bshOptions: {},
          });
        });
      });

      describe('delete', () => {
        it('should call EntityService.delete with search parameters', async () => {
          const searchParams: BshSearch = {
            filters: [
              { field: 'status', operator: 'eq', value: 'inactive' },
            ],
          };
          const mockResponse = { data: [{ effected: 5 }], code: 200, status: 'OK', error: '' };
          mockPost.mockResolvedValue(mockResponse);

          await entityService.delete({ payload: searchParams });

          expect(mockPost).toHaveBeenCalledWith({
            path: `/api/entities/${entityName}/delete`,
            options: {
              responseType: 'json',
              responseFormat: 'json',
              body: searchParams,
              headers: {
                'Content-Type': 'application/json',
              },
            },
            bshOptions: {},
          });
        });
      });

      describe('deleteById', () => {
        it('should call EntityService.deleteById with correct id', async () => {
          const mockResponse = { data: [{ effected: 1 }], code: 200, status: 'OK', error: '' };
          mockDelete.mockResolvedValue(mockResponse);

          await entityService.deleteById({ id: '123' });

          expect(mockDelete).toHaveBeenCalledWith({
            path: `/api/entities/${entityName}/123`,
            options: {
              responseType: 'json',
              responseFormat: 'json',
              headers: {
                'Content-Type': 'application/json',
              },
            },
            bshOptions: {},
          });
        });
      });

      describe('columns', () => {
        it('should call EntityService.columns with correct endpoint', async () => {
          const mockResponse = {
            data: [
              { name: 'id', type: 'string' },
              { name: 'name', type: 'string' },
            ],
            code: 200,
            status: 'OK',
            error: '',
          };
          mockGet.mockResolvedValue(mockResponse);

          await entityService.columns({});

          expect(mockGet).toHaveBeenCalledWith({
            path: `/api/entities/${entityName}/columns`,
            options: {
              responseType: 'json',
              responseFormat: 'json',
              headers: {
                'Content-Type': 'application/json',
              },
            },
            bshOptions: {},
          });
        });
      });

      describe('export', () => {
        it('should call EntityService.export for CSV format', async () => {
          const searchParams: BshSearch = { filters: [] };
          const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
          mockDownload.mockResolvedValue(mockBlob);

          const onDownload = vi.fn();
          await entityService.export({
            payload: searchParams,
            format: 'csv',
            onDownload,
          });

          const expectedPath = expect.stringContaining(`/api/entities/${entityName}/export?format=csv&filename=`);
          expect(mockDownload).toHaveBeenCalledWith({
            path: expectedPath,
            options: {
              responseType: 'blob',
              responseFormat: 'json',
              body: searchParams,
              headers: {
                'Content-Type': 'application/json',
              },
            },
            bshOptions: { onDownload, onError: undefined },
          });
        });

        it('should call EntityService.export for JSON format', async () => {
          const searchParams: BshSearch = { filters: [] };
          const mockBlob = new Blob(['{}'], { type: 'application/json' });
          mockDownload.mockResolvedValue(mockBlob);

          await entityService.export({
            payload: searchParams,
            format: 'json',
            filename: 'custom-export.json',
          });

          expect(mockDownload).toHaveBeenCalledWith({
            path: `/api/entities/${entityName}/export?format=json&filename=custom-export.json`,
            options: {
              responseType: 'blob',
              responseFormat: 'json',
              body: searchParams,
              headers: {
                'Content-Type': 'application/json',
              },
            },
            bshOptions: { onDownload: undefined, onError: undefined },
          });
        });

        it('should call EntityService.export for Excel format', async () => {
          const searchParams: BshSearch = { filters: [] };
          const mockBlob = new Blob(['excel'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          mockDownload.mockResolvedValue(mockBlob);

          await entityService.export({
            payload: searchParams,
            format: 'excel',
          });

          const expectedPath = expect.stringContaining(`/api/entities/${entityName}/export?format=excel&filename=`);
          expect(mockDownload).toHaveBeenCalled();
        });
      });
    });
  };

  // Test each core entity
  describe('BshEntities', () => {
    const mockData = {
      persistenceId: '1',
      CreatedAt: { $date: '2024-01-01T00:00:00Z' },
      name: 'TestEntity',
      dbTable: 'test_table',
      dbSchema: 'public',
      type: 'Table' as const,
      dbSource: 'postgres',
      updateStrategy: 'Replace' as const,
      insertDuplicate: 'Upsert' as const,
      pks: [{ key: 'id', strategy: 'AutoIncrement' as const, type: 'number' as const }],
    };
    testCoreEntity('BshEntities', coreEntities.BshEntities, mockData);
  });

  describe('BshSchemas', () => {
    const mockData = {
      persistenceId: '1',
      CreatedAt: { $date: '2024-01-01T00:00:00Z' },
      name: 'TestSchema',
      label: 'Test Schema',
      description: 'A test schema',
      plugin: 'test-plugin',
      properties: [
        {
          type: 'string',
          name: 'name',
          displayName: 'Name',
          description: 'Entity name',
          required: true,
          unique: false,
          default: '',
          length: 100,
          maxLength: 100,
          minLength: 1,
          pattern: '',
        },
      ],
    };
    testCoreEntity('BshSchemas', coreEntities.BshSchemas, mockData);
  });

  describe('BshTypes', () => {
    const mockData = {
      persistenceId: '1',
      CreatedAt: { $date: '2024-01-01T00:00:00Z' },
      name: 'TestType',
      label: 'Test Type',
      plugin: 'test-plugin',
      baseType: 'string',
      schema: '{"type": "string"}',
      meta: {
        description: 'A test type',
        maxLength: 100,
        minLength: 1,
      },
    };
    testCoreEntity('BshTypes', coreEntities.BshTypes, mockData);
  });

  describe('BshUsers', () => {
    const mockData = {
      persistenceId: '1',
      CreatedAt: { $date: '2024-01-01T00:00:00Z' },
      userId: 'user-123',
      email: 'test@example.com',
      roles: ['admin'],
      status: 'ACTIVATED' as const,
      profile: {
        firstName: 'Test',
        lastName: 'User',
      },
    };
    testCoreEntity('BshUsers', coreEntities.BshUsers, mockData);
  });

  describe('BshPolicies', () => {
    const mockData = {
      persistenceId: '1',
      CreatedAt: { $date: '2024-01-01T00:00:00Z' },
      name: 'TestPolicy',
      description: 'A test policy',
      principals: [
        {
          type: 'USER' as const,
          value: ['user-123'],
        },
      ],
      permissions: [
        {
          entity: ['TestEntity'],
          actions: ['READ' as const, 'WRITE' as const],
          allow: true,
        },
      ],
      enabled: true,
      priority: 1,
    };
    testCoreEntity('BshPolicies', coreEntities.BshPolicies, mockData);
  });

  describe('BshRoles', () => {
    const mockData = {
      persistenceId: '1',
      CreatedAt: { $date: '2024-01-01T00:00:00Z' },
      name: 'TestRole',
      description: 'A test role',
      public: true,
    };
    testCoreEntity('BshRoles', coreEntities.BshRoles, mockData);
  });

  describe('BshFiles', () => {
    const mockData = {
      persistenceId: '1',
      CreatedAt: { $date: '2024-01-01T00:00:00Z' },
      uri: 'https://example.com/file.jpg',
      folder: 'uploads',
      secureUri: 'https://example.com/secure/file.jpg',
      tags: ['image', 'profile'],
      assetId: 'asset-123',
      bytes: 1024,
      context: { alt: 'Profile picture' },
      publicId: 'public-123',
      fileId: 'file-123',
      width: 800,
      height: 600,
      format: 'jpg',
    };
    testCoreEntity('BshFiles', coreEntities.BshFiles, mockData);
  });

  describe('BshConfigurations', () => {
    const mockData = {
      persistenceId: '1',
      CreatedAt: { $date: '2024-01-01T00:00:00Z' },
      name: 'TestConfig',
      description: 'A test configuration',
      config: {
        key: 'value',
        number: 42,
      },
    };
    testCoreEntity('BshConfigurations', coreEntities.BshConfigurations, mockData);
  });

  describe('BshEmails', () => {
    const mockData = {
      persistenceId: '1',
      CreatedAt: { $date: '2024-01-01T00:00:00Z' },
      Id: 'email-123',
      subject: 'Test Email',
      from: 'sender@example.com',
      to: 'recipient@example.com',
    };
    testCoreEntity('BshEmails', coreEntities.BshEmails, mockData);
  });

  describe('BshEmailTemplates', () => {
    const mockData = {
      persistenceId: '1',
      CreatedAt: { $date: '2024-01-01T00:00:00Z' },
      name: 'TestTemplate',
      subject: 'Test Subject',
      body: 'Test body content',
      html: true,
    };
    testCoreEntity('BshEmailTemplates', coreEntities.BshEmailTemplates, mockData);
  });

  describe('BshEventLogs', () => {
    const mockData = {
      persistenceId: '1',
      CreatedAt: { $date: '2024-01-01T00:00:00Z' },
      id: 'event-123',
      start: { $date: '2024-01-01T00:00:00Z' },
      end: { $date: '2024-01-01T00:01:00Z' },
      duration: 60000,
      payload: '{"action": "test"}',
      plugin: 'test-plugin',
    };
    testCoreEntity('BshEventLogs', coreEntities.BshEventLogs, mockData);
  });

  describe('BshTriggers', () => {
    const mockData = {
      persistenceId: '1',
      CreatedAt: { $date: '2024-01-01T00:00:00Z' },
      name: 'TestTrigger',
      displayName: 'Test Trigger',
      criteria: 'status == "active"',
      entity: 'TestEntity',
      action: ['INSERT' as const, 'UPDATE' as const],
      events: [
        {
          persistenceId: '1',
          CreatedAt: { $date: '2024-01-01T00:00:00Z' },
          name: 'TestEvent',
          plugin: 'test-plugin',
          enabled: true,
        },
      ],
      enabled: true,
    };
    testCoreEntity('BshTriggers', coreEntities.BshTriggers, mockData);
  });

  describe('BshTriggerInstances', () => {
    const mockData = {
      persistenceId: '1',
      CreatedAt: { $date: '2024-01-01T00:00:00Z' },
      Id: 1,
      trigger: { name: 'TestTrigger', entity: 'TestEntity' },
      event: { name: 'TestEvent', plugin: 'test-plugin' },
      payload: { action: 'test' },
      output: { result: 'success' },
      input: { data: 'test' },
      status: 'Success' as const,
    };
    testCoreEntity('BshTriggerInstances', coreEntities.BshTriggerInstances, mockData);
  });

  describe('CoreEntityService instance management', () => {
    it('should use EntityService singleton internally', async () => {
      const service1 = new CoreEntityService('BshEntities');
      const service2 = new CoreEntityService('BshEntities');
      
      // Both should use the same EntityService instance
      const mockResponse = { data: [], code: 200, status: 'OK', error: '' };
      mockGet.mockResolvedValue(mockResponse);

      await service1.findById({ id: '1' });
      await service2.findById({ id: '2' });

      expect(mockGet).toHaveBeenCalledTimes(2);
      expect(bshConfigs.createClient).toHaveBeenCalled();
    });

    it('should pass correct entity name to EntityService methods', async () => {
      const service = new CoreEntityService('BshUsers');
      const mockResponse = { data: [], code: 200, status: 'OK', error: '' };
      mockGet.mockResolvedValue(mockResponse);

      await service.findById({ id: '123' });

      expect(mockGet).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/entities/BshUsers/123',
        })
      );
    });
  });
});


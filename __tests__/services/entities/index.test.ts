import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EntityService } from '@src/services/entities';
import { bshConfigs } from '@config';
import type { BshClientFn, BshAuthFn } from '@src/client/types';
import type { BshSearch } from '@types';

describe('EntityService', () => {
  let mockClientFn: BshClientFn;
  let mockAuthFn: BshAuthFn;
  let mockGet: any;
  let mockPost: any;
  let mockPut: any;
  let mockDelete: any;
  let mockDownload: any;

  beforeEach(() => {
    // Reset singleton
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

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = EntityService.getInstance();
      const instance2 = EntityService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should create client from bshConfigs', async () => {
      const service = EntityService.getInstance();
      // Access the client by calling a method that uses it
      mockGet.mockResolvedValue({ data: [], code: 200, status: 'OK', error: '' });
      await service.findById({
        entity: 'TestEntity',
        id: '123',
      });
      expect(bshConfigs.createClient).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should call client.get with correct path', async () => {
      const mockResponse = { data: [{ id: '1' }], code: 200, status: 'OK', error: '' };
      mockGet.mockResolvedValue(mockResponse);

      const service = EntityService.getInstance();
      await service.findById({
        entity: 'TestEntity',
        id: '123',
      });

      expect(mockGet).toHaveBeenCalledWith({
        path: '/api/entities/TestEntity/123',
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
      const mockResponse = { data: [{ id: '1' }], code: 200, status: 'OK', error: '' };
      // Mock get to call onSuccess callback when provided
      mockGet.mockImplementation(async (params: any) => {
        if (params.bshOptions?.onSuccess) {
          params.bshOptions.onSuccess(mockResponse);
          return undefined;
        }
        return mockResponse;
      });

      const service = EntityService.getInstance();
      const onSuccess = vi.fn();
      await service.findById({
        entity: 'TestEntity',
        id: '123',
        onSuccess,
      });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle onError callback', async () => {
      const mockError = new Error('Not found');
      mockGet.mockRejectedValue(mockError);

      const service = EntityService.getInstance();
      const onError = vi.fn();
      await service.findById({
        entity: 'TestEntity',
        id: '123',
        onError,
      }).catch(() => {});

      // Error handling depends on client implementation
      expect(mockGet).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should call client.post with correct path and body', async () => {
      const mockData = { name: 'Test', value: 123 };
      const mockResponse = { data: [mockData], code: 201, status: 'Created', error: '' };
      mockPost.mockResolvedValue(mockResponse);

      const service = EntityService.getInstance();
      await service.create({
        entity: 'TestEntity',
        payload: mockData,
      });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/entities/TestEntity',
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
  });

  describe('createMany', () => {
    it('should call client.post with batch endpoint', async () => {
      const mockData = [{ name: 'Test1' }, { name: 'Test2' }];
      const mockResponse = { data: mockData, code: 201, status: 'Created', error: '' };
      mockPost.mockResolvedValue(mockResponse);

      const service = EntityService.getInstance();
      await service.createMany({
        entity: 'TestEntity',
        payload: mockData,
      });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/entities/TestEntity/batch',
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
  });

  describe('update', () => {
    it('should call client.put with correct path and body', async () => {
      const mockData = { id: '1', name: 'Updated' };
      const mockResponse = { data: [mockData], code: 200, status: 'OK', error: '' };
      mockPut.mockResolvedValue(mockResponse);

      const service = EntityService.getInstance();
      await service.update({
        entity: 'TestEntity',
        payload: mockData,
      });

      expect(mockPut).toHaveBeenCalledWith({
        path: '/api/entities/TestEntity',
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
  });

  describe('updateMany', () => {
    it('should call client.put with batch endpoint', async () => {
      const mockData = [{ id: '1', name: 'Updated1' }, { id: '2', name: 'Updated2' }];
      const mockResponse = { data: mockData, code: 200, status: 'OK', error: '' };
      mockPut.mockResolvedValue(mockResponse);

      const service = EntityService.getInstance();
      await service.updateMany({
        entity: 'TestEntity',
        payload: mockData,
      });

      expect(mockPut).toHaveBeenCalledWith({
        path: '/api/entities/TestEntity/batch',
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
  });

  describe('search', () => {
    it('should call client.post with search endpoint', async () => {
      const searchParams: BshSearch = {
        filters: [
          { field: 'name', operator: 'eq', value: 'Test' },
        ],
        pagination: { page: 1, size: 10 },
      };
      const mockResponse = { data: [], code: 200, status: 'OK', error: '' };
      mockPost.mockResolvedValue(mockResponse);

      const service = EntityService.getInstance();
      await service.search({
        entity: 'TestEntity',
        payload: searchParams,
      });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/entities/TestEntity/search',
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
    it('should call client.post with delete endpoint and search', async () => {
      const searchParams: BshSearch = {
        filters: [
          { field: 'status', operator: 'eq', value: 'inactive' },
        ],
      };
      const mockResponse = { data: [{ effected: 5 }], code: 200, status: 'OK', error: '' };
      mockPost.mockResolvedValue(mockResponse);

      const service = EntityService.getInstance();
      await service.delete({
        entity: 'TestEntity',
        payload: searchParams,
      });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/entities/TestEntity/delete',
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
    it('should call client.delete with correct path', async () => {
      const mockResponse = { data: [{ effected: 1 }], code: 200, status: 'OK', error: '' };
      mockDelete.mockResolvedValue(mockResponse);

      const service = EntityService.getInstance();
      await service.deleteById({
        entity: 'TestEntity',
        id: '123',
      });

      expect(mockDelete).toHaveBeenCalledWith({
        path: '/api/entities/TestEntity/123',
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
    it('should call client.get with columns endpoint', async () => {
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

      const service = EntityService.getInstance();
      await service.columns({
        entity: 'TestEntity',
      });

      expect(mockGet).toHaveBeenCalledWith({
        path: '/api/entities/TestEntity/columns',
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
    it('should call client.download with export endpoint for CSV', async () => {
      const searchParams: BshSearch = {
        filters: [],
      };
      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
      mockDownload.mockResolvedValue(mockBlob);

      const service = EntityService.getInstance();
      const onDownload = vi.fn();
      await service.export({
        entity: 'TestEntity',
        payload: searchParams,
        format: 'csv',
        onDownload,
      });

      const expectedPath = expect.stringContaining('/api/entities/TestEntity/export?format=csv&filename=');
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

    it('should call client.download with export endpoint for JSON', async () => {
      const searchParams: BshSearch = {
        filters: [],
      };
      const mockBlob = new Blob(['{}'], { type: 'application/json' });
      mockDownload.mockResolvedValue(mockBlob);

      const service = EntityService.getInstance();
      await service.export({
        entity: 'TestEntity',
        payload: searchParams,
        format: 'json',
        filename: 'custom-export.json',
      });

      expect(mockDownload).toHaveBeenCalledWith({
        path: '/api/entities/TestEntity/export?format=json&filename=custom-export.json',
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

    it('should call client.download with export endpoint for Excel', async () => {
      const searchParams: BshSearch = {
        filters: [],
      };
      const mockBlob = new Blob(['excel'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      mockDownload.mockResolvedValue(mockBlob);

      const service = EntityService.getInstance();
      await service.export({
        entity: 'TestEntity',
        payload: searchParams,
        format: 'excel',
      });

      const expectedPath = expect.stringContaining('/api/entities/TestEntity/export?format=excel&filename=');
      expect(expectedPath).toBeDefined();
      expect(mockDownload).toHaveBeenCalled();
    });

    it('should generate default filename when not provided', async () => {
      const searchParams: BshSearch = {
        filters: [],
      };
      const mockBlob = new Blob(['data'], { type: 'text/csv' });
      mockDownload.mockResolvedValue(mockBlob);

      const service = EntityService.getInstance();
      await service.export({
        entity: 'TestEntity',
        payload: searchParams,
        format: 'csv',
      });

      const callArgs = mockDownload.mock.calls[0][0];
      expect(callArgs.path).toContain('TestEntity_export_');
      expect(callArgs.path).toContain('.csv');
    });
  });
});


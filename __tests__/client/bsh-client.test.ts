import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BshClient } from '../../src/client/bsh-client';
import { BshClientFn, BshAuthFn } from '../../src/client/types';
import { BshError } from '../../src/types';

describe('BshClient', () => {
    let mockHttpClient: BshClientFn;
    let mockAuthFn: BshAuthFn | undefined;
    let client: BshClient;

    beforeEach(() => {
        mockHttpClient = vi.fn();
        mockAuthFn = undefined;
    });

    describe('constructor', () => {
        it('should create client with default values', () => {
            client = new BshClient();
            expect(client).toBeInstanceOf(BshClient);
        });

        it('should create client with custom host', () => {
            client = new BshClient('https://api.example.com');
            expect(client).toBeInstanceOf(BshClient);
        });

        it('should create client with custom httpClient', () => {
            const customClient = vi.fn();
            client = new BshClient('', customClient);
            expect(client).toBeInstanceOf(BshClient);
        });

        it('should create client with auth function', async () => {
            mockAuthFn = vi.fn().mockResolvedValue({ type: 'JWT', token: 'test-token' });
            client = new BshClient('', undefined, mockAuthFn);
            expect(client).toBeInstanceOf(BshClient);
        });
    });

    describe('getAuthHeaders', () => {
        it('should return empty headers when no auth function', async () => {
            client = new BshClient();
            // Access private method through get method which uses it
            const response = new Response(JSON.stringify({ data: [] }), { status: 200 });
            mockHttpClient = vi.fn().mockResolvedValue(response);
            client = new BshClient('', mockHttpClient);
            
            await client.get({
                path: '/test',
                options: {},
                bshOptions: {}
            });

            expect(mockHttpClient).toHaveBeenCalled();
            const callArgs = mockHttpClient.mock.calls[0][0];
            expect(callArgs.options.headers).toEqual({});
        });

        it('should add JWT Bearer token to headers', async () => {
            mockAuthFn = vi.fn().mockResolvedValue({ type: 'JWT', token: 'jwt-token-123' });
            const response = new Response(JSON.stringify({ data: [] }), { status: 200 });
            mockHttpClient = vi.fn().mockResolvedValue(response);
            client = new BshClient('', mockHttpClient, mockAuthFn);

            await client.get({
                path: '/test',
                options: {},
                bshOptions: {}
            });

            expect(mockAuthFn).toHaveBeenCalled();
            const callArgs = mockHttpClient.mock.calls[0][0];
            expect(callArgs.options.headers).toEqual({
                Authorization: 'Bearer jwt-token-123'
            });
        });

        it('should add API key to headers', async () => {
            mockAuthFn = vi.fn().mockResolvedValue({ type: 'APIKEY', token: 'api-key-456' });
            const response = new Response(JSON.stringify({ data: [] }), { status: 200 });
            mockHttpClient = vi.fn().mockResolvedValue(response);
            client = new BshClient('', mockHttpClient, mockAuthFn);

            await client.get({
                path: '/test',
                options: {},
                bshOptions: {}
            });

            expect(mockAuthFn).toHaveBeenCalled();
            const callArgs = mockHttpClient.mock.calls[0][0];
            expect(callArgs.options.headers).toEqual({
                'X-BSH-APIKEY': 'api-key-456'
            });
        });

        it('should merge custom headers with auth headers', async () => {
            mockAuthFn = vi.fn().mockResolvedValue({ type: 'JWT', token: 'token' });
            const response = new Response(JSON.stringify({ data: [] }), { status: 200 });
            mockHttpClient = vi.fn().mockResolvedValue(response);
            client = new BshClient('', mockHttpClient, mockAuthFn);

            await client.get({
                path: '/test',
                options: {
                    headers: { 'Custom-Header': 'value' }
                },
                bshOptions: {}
            });

            const callArgs = mockHttpClient.mock.calls[0][0];
            expect(callArgs.options.headers).toEqual({
                'Custom-Header': 'value',
                Authorization: 'Bearer token'
            });
        });
    });

    describe('get', () => {
        it('should make GET request successfully', async () => {
            const mockData = { data: [{ id: 1 }], code: 200, status: 'OK', error: '', timestamp: Date.now() };
            const response = new Response(JSON.stringify(mockData), { status: 200 });
            mockHttpClient = vi.fn().mockResolvedValue(response);
            client = new BshClient('https://api.test.com', mockHttpClient);

            const result = await client.get({
                path: '/users',
                options: {},
                bshOptions: {}
            });

            expect(mockHttpClient).toHaveBeenCalledWith({
                path: 'https://api.test.com/users',
                options: {
                    method: 'GET',
                    headers: {}
                },
                bshOptions: {}
            });
            expect(result).toEqual(mockData);
        });

        it('should handle error response', async () => {
            const mockError = { data: [], code: 404, status: 'Not Found', error: 'Resource not found', timestamp: Date.now() };
            const response = new Response(JSON.stringify(mockError), { status: 404 });
            mockHttpClient = vi.fn().mockResolvedValue(response);
            client = new BshClient('', mockHttpClient);

            await expect(client.get({
                path: '/users',
                options: {},
                bshOptions: {}
            })).rejects.toThrow(BshError);
        });

        it('should call onError callback when provided', async () => {
            const mockError = { data: [], code: 500, status: 'Error', error: 'Server error', timestamp: Date.now() };
            const response = new Response(JSON.stringify(mockError), { status: 500 });
            mockHttpClient = vi.fn().mockResolvedValue(response);
            client = new BshClient('', mockHttpClient);

            const onError = vi.fn();
            const result = await client.get({
                path: '/users',
                options: {},
                bshOptions: { onError }
            });

            expect(onError).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });

        it('should call onSuccess callback when provided', async () => {
            const mockData = { data: [{ id: 1 }], code: 200, status: 'OK', error: '', timestamp: Date.now() };
            const response = new Response(JSON.stringify(mockData), { status: 200 });
            mockHttpClient = vi.fn().mockResolvedValue(response);
            client = new BshClient('', mockHttpClient);

            const onSuccess = vi.fn();
            const result = await client.get({
                path: '/users',
                options: {},
                bshOptions: { onSuccess }
            });

            expect(onSuccess).toHaveBeenCalledWith(mockData);
            expect(result).toBeUndefined();
        });
    });

    describe('post', () => {
        it('should make POST request successfully', async () => {
            const mockData = { data: [{ id: 1 }], code: 201, status: 'Created', error: '', timestamp: Date.now() };
            const response = new Response(JSON.stringify(mockData), { status: 201 });
            mockHttpClient = vi.fn().mockResolvedValue(response);
            client = new BshClient('https://api.test.com', mockHttpClient);

            const payload = { name: 'Test' };
            const result = await client.post({
                path: '/users',
                options: {
                    body: payload
                },
                bshOptions: {}
            });

            expect(mockHttpClient).toHaveBeenCalledWith({
                path: 'https://api.test.com/users',
                options: {
                    method: 'POST',
                    body: payload,
                    headers: {}
                },
                bshOptions: {}
            });
            expect(result).toEqual(mockData);
        });
    });

    describe('put', () => {
        it('should make PUT request successfully', async () => {
            const mockData = { data: [{ id: 1 }], code: 200, status: 'OK', error: '', timestamp: Date.now() };
            const response = new Response(JSON.stringify(mockData), { status: 200 });
            mockHttpClient = vi.fn().mockResolvedValue(response);
            client = new BshClient('https://api.test.com', mockHttpClient);

            const payload = { name: 'Updated' };
            const result = await client.put({
                path: '/users/1',
                options: {
                    body: payload
                },
                bshOptions: {}
            });

            expect(mockHttpClient).toHaveBeenCalledWith({
                path: 'https://api.test.com/users/1',
                options: {
                    method: 'PUT',
                    body: payload,
                    headers: {}
                },
                bshOptions: {}
            });
            expect(result).toEqual(mockData);
        });
    });

    describe('delete', () => {
        it('should make DELETE request successfully', async () => {
            const mockData = { data: [], code: 200, status: 'OK', error: '', timestamp: Date.now() };
            const response = new Response(JSON.stringify(mockData), { status: 200 });
            mockHttpClient = vi.fn().mockResolvedValue(response);
            client = new BshClient('https://api.test.com', mockHttpClient);

            const result = await client.delete({
                path: '/users/1',
                options: {},
                bshOptions: {}
            });

            expect(mockHttpClient).toHaveBeenCalledWith({
                path: 'https://api.test.com/users/1',
                options: {
                    method: 'DELETE',
                    headers: {}
                },
                bshOptions: {}
            });
            expect(result).toEqual(mockData);
        });
    });

    describe('patch', () => {
        it('should make PATCH request successfully', async () => {
            const mockData = { data: [{ id: 1 }], code: 200, status: 'OK', error: '', timestamp: Date.now() };
            const response = new Response(JSON.stringify(mockData), { status: 200 });
            mockHttpClient = vi.fn().mockResolvedValue(response);
            client = new BshClient('https://api.test.com', mockHttpClient);

            const payload = { name: 'Patched' };
            const result = await client.patch({
                path: '/users/1',
                options: {
                    body: payload
                },
                bshOptions: {}
            });

            expect(mockHttpClient).toHaveBeenCalledWith({
                path: 'https://api.test.com/users/1',
                options: {
                    method: 'PATCH',
                    body: payload,
                    headers: {}
                },
                bshOptions: {}
            });
            expect(result).toEqual(mockData);
        });
    });

    describe('download', () => {
        it('should download blob successfully', async () => {
            const blob = new Blob(['test content'], { type: 'application/pdf' });
            const response = new Response(blob, { status: 200 });
            mockHttpClient = vi.fn().mockResolvedValue(response);
            client = new BshClient('https://api.test.com', mockHttpClient);

            const result = await client.download({
                path: '/files/1',
                options: {},
                bshOptions: {}
            });

            expect(mockHttpClient).toHaveBeenCalledWith({
                path: 'https://api.test.com/files/1',
                options: {
                    headers: {}
                },
                bshOptions: {}
            });
            expect(result).toBeInstanceOf(Blob);
        });

        it('should call onDownload callback when provided', async () => {
            const blob = new Blob(['test'], { type: 'text/plain' });
            const response = new Response(blob, { status: 200 });
            mockHttpClient = vi.fn().mockResolvedValue(response);
            client = new BshClient('', mockHttpClient);

            const onDownload = vi.fn();
            const result = await client.download({
                path: '/files/1',
                options: {},
                bshOptions: { onDownload }
            });

            expect(onDownload).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });
});


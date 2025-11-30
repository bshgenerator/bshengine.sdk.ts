import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BshClient } from '../../src/client/bsh-client';
import { BshAuthFn, BshPostInterceptor, BshErrorInterceptor, BshPreInterceptor } from '../../src/client/types';
import { BshError, BshResponse } from '../../src/types';
import { BshEngine } from '../../src/bshengine';

describe('BshClient', () => {
    let mockHttpClient: ReturnType<typeof vi.fn>;
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

    describe('interceptors', () => {
        let engine: BshEngine;
        let mockHttpClient: ReturnType<typeof vi.fn>;

        beforeEach(() => {
            engine = new BshEngine();
            mockHttpClient = vi.fn();
        });

        describe('postInterceptor', () => {
            it('should call post interceptor on successful response', async () => {
                const mockData: BshResponse<{ id: number }> = {
                    data: [{ id: 1 }],
                    code: 200,
                    status: 'OK',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 200 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const postInterceptor: BshPostInterceptor = vi.fn().mockImplementation(async (result) => {
                    return result;
                });

                engine.postInterceptor(postInterceptor);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await client.get({
                    path: '/test',
                    options: {},
                    bshOptions: {}
                });

                expect(postInterceptor).toHaveBeenCalledTimes(1);
                expect(postInterceptor).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: [{ id: 1 }],
                        code: 200
                    }),
                    expect.any(Object)
                );
            });

            it('should allow post interceptor to modify response', async () => {
                const mockData: BshResponse<{ id: number }> = {
                    data: [{ id: 1 }],
                    code: 200,
                    status: 'OK',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 200 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const modifiedData: BshResponse<{ id: number; modified: boolean }> = {
                    data: [{ id: 1, modified: true }],
                    code: 200,
                    status: 'OK',
                    error: '',
                    timestamp: Date.now()
                };

                const postInterceptor: BshPostInterceptor = vi.fn().mockResolvedValue(modifiedData);

                engine.postInterceptor(postInterceptor);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                const result = await client.get({
                    path: '/test',
                    options: {},
                    bshOptions: {}
                });

                expect(result).toEqual(modifiedData);
                expect(postInterceptor).toHaveBeenCalledTimes(1);
            });

            it('should call multiple post interceptors in order', async () => {
                const mockData: BshResponse<{ id: number }> = {
                    data: [{ id: 1 }],
                    code: 200,
                    status: 'OK',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 200 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const callOrder: number[] = [];
                const interceptor1: BshPostInterceptor = vi.fn().mockImplementation(async (result) => {
                    callOrder.push(1);
                    return result;
                });
                const interceptor2: BshPostInterceptor = vi.fn().mockImplementation(async (result) => {
                    callOrder.push(2);
                    return result;
                });

                engine.postInterceptor(interceptor1);
                engine.postInterceptor(interceptor2);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await client.get({
                    path: '/test',
                    options: {},
                    bshOptions: {}
                });

                expect(interceptor1).toHaveBeenCalledTimes(1);
                expect(interceptor2).toHaveBeenCalledTimes(1);
                expect(callOrder).toEqual([1, 2]);
            });

            it('should chain post interceptors correctly', async () => {
                const mockData: BshResponse<{ id: number }> = {
                    data: [{ id: 1 }],
                    code: 200,
                    status: 'OK',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 200 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const interceptor1: BshPostInterceptor = vi.fn().mockImplementation(async (result) => {
                    return { ...result, data: [{ id: 2 }] };
                });
                const interceptor2: BshPostInterceptor = vi.fn().mockImplementation(async (result) => {
                    return { ...result, data: [{ id: 3 }] };
                });

                engine.postInterceptor(interceptor1);
                engine.postInterceptor(interceptor2);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                const result = await client.get({
                    path: '/test',
                    options: {},
                    bshOptions: {}
                });

                expect(interceptor1).toHaveBeenCalledWith(
                    expect.objectContaining({ data: [{ id: 1 }] }),
                    expect.any(Object)
                );
                expect(interceptor2).toHaveBeenCalledWith(
                    expect.objectContaining({ data: [{ id: 2 }] }),
                    expect.any(Object)
                );
                expect(result?.data).toEqual([{ id: 3 }]);
            });

            it('should not call post interceptor when onSuccess callback is provided', async () => {
                const mockData: BshResponse<{ id: number }> = {
                    data: [{ id: 1 }],
                    code: 200,
                    status: 'OK',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 200 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const postInterceptor: BshPostInterceptor = vi.fn();
                const onSuccess = vi.fn();

                engine.postInterceptor(postInterceptor);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await client.get({
                    path: '/test',
                    options: {},
                    bshOptions: { onSuccess }
                });

                expect(postInterceptor).not.toHaveBeenCalled();
                expect(onSuccess).toHaveBeenCalled();
            });
        });

        describe('errorInterceptor', () => {
            it('should call error interceptor on error response', async () => {
                const mockError = {
                    data: [],
                    code: 404,
                    status: 'Not Found',
                    error: 'Resource not found',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockError), { status: 404 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const errorInterceptor: BshErrorInterceptor = vi.fn().mockImplementation(async (error) => {
                    return error;
                });

                engine.errorInterceptor(errorInterceptor);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await expect(client.get({
                    path: '/test',
                    options: {},
                    bshOptions: {}
                })).rejects.toThrow(BshError);

                expect(errorInterceptor).toHaveBeenCalledTimes(1);
                expect(errorInterceptor).toHaveBeenCalledWith(
                    expect.any(BshError),
                    expect.objectContaining({
                        code: 404,
                        error: 'Resource not found'
                    }),
                    expect.any(Object)
                );
            });

            it('should allow error interceptor to modify error', async () => {
                const mockError = {
                    data: [],
                    code: 404,
                    status: 'Not Found',
                    error: 'Resource not found',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockError), { status: 404 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const modifiedError = new BshError(500, '/test', {
                    data: [],
                    code: 500,
                    status: 'Internal Server Error',
                    error: 'Modified error',
                    timestamp: Date.now()
                });

                const errorInterceptor = vi.fn<BshErrorInterceptor>().mockResolvedValue(modifiedError);

                engine.errorInterceptor(errorInterceptor);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await expect(client.get({
                    path: '/test',
                    options: {},
                    bshOptions: {}
                })).rejects.toThrow(BshError);

                expect(errorInterceptor).toHaveBeenCalled();
                // Verify the interceptor was called with the original error
                const callArgs = errorInterceptor.mock.calls[0];
                expect(callArgs[0]).toBeInstanceOf(BshError);
                expect(callArgs[0].status).toBe(404);
            });

            it('should call multiple error interceptors in order', async () => {
                const mockError = {
                    data: [],
                    code: 500,
                    status: 'Error',
                    error: 'Server error',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockError), { status: 500 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const callOrder: number[] = [];
                const interceptor1: BshErrorInterceptor = vi.fn().mockImplementation(async (error) => {
                    callOrder.push(1);
                    return error;
                });
                const interceptor2: BshErrorInterceptor = vi.fn().mockImplementation(async (error) => {
                    callOrder.push(2);
                    return error;
                });

                engine.errorInterceptor(interceptor1);
                engine.errorInterceptor(interceptor2);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await expect(client.get({
                    path: '/test',
                    options: {},
                    bshOptions: {}
                })).rejects.toThrow(BshError);

                expect(interceptor1).toHaveBeenCalledTimes(1);
                expect(interceptor2).toHaveBeenCalledTimes(1);
                expect(callOrder).toEqual([1, 2]);
            });

            it('should call error interceptor before onError callback', async () => {
                const mockError = {
                    data: [],
                    code: 500,
                    status: 'Error',
                    error: 'Server error',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockError), { status: 500 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const callOrder: string[] = [];
                const errorInterceptor: BshErrorInterceptor = vi.fn().mockImplementation(async (error) => {
                    callOrder.push('interceptor');
                    return error;
                });
                const onError = vi.fn().mockImplementation(() => {
                    callOrder.push('onError');
                });

                engine.errorInterceptor(errorInterceptor);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await client.get({
                    path: '/test',
                    options: {},
                    bshOptions: { onError }
                });

                expect(errorInterceptor).toHaveBeenCalled();
                expect(onError).toHaveBeenCalled();
                expect(callOrder).toEqual(['interceptor', 'onError']);
            });

            it('should handle error interceptor returning undefined', async () => {
                const mockError = {
                    data: [],
                    code: 404,
                    status: 'Not Found',
                    error: 'Resource not found',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockError), { status: 404 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const errorInterceptor: BshErrorInterceptor = vi.fn().mockResolvedValue(undefined);

                engine.errorInterceptor(errorInterceptor);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await expect(client.get({
                    path: '/test',
                    options: {},
                    bshOptions: {}
                })).rejects.toThrow(BshError);

                expect(errorInterceptor).toHaveBeenCalled();
            });
        });

        describe('preInterceptor', () => {
            it('should call pre interceptor before making request', async () => {
                const mockData: BshResponse<{ id: number }> = {
                    data: [{ id: 1 }],
                    code: 200,
                    status: 'OK',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 200 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const preInterceptor: BshPreInterceptor = vi.fn().mockImplementation(async (params) => {
                    return params;
                });

                engine.preInterceptor(preInterceptor);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await client.get({
                    path: '/test',
                    options: {},
                    bshOptions: {}
                });

                expect(preInterceptor).toHaveBeenCalledTimes(1);
                expect(mockHttpClient).toHaveBeenCalledTimes(1);
                // Verify pre-interceptor was called with the correct params structure
                expect(preInterceptor).toHaveBeenCalledWith(
                    expect.objectContaining({
                        path: expect.stringContaining('/test'),
                        options: expect.objectContaining({
                            method: 'GET'
                        })
                    })
                );
            });

            it('should allow pre interceptor to modify request parameters', async () => {
                const mockData: BshResponse<{ id: number }> = {
                    data: [{ id: 1 }],
                    code: 200,
                    status: 'OK',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 200 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const modifiedPath = 'https://api.test.com/modified-path';
                const preInterceptor: BshPreInterceptor = vi.fn().mockImplementation(async (params) => {
                    return {
                        ...params,
                        path: modifiedPath
                    };
                });

                engine.preInterceptor(preInterceptor);
                engine.withClient(mockHttpClient);
                const client = new BshClient('https://api.test.com', mockHttpClient, undefined, undefined, engine);

                await client.get({
                    path: '/test',
                    options: {},
                    bshOptions: {}
                });

                expect(mockHttpClient).toHaveBeenCalledWith(
                    expect.objectContaining({
                        path: modifiedPath
                    })
                );
            });

            it('should allow pre interceptor to modify headers', async () => {
                const mockData: BshResponse<{ id: number }> = {
                    data: [{ id: 1 }],
                    code: 200,
                    status: 'OK',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 200 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const preInterceptor: BshPreInterceptor = vi.fn().mockImplementation(async (params) => {
                    return {
                        ...params,
                        options: {
                            ...params.options,
                            headers: {
                                ...params.options.headers,
                                'X-Custom-Header': 'custom-value'
                            }
                        }
                    };
                });

                engine.preInterceptor(preInterceptor);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await client.get({
                    path: '/test',
                    options: {
                        headers: { 'Original-Header': 'original' }
                    },
                    bshOptions: {}
                });

                const callArgs = mockHttpClient.mock.calls[0][0];
                expect(callArgs.options.headers).toHaveProperty('X-Custom-Header', 'custom-value');
                expect(callArgs.options.headers).toHaveProperty('Original-Header', 'original');
            });

            it('should call multiple pre interceptors in order until one returns truthy', async () => {
                const mockData: BshResponse<{ id: number }> = {
                    data: [{ id: 1 }],
                    code: 200,
                    status: 'OK',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 200 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const callOrder: number[] = [];
                const interceptor1: BshPreInterceptor = vi.fn().mockImplementation(async (params) => {
                    callOrder.push(1);
                    // Return undefined to continue to next interceptor
                    return undefined as any;
                });
                const interceptor2: BshPreInterceptor = vi.fn().mockImplementation(async (params) => {
                    callOrder.push(2);
                    return params;
                });

                engine.preInterceptor(interceptor1);
                engine.preInterceptor(interceptor2);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await client.get({
                    path: '/test',
                    options: {},
                    bshOptions: {}
                });

                expect(interceptor1).toHaveBeenCalledTimes(1);
                expect(interceptor2).toHaveBeenCalledTimes(1);
                expect(callOrder).toEqual([1, 2]);
            });

            it('should use first interceptor that returns truthy value', async () => {
                const mockData: BshResponse<{ id: number }> = {
                    data: [{ id: 1 }],
                    code: 200,
                    status: 'OK',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 200 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const interceptor1: BshPreInterceptor = vi.fn().mockImplementation(async (params) => {
                    return {
                        ...params,
                        options: {
                            ...params.options,
                            headers: {
                                ...params.options.headers,
                                'X-Interceptor-1': 'value1'
                            }
                        }
                    };
                });
                const interceptor2: BshPreInterceptor = vi.fn().mockImplementation(async (params) => {
                    return {
                        ...params,
                        options: {
                            ...params.options,
                            headers: {
                                ...params.options.headers,
                                'X-Interceptor-2': 'value2'
                            }
                        }
                    };
                });

                engine.preInterceptor(interceptor1);
                engine.preInterceptor(interceptor2);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await client.get({
                    path: '/test',
                    options: {},
                    bshOptions: {}
                });

                const callArgs = mockHttpClient.mock.calls[0][0];
                // First interceptor returns truthy, so it's used and second is not called
                expect(callArgs.options.headers).toHaveProperty('X-Interceptor-1', 'value1');
                expect(interceptor1).toHaveBeenCalledTimes(1);
                expect(interceptor2).not.toHaveBeenCalled();
            });

            it('should not call pre interceptor when none are registered', async () => {
                const mockData: BshResponse<{ id: number }> = {
                    data: [{ id: 1 }],
                    code: 200,
                    status: 'OK',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 200 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await client.get({
                    path: '/test',
                    options: {},
                    bshOptions: {}
                });

                expect(mockHttpClient).toHaveBeenCalled();
            });

            it('should apply pre interceptors to POST requests', async () => {
                const mockData: BshResponse<{ id: number }> = {
                    data: [{ id: 1 }],
                    code: 201,
                    status: 'Created',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 201 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const preInterceptor: BshPreInterceptor = vi.fn().mockImplementation(async (params) => {
                    return params;
                });

                engine.preInterceptor(preInterceptor);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await client.post({
                    path: '/test',
                    options: {
                        body: { name: 'Test' }
                    },
                    bshOptions: {}
                });

                expect(preInterceptor).toHaveBeenCalledTimes(1);
            });

            it('should apply pre interceptors to PUT requests', async () => {
                const mockData: BshResponse<{ id: number }> = {
                    data: [{ id: 1 }],
                    code: 200,
                    status: 'OK',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 200 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const preInterceptor: BshPreInterceptor = vi.fn().mockImplementation(async (params) => {
                    return params;
                });

                engine.preInterceptor(preInterceptor);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await client.put({
                    path: '/test',
                    options: {
                        body: { name: 'Updated' }
                    },
                    bshOptions: {}
                });

                expect(preInterceptor).toHaveBeenCalledTimes(1);
            });

            it('should apply pre interceptors to DELETE requests', async () => {
                const mockData: BshResponse<{ id: number }> = {
                    data: [],
                    code: 200,
                    status: 'OK',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 200 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const preInterceptor: BshPreInterceptor = vi.fn().mockImplementation(async (params) => {
                    return params;
                });

                engine.preInterceptor(preInterceptor);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await client.delete({
                    path: '/test',
                    options: {},
                    bshOptions: {}
                });

                expect(preInterceptor).toHaveBeenCalledTimes(1);
            });

            it('should apply pre interceptors to PATCH requests', async () => {
                const mockData: BshResponse<{ id: number }> = {
                    data: [{ id: 1 }],
                    code: 200,
                    status: 'OK',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 200 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const preInterceptor: BshPreInterceptor = vi.fn().mockImplementation(async (params) => {
                    return params;
                });

                engine.preInterceptor(preInterceptor);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await client.patch({
                    path: '/test',
                    options: {
                        body: { name: 'Patched' }
                    },
                    bshOptions: {}
                });

                expect(preInterceptor).toHaveBeenCalledTimes(1);
            });

            it('should apply pre interceptors to download requests', async () => {
                const blob = new Blob(['test content'], { type: 'application/pdf' });
                const response = new Response(blob, { status: 200 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const preInterceptor: BshPreInterceptor = vi.fn().mockImplementation(async (params) => {
                    return params;
                });

                engine.preInterceptor(preInterceptor);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await client.download({
                    path: '/files/1',
                    options: {},
                    bshOptions: {}
                });

                expect(preInterceptor).toHaveBeenCalledTimes(1);
            });

            it('should handle pre interceptor returning undefined by using original params', async () => {
                const mockData: BshResponse<{ id: number }> = {
                    data: [{ id: 1 }],
                    code: 200,
                    status: 'OK',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 200 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const preInterceptor: BshPreInterceptor = vi.fn().mockResolvedValue(undefined as any);
                const preInterceptor2: BshPreInterceptor = vi.fn().mockImplementation(async (params) => {
                    return params;
                });

                engine.preInterceptor(preInterceptor);
                engine.preInterceptor(preInterceptor2);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await client.get({
                    path: '/test',
                    options: {},
                    bshOptions: {}
                });

                expect(preInterceptor).toHaveBeenCalled();
                expect(preInterceptor2).toHaveBeenCalled();
                expect(mockHttpClient).toHaveBeenCalled();
            });

            it('should support pre interceptor with different request and response types', async () => {
                const mockData: BshResponse<{ id: number; name: string }> = {
                    data: [{ id: 1, name: 'Test' }],
                    code: 201,
                    status: 'Created',
                    error: '',
                    timestamp: Date.now()
                };
                const response = new Response(JSON.stringify(mockData), { status: 201 });
                mockHttpClient = vi.fn().mockResolvedValue(response);
                
                const preInterceptor: BshPreInterceptor<{ name: string }, { id: number; name: string }> = 
                    vi.fn().mockImplementation(async (params) => {
                        return params;
                    });

                engine.preInterceptor(preInterceptor as BshPreInterceptor<unknown>);
                engine.withClient(mockHttpClient);
                const client = new BshClient('', mockHttpClient, undefined, undefined, engine);

                await client.post<{ name: string }, { id: number; name: string }>({
                    path: '/test',
                    options: {
                        body: { name: 'Test' }
                    },
                    bshOptions: {}
                });

                expect(preInterceptor).toHaveBeenCalledTimes(1);
            });
        });
    });
});


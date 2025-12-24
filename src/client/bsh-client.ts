import { BshResponse, BshError } from "@types";
import { AuthToken, BshAuthFn, BshClientFn, BshClientFnParams, BshRefreshTokenFn, defaultClientFn } from "@src/client/types";
import { BshEngine } from "@src/bshengine";

export class BshClient {
    private readonly httpClient: BshClientFn;
    private readonly authFn?: BshAuthFn;
    private readonly refreshTokenFn?: BshRefreshTokenFn;
    private readonly host: string;
    private readonly bshEngine?: BshEngine;

    constructor(
        host?: string,
        httpClient?: BshClientFn,
        authFn?: BshAuthFn,
        refreshTokenFn?: BshRefreshTokenFn,
        bshEngine?: BshEngine
    ) {
        this.host = host || '';
        this.httpClient = httpClient || defaultClientFn;
        this.authFn = authFn;
        this.refreshTokenFn = refreshTokenFn;
        this.bshEngine = bshEngine;
    }

    private async handleResponse<T = any>(response: Response, params: BshClientFnParams<T>, type: 'json'): Promise<BshResponse<T> | undefined>
    private async handleResponse<T = any>(response: Response, params: BshClientFnParams<T>, type: 'blob'): Promise<Blob | undefined>
    private async handleResponse<T = any>(response: Response, params: BshClientFnParams<T>, type: 'json' | 'blob'): Promise<BshResponse<T> | Blob | undefined> {
        if (!response.ok) {
            let data: any = undefined;
            try {
                data = await response.json();
            } catch (error) {
                try {
                    data = await response.text();
                } catch (error) {
                    data = {
                        message: 'Connection Issue'
                    };
                }
            }
            let error = new BshError(response.status, params.path, data);
            if (this.bshEngine?.getErrorInterceptors().length) {
                for (const interceptor of this.bshEngine.getErrorInterceptors()) {
                    const newError = await interceptor(error, error.response, params as BshClientFnParams<any>);
                    if (newError) error = newError;
                }
            }
            if (params.bshOptions.onError) {
                params.bshOptions.onError(error);
                return undefined;
            }
            else throw error;
        }

        if (type === 'json') {
            const data = await response.json();
            if (params.bshOptions.onSuccess) {
                params.bshOptions.onSuccess(data);
                return undefined;
            }
            let result = data as BshResponse<T>;
            result.api = params.api;
            if (this.bshEngine?.getPostInterceptors().length) {
                for (const interceptor of this.bshEngine.getPostInterceptors()) {
                    const newResult = await interceptor(result, params as BshClientFnParams<any>);
                    if (newResult) result = newResult as BshResponse<T>;
                }
            }
            return result;
        }
        else if (type === 'blob') {
            const blob = await response.blob();
            if (params.bshOptions.onDownload) {
                params.bshOptions.onDownload(blob);
                return undefined;
            }
            else return blob;
        }
    }

    private async refreshTokenIfNeeded(
        auth: AuthToken,
        refreshTokenFn?: BshRefreshTokenFn
    ): Promise<AuthToken | undefined | null> {
        if (!refreshTokenFn || !auth || auth.type !== 'JWT') return auth;
        const accessToken = auth.token;
        try {
            const tokenPayload = JSON.parse(atob(accessToken.split('.')[1] || ''));
            const exp = tokenPayload.exp * 1000;
            const now = new Date().getTime();

            if (exp && now < exp) return auth;

            const refreshToken = await refreshTokenFn();
            if (!refreshToken || !this.bshEngine) return auth;

            const response = await this.bshEngine.auth.refreshToken({
                payload: { refresh: refreshToken },
                onError: () => {}
            });

            if (response) return {
                type: 'JWT',
                token: response.data[0].access
            };

            return auth;
        } catch (error) {
            return auth;
        }
    }

    private async getAuthHeaders(params: BshClientFnParams<any>): Promise<Record<string, string>> {
        if (params.path.includes('/api/auth/')) return {};

        let auth = this.authFn ? await this.authFn() : undefined;
        if (auth) {
            auth = await this.refreshTokenIfNeeded(auth, this.refreshTokenFn);
        }

        let authHeaders = {};
        if (auth) {
            if (auth.type === 'JWT') {
                authHeaders = {
                    Authorization: `Bearer ${auth.token}`
                };
            }
            else if (auth.type === 'APIKEY') {
                authHeaders = {
                    'X-BSH-APIKEY': auth.token
                };
            }
        }
        return authHeaders;
    }

    private async applyPreInterceptors<T = unknown, R = T>(params: BshClientFnParams<T, R>): Promise<BshClientFnParams<T, R>> {
        if (!this.bshEngine?.getPreInterceptors().length) return params;
        for (const interceptor of this.bshEngine.getPreInterceptors()) {
            const newParams = await interceptor(params as BshClientFnParams<unknown, unknown>);
            if (newParams) return newParams as BshClientFnParams<T, R>;
        }
        return params;
    }

    async get<T = unknown>(params: BshClientFnParams<T>): Promise<BshResponse<T> | undefined> {
        const authHeaders = await this.getAuthHeaders(params);

        let clientParams = {
            ...params,
            path: `${this.host}${params.path}`,
            options: {
                ...params.options,
                method: 'GET',
                headers: {
                    ...params.options.headers,
                    ...authHeaders
                }
            }
        } as BshClientFnParams<T>;

        clientParams = await this.applyPreInterceptors<T>(clientParams);
        const response = await this.httpClient(clientParams);
        return this.handleResponse(response, clientParams, 'json');
    }

    async post<T = unknown, R = T>(params: BshClientFnParams<T, R>): Promise<BshResponse<R> | undefined> {
        const authHeaders = await this.getAuthHeaders(params);

        let clientParams = {
            ...params,
            path: `${this.host}${params.path}`,
            options: {
                ...params.options,
                method: 'POST',
                headers: {
                    ...params.options.headers,
                    ...authHeaders
                }
            }
        } as BshClientFnParams<T, R>;

        clientParams = await this.applyPreInterceptors<T, R>(clientParams);
        const response = await this.httpClient(clientParams);
        return this.handleResponse(response, clientParams, 'json');
    }

    async put<T = unknown>(params: BshClientFnParams<T>): Promise<BshResponse<T> | undefined> {
        const authHeaders = await this.getAuthHeaders(params);
        let clientParams = {
            ...params,
            path: `${this.host}${params.path}`,
            options: {
                ...params.options,
                method: 'PUT',   
                headers: {
                    ...params.options.headers,
                    ...authHeaders
                }
            }
        } as BshClientFnParams<T>;

        clientParams = await this.applyPreInterceptors<T>(clientParams);
        const response = await this.httpClient(clientParams);
        return this.handleResponse(response, clientParams, 'json');
    }

    async delete<T = unknown>(params: BshClientFnParams<T>): Promise<BshResponse<T> | undefined> {
        const authHeaders = await this.getAuthHeaders(params);
        let clientParams = {
            ...params,
            path: `${this.host}${params.path}`,
            options: {
                ...params.options,
                method: 'DELETE',   
                headers: {
                    ...params.options.headers,
                    ...authHeaders
                }
            }
        } as BshClientFnParams<T>;

        clientParams = await this.applyPreInterceptors<T>(clientParams);
        const response = await this.httpClient(clientParams);
        return this.handleResponse(response, clientParams, 'json');
    }

    async patch<T = unknown>(params: BshClientFnParams<T>): Promise<BshResponse<T> | undefined> {
        const authHeaders = await this.getAuthHeaders(params);
        let clientParams = {
            ...params,
            path: `${this.host}${params.path}`,
            options: {
                ...params.options,
                method: 'PATCH',   
                headers: {
                    ...params.options.headers,
                    ...authHeaders
                }
            }
        } as BshClientFnParams<T>;

        clientParams = await this.applyPreInterceptors<T>(clientParams);
        const response = await this.httpClient(clientParams);
        return this.handleResponse(response, clientParams, 'json');
    }

    async download<T = unknown>(params: BshClientFnParams<T>): Promise<Blob | undefined> {
        const authHeaders = await this.getAuthHeaders(params);
        let clientParams = {
            ...params,
            path: `${this.host}${params.path}`,
            options: {
                ...params.options,
                headers: {
                    ...params.options.headers,
                    ...authHeaders
                }
            }
        } as BshClientFnParams<T>;

        clientParams = await this.applyPreInterceptors<T>(clientParams);
        const response = await this.httpClient(clientParams);
        return this.handleResponse(response, clientParams, 'blob');
    }
}

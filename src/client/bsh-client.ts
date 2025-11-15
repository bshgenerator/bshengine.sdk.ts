import { BshResponse, BshError } from "@types";
import { BshAuthFn, BshClientFn, BshClientFnParams } from "@src/client/types";

export class BshClient {
    constructor(
        private readonly host: string,
        private readonly httpClient: BshClientFn,
        private readonly authFn?: BshAuthFn
    ) { }

    private async handleResponse<T = unknown>(response: Response, params: BshClientFnParams<T>, type: 'json'): Promise<BshResponse<T> | undefined>
    private async handleResponse<T = unknown>(response: Response, params: BshClientFnParams<T>, type: 'blob'): Promise<Blob | undefined>
    private async handleResponse<T = unknown>(response: Response, params: BshClientFnParams<T>, type: 'json' | 'blob'): Promise<BshResponse<T> | Blob | undefined> {
        if (!response.ok) {
            const error = new BshError(response.status, params.path, await response.json());
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
            else return data;
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

    private async getAuthHeaders(): Promise<Record<string, string>> {
        const auth = this.authFn ? await this.authFn() : undefined;
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

    async get<T = unknown>(params: BshClientFnParams<T>): Promise<BshResponse<T> | undefined> {
        const authHeaders = await this.getAuthHeaders();

        const response = await this.httpClient({
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
        });
        return this.handleResponse(response, params, 'json');
    }

    async post<T = unknown>(params: BshClientFnParams<T>): Promise<BshResponse<T> | undefined> {
        const authHeaders = await this.getAuthHeaders();
        const response = await this.httpClient({
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
        });
        return this.handleResponse(response, params, 'json');
    }

    async put<T = unknown>(params: BshClientFnParams<T>): Promise<BshResponse<T> | undefined> {
        const authHeaders = await this.getAuthHeaders();
        const response = await this.httpClient({
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
        });
        return this.handleResponse(response, params, 'json');
    }

    async delete<T = unknown>(params: BshClientFnParams<T>): Promise<BshResponse<T> | undefined> {
        const authHeaders = await this.getAuthHeaders();
        const response = await this.httpClient({
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
        });
        return this.handleResponse(response, params, 'json');
    }

    async patch<T = unknown>(params: BshClientFnParams<T>): Promise<BshResponse<T> | undefined> {
        const authHeaders = await this.getAuthHeaders();
        const response = await this.httpClient({
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
        });
        return this.handleResponse(response, params, 'json');
    }

    async download<T = unknown>(params: BshClientFnParams<T>): Promise<Blob | undefined> {
        const authHeaders = await this.getAuthHeaders();
        const response = await this.httpClient({
            ...params,
            path: `${this.host}${params.path}`,
            options: {
                ...params.options,
                headers: {
                    ...params.options.headers,
                    ...authHeaders
                }
            }
        });
        return this.handleResponse(response, params, 'blob');
    }
}

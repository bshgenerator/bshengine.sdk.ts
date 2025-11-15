import { BshResponse, BshError } from "@types";
import { BshClientFn, BshClientFnParams } from "@src/client/types";

export class BshClient {
    constructor(
        private readonly host: string,
        private readonly httpClient: BshClientFn
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

    async get<T = unknown>(params: BshClientFnParams<T>): Promise<BshResponse<T> | undefined> {
        const response = await this.httpClient({
            ...params,
            path: `${this.host}${params.path}`,
            options: {
                ...params.options,
                method: 'GET'
            }
        });
        return this.handleResponse(response, params, 'json');
    }

    async post<T = unknown>(params: BshClientFnParams<T>): Promise<BshResponse<T> | undefined> {
        const response = await this.httpClient({
            ...params,
            path: `${this.host}${params.path}`,
            options: {
                ...params.options,
                method: 'POST'
            }
        });
        return this.handleResponse(response, params, 'json');
    }

    async put<T = unknown>(params: BshClientFnParams<T>): Promise<BshResponse<T> | undefined> {
        const response = await this.httpClient({
            ...params,
            path: `${this.host}${params.path}`,
            options: {
                ...params.options,
                method: 'PUT'
            }
        });
        return this.handleResponse(response, params, 'json');
    }

    async delete<T = unknown>(params: BshClientFnParams<T>): Promise<BshResponse<T> | undefined> {
        const response = await this.httpClient({
            ...params,
            path: `${this.host}${params.path}`,
            options: {
                ...params.options,
                method: 'DELETE'
            }
        });
        return this.handleResponse(response, params, 'json');
    }

    async patch<T = unknown>(params: BshClientFnParams<T>): Promise<BshResponse<T> | undefined> {
        const response = await this.httpClient({
            ...params,
            path: `${this.host}${params.path}`,
            options: {
                ...params.options,
                method: 'PATCH'
            }
        });
        return this.handleResponse(response, params, 'json');
    }

    async download<T = unknown>(params: BshClientFnParams<T>): Promise<Blob | undefined> {
        const response = await this.httpClient({
            ...params,
            path: `${this.host}${params.path}`
        });
        return this.handleResponse(response, params, 'blob');
    }
}

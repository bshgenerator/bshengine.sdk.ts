import { BshCallbackParams } from "@src/services";
import { BshSearch } from "@types";

export type BshClientFnParams<T = unknown, R = T> = {
    path: string,
    options: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        responseType?: 'json' | 'blob' | 'text' | 'arrayBuffer',
        requestFormat?: 'json' | 'text' | 'form',
        body?: T | BshSearch<T> | unknown,
        formData?: FormData,
        queryParams?: Record<string, string>,
        headers?: Record<string, string>,
    },
    bshOptions: BshCallbackParams<T, R>
}

export type BshClientFn = <T = unknown>(params: BshClientFnParams<T>) => Promise<Response>;

export const defaultClientFn: BshClientFn = async (params) => {
    return fetch(
        params.path,
        {
            method: params.options.method,
            body: params.options.body ? JSON.stringify(params.options.body) : undefined,
            headers: params.options.headers,
        }
    );
};

export type AuthToken = {
    type: 'JWT' | 'APIKEY';
    token: string
}

export type BshAuthFn = () => Promise<AuthToken | undefined | null>;

export type BshRefreshTokenFn = () => Promise<string | undefined | null>;

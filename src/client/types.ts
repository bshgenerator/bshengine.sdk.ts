import { BshError, BshResponse, BshSearch } from "@types";

export type BshClientFnParams<T = unknown> = {
    path: string,
    options: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        responseType?: 'json' | 'blob' | 'text' | 'arrayBuffer',
        responseFormat?: 'json' | 'text' | 'form',
        body?: T | BshSearch<T> | unknown,
        formData?: FormData,
        queryParams?: Record<string, string>,
        headers?: Record<string, string>,
    },
    bshOptions: {
        onSuccess?: (response: BshResponse<T>) => void,
        onError?: (error: BshError) => void,
        onDownload?: (blob: Blob) => void,
    }
}

export type BshClientFn = <T = unknown>(params: BshClientFnParams<T>) => Promise<Response>;

export type BshAuthFn = () => Promise<{
    type: 'JWT' | 'API_KEY';
    token: string
}>;

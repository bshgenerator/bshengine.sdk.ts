import { BshClient } from "@src/client/bsh-client";
import { BshResponse, CacheInfo, BshSearch } from "@types";
import { BshCallbackParams, BshCallbackParamsWithPayload } from "@src/services";

export type CacheRemoveResponse = {
    caches: string[];
};

export class CachingService {
    private readonly baseEndpoint = '/api/caching';

    public constructor(private readonly client: BshClient) {
    }

    public async findById(params: BshCallbackParams<unknown, CacheInfo> & { id: string }): Promise<BshResponse<CacheInfo> | undefined> {
        return this.client.get<CacheInfo>({
            path: `${this.baseEndpoint}/${params.id}`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'caching.findById',
        });
    }

    public async search(params: BshCallbackParamsWithPayload<BshSearch, CacheInfo>): Promise<BshResponse<CacheInfo> | undefined> {
        return this.client.post<CacheInfo>({
            path: `${this.baseEndpoint}/search`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'caching.search',
        });
    }

    public async names(params: BshCallbackParams<unknown, string>): Promise<BshResponse<string> | undefined> {
        return this.client.get<string>({
            path: `${this.baseEndpoint}/names`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'caching.names',
        });
    }

    public async clearById(params: BshCallbackParams<unknown, CacheRemoveResponse> & { id: string }): Promise<BshResponse<CacheRemoveResponse> | undefined> {
        return this.client.delete<CacheRemoveResponse>({
            path: `${this.baseEndpoint}/${params.id}`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'caching.clearById',
        });
    }

    public async clearAll(params: BshCallbackParams<unknown, CacheRemoveResponse>): Promise<BshResponse<CacheRemoveResponse> | undefined> {
        return this.client.delete<CacheRemoveResponse>({
            path: `${this.baseEndpoint}/all`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'caching.clearAll',
        });
    }
}


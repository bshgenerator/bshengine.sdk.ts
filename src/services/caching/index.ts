import { BshClient } from "@src/client/bsh-client";
import { BshResponse, CacheInfo, BshSearch } from "@types";
import { bshConfigs } from "@config";
import { BshCallbackParams, BshCallbackParamsWithPayload } from "@src/services";

export type CacheRemoveResponse = {
    caches: string[];
};

export class CachingService {
    private static instance: CachingService;
    private readonly baseEndpoint = '/api/caching';

    private constructor() {
    }

    private get client(): BshClient {
        return bshConfigs.createClient();
    }

    public static getInstance(): CachingService {
        if (!CachingService.instance) {
            CachingService.instance = new CachingService();
        }
        return CachingService.instance;
    }

    public async findById(params: BshCallbackParams<unknown, CacheInfo> & { id: string }): Promise<BshResponse<CacheInfo> | undefined> {
        return this.client.get<CacheInfo>({
            path: `${this.baseEndpoint}/${params.id}`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
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
        });
    }
}


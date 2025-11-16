import { BshClient } from "@src/client/bsh-client";
import { BshResponse, BshApiKeys, BshApiKeysForm, BshSearch } from "@types";
import { bshConfigs } from "@config";
import { BshCallbackParams, BshCallbackParamsWithPayload } from "@src/services";

export class ApiKeyService {
    private static instance: ApiKeyService;
    private readonly baseEndpoint = '/api/api-keys';

    private constructor() {
    }

    private get client(): BshClient {
        return bshConfigs.createClient();
    }

    public static getInstance(): ApiKeyService {
        if (!ApiKeyService.instance) {
            ApiKeyService.instance = new ApiKeyService();
        }
        return ApiKeyService.instance;
    }

    public async create(params: BshCallbackParamsWithPayload<BshApiKeysForm, BshApiKeys>): Promise<BshResponse<BshApiKeys> | undefined> {
        return this.client.post<BshApiKeys>({
            path: `${this.baseEndpoint}`,
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

    public async details(params: BshCallbackParams<unknown, BshApiKeys> & { id: number }): Promise<BshResponse<BshApiKeys> | undefined> {
        return this.client.get<BshApiKeys>({
            path: `${this.baseEndpoint}/${params.id}`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async revoke(params: BshCallbackParams<unknown, BshApiKeys> & { id: number }): Promise<BshResponse<BshApiKeys> | undefined> {
        return this.client.delete<BshApiKeys>({
            path: `${this.baseEndpoint}/${params.id}/revoke`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    // CRUD
    public async getById(params: BshCallbackParams<unknown, BshApiKeys> & { id: string }): Promise<BshResponse<BshApiKeys> | undefined> {
        return this.client.get<BshApiKeys>({
            path: `${this.baseEndpoint}/${params.id}`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async search(params: BshCallbackParamsWithPayload<BshSearch<BshApiKeys> | undefined, BshApiKeys>): Promise<BshResponse<BshApiKeys> | undefined> {
        return this.client.post<BshApiKeys>({
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

    public async list(params: BshCallbackParams<unknown, BshApiKeys> & {
        queryParams?: {
            page?: string;
            size?: string;
            sort?: string;
            filter?: string;
        }
    }): Promise<BshResponse<BshApiKeys> | undefined> {
        const urlSearchParams = new URLSearchParams();
        if (params.queryParams?.page) urlSearchParams.append('page', params.queryParams.page);
        if (params.queryParams?.size) urlSearchParams.append('size', params.queryParams.size);
        if (params.queryParams?.sort) urlSearchParams.append('sort', params.queryParams.sort);
        if (params.queryParams?.filter) urlSearchParams.append('filter', params.queryParams.filter);

        const queryString = urlSearchParams.toString();
        const endpoint = queryString ? `?${queryString}` : '';

        return this.client.get<BshApiKeys>({
            path: `${this.baseEndpoint}${endpoint}`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async deleteById(params: BshCallbackParams<unknown, BshApiKeys> & { id: string }): Promise<BshResponse<BshApiKeys> | undefined> {
        return this.client.delete<BshApiKeys>({
            path: `${this.baseEndpoint}/${params.id}`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }
}


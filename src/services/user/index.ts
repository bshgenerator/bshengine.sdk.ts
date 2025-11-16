import { BshClient } from "@src/client/bsh-client";
import { BshResponse, BshUser, BshUserInit, BshSearch } from "@types";
import { bshConfigs } from "@config";
import { BshCallbackParams, BshCallbackParamsWithPayload } from "@src/services";

export class UserService {
    private static instance: UserService;
    private readonly baseEndpoint = '/api/users';

    private constructor() {
    }

    private get client(): BshClient {
        return bshConfigs.createClient();
    }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    public async me(params: BshCallbackParams<unknown, BshUser>): Promise<BshResponse<BshUser> | undefined> {
        return this.client.get<BshUser>({
            path: `${this.baseEndpoint}/me`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async init(params: BshCallbackParamsWithPayload<BshUserInit, BshUser>): Promise<BshResponse<BshUser> | undefined> {
        return this.client.post<BshUser>({
            path: `${this.baseEndpoint}/init`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async updateProfile(params: BshCallbackParamsWithPayload<Partial<BshUser['profile']>, BshUser>): Promise<BshResponse<BshUser> | undefined> {
        return this.client.put<BshUser>({
            path: `${this.baseEndpoint}/profile`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async updatePicture(params: BshCallbackParamsWithPayload<File, BshUser>): Promise<BshResponse<BshUser> | undefined> {
        const formData = new FormData();
        formData.set('picture', params.payload);

        return this.client.post<BshUser>({
            path: `${this.baseEndpoint}/picture`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
                body: formData,
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async updatePassword(params: BshCallbackParamsWithPayload<{ currentPassword: string; newPassword: string }, { message: string }>): Promise<BshResponse<{ message: string }> | undefined> {
        return this.client.put<{ message: string }>({
            path: `${this.baseEndpoint}/password`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    // CRUD
    public async getById(params: BshCallbackParams<unknown, BshUser> & { id: string }): Promise<BshResponse<BshUser> | undefined> {
        return this.client.get<BshUser>({
            path: `${this.baseEndpoint}/${params.id}`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async search(params: BshCallbackParamsWithPayload<BshSearch<BshUser> | undefined, BshUser>): Promise<BshResponse<BshUser> | undefined> {
        return this.client.post<BshUser>({
            path: `${this.baseEndpoint}/search`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async list(params: BshCallbackParams<unknown, BshUser> & {
        queryParams?: {
            page?: string;
            size?: string;
            sort?: string;
            filter?: string;
        }
    }): Promise<BshResponse<BshUser> | undefined> {
        const urlSearchParams = new URLSearchParams();
        if (params.queryParams?.page) urlSearchParams.append('page', params.queryParams.page);
        if (params.queryParams?.size) urlSearchParams.append('size', params.queryParams.size);
        if (params.queryParams?.sort) urlSearchParams.append('sort', params.queryParams.sort);
        if (params.queryParams?.filter) urlSearchParams.append('filter', params.queryParams.filter);

        const queryString = urlSearchParams.toString();
        const endpoint = queryString ? `?${queryString}` : '';

        return this.client.get<BshUser>({
            path: `${this.baseEndpoint}${endpoint}`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async update(params: BshCallbackParamsWithPayload<Partial<BshUser>, BshUser>): Promise<BshResponse<BshUser> | undefined> {
        return this.client.put<BshUser>({
            path: `${this.baseEndpoint}`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async deleteById(params: BshCallbackParams<unknown, BshUser> & { id: string }): Promise<BshResponse<BshUser> | undefined> {
        return this.client.delete<BshUser>({
            path: `${this.baseEndpoint}/${params.id}`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }
}


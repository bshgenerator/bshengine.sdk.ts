import { BshClient } from "@src/client/bsh-client";
import { BshResponse, BshUser, BshUserInit, BshSearch } from "@types";
import { BshCallbackParams, BshCallbackParamsWithPayload, BshSearchCallbackParams } from "@src/services";
import { CoreEntities } from "@src/types/core";

export class UserService {
    private readonly baseEndpoint = '/api/users';

    public constructor(private readonly client: BshClient) {
    }

    public async me(params: BshCallbackParams<unknown, BshUser>): Promise<BshResponse<BshUser> | undefined> {
        return this.client.get<BshUser>({
            path: `${this.baseEndpoint}/me`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'user.me',
            entity: CoreEntities.BshUsers,
        });
    }

    public async init<T = BshUser>(params: BshCallbackParamsWithPayload<BshUserInit, T>): Promise<BshResponse<T> | undefined> {
        return this.client.post<T>({
            path: `${this.baseEndpoint}/init`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'user.init',
            entity: CoreEntities.BshUsers,
        });
    }

    public async updateProfile<T = BshUser>(params: BshCallbackParamsWithPayload<Partial<BshUser['profile']>, T>): Promise<BshResponse<T> | undefined> {
        return this.client.put<T>({
            path: `${this.baseEndpoint}/profile`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'user.updateProfile',
            entity: CoreEntities.BshUsers,
        });
    }

    public async updatePicture<T = BshUser>(params: BshCallbackParamsWithPayload<File, T>): Promise<BshResponse<T> | undefined> {
        const formData = new FormData();
        formData.set('picture', params.payload);

        return this.client.post<T>({
            path: `${this.baseEndpoint}/picture`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: formData,
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'user.updatePicture',
            entity: CoreEntities.BshUsers,
        });
    }

    public async updatePassword(params: BshCallbackParamsWithPayload<{ currentPassword: string; newPassword: string }, { message: string }>): Promise<BshResponse<{ message: string }> | undefined> {
        return this.client.put<{ message: string }>({
            path: `${this.baseEndpoint}/password`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'user.updatePassword',
            entity: CoreEntities.BshUsers,
        });
    }

    // CRUD
    public async getById<T = BshUser>(params: BshCallbackParams<unknown, T> & { id: string }): Promise<BshResponse<T> | undefined> {
        return this.client.get<T>({
            path: `${this.baseEndpoint}/${params.id}`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'user.getById',
            entity: CoreEntities.BshUsers,
        });
    }

    public async search<T = BshUser, R = BshUser>(params: BshSearchCallbackParams<T, R>): Promise<BshResponse<R> | undefined> {
        return this.client.post<T, R>({
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
            api: 'user.search',
            entity: CoreEntities.BshUsers,
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
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'user.list',
            entity: CoreEntities.BshUsers,
        });
    }

    public async update<T = BshUser>(params: BshCallbackParamsWithPayload<Partial<BshUser>, T>): Promise<BshResponse<T> | undefined> {
        return this.client.put<T>({
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
            api: 'user.update',
            entity: CoreEntities.BshUsers,
        });
    }

    public async deleteById<T = BshUser>(params: BshCallbackParams<unknown, T> & { id: string }): Promise<BshResponse<T> | undefined> {
        return this.client.delete<T>({
            path: `${this.baseEndpoint}/${params.id}`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'user.deleteById',
            entity: CoreEntities.BshUsers,
        });
    }

    public async count(
        params: BshCallbackParams<unknown, {count: number}>
    ): Promise<BshResponse<{count: number}> | undefined> {
        return this.client.get<{count: number}>({
            path: `${this.baseEndpoint}/count`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'user.count',
            entity: CoreEntities.BshUsers,
        });
    }

    public async countFiltered(params: BshSearchCallbackParams<BshUser, {count: number}>): Promise<BshResponse<{count: number}> | undefined> {
        return this.client.post<{count: number}>({
            path: `${this.baseEndpoint}/count`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'user.countFiltered',
            entity: CoreEntities.BshUsers,
        });
    }    
}

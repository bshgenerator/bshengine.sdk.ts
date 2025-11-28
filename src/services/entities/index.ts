import { BshClient } from "@src/client/bsh-client";
import { BshResponse, BshSearch } from "@types";
import { BshCallbackParams, BshCallbackParamsWithPayload } from "@src/services";

export type EntityFnParams<T = unknown, R = T> = BshCallbackParams<T, R> & { entity?: string }
export type EntityFnParamsWithPayload<T = unknown, R = T> = BshCallbackParamsWithPayload<T, R> & { entity?: string }
export type EntitySearchFnParams<T, R = T> = EntityFnParamsWithPayload<BshSearch<T>, R>

export class EntityService<T = unknown> {
    private readonly baseEndpoint = '/api/entities';

    public constructor(private readonly client: BshClient, private readonly entity?: string) {
    }

    // Get a single entity by ID
    public async findById<TT = T>(params: EntityFnParams<TT> & { id: string }): Promise<BshResponse<TT> | undefined> {
        return this.client.get<TT>({
            path: `${this.baseEndpoint}/${params.entity || this.entity}/${params.id}`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: `entities.${params.entity || this.entity}.${params.entity || this.entity}.findById`,
        });
    }

    // Create a new entity
    public async create<TT = T>(
        params: EntityFnParamsWithPayload<TT>
    ): Promise<BshResponse<TT> | undefined> {
        return this.client.post<TT>({
            path: `${this.baseEndpoint}/${params.entity || this.entity}`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: `entities.${params.entity || this.entity}.create`,
        });
    }

    // Create multiple entities in batch
    public async createMany<TT = T>(
        params: EntityFnParamsWithPayload<TT[], TT>
    ): Promise<BshResponse<TT> | undefined> {
        return this.client.post<TT>({
            path: `${this.baseEndpoint}/${params.entity || this.entity}/batch`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: `entities.${params.entity || this.entity}.createMany`,
        });
    }

    // Update an existing entity
    public async update<TT = T>(
        params: EntityFnParamsWithPayload<TT>
    ): Promise<BshResponse<TT> | undefined> {
        return this.client.put<TT>({
            path: `${this.baseEndpoint}/${params.entity || this.entity}`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: `entities.${params.entity || this.entity}.update`,
        });
    }

    // Update multiple entities in batch
    public async updateMany<TT = T>(
        params: EntityFnParamsWithPayload<TT[], TT>
    ): Promise<BshResponse<TT> | undefined> {
        return this.client.put<TT>({
            path: `${this.baseEndpoint}/${params.entity || this.entity}/batch`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: `entities.${params.entity || this.entity}.updateMany`,
        });
    }

    // Search for entities
    public async search<TT extends T = T, R = TT>(
        params: EntitySearchFnParams<TT, R>
    ): Promise<BshResponse<R> | undefined> {
        return this.client.post<TT, R>({
            path: `${this.baseEndpoint}/${params.entity || this.entity}/search`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: `entities.${params.entity || this.entity}.delete`,
        });
    }

    // Delete entities by search criteria
    public async delete<TT = T>(
        params: EntitySearchFnParams<TT, { effected: number }>
    ): Promise<BshResponse<{ effected: number }> | undefined> {
        return this.client.post<TT, { effected: number }>({
            path: `${this.baseEndpoint}/${params.entity || this.entity}/delete`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: `entities.${params.entity || this.entity}.delete`,
        });
    }

    // Delete a single entity by ID
    public async deleteById<TT = T>(
        params: EntityFnParams<TT, { effected: number }> & { id: string }
    ): Promise<BshResponse<{ effected: number }> | undefined> {
        return this.client.delete<{ effected: number }>({
            path: `${this.baseEndpoint}/${params.entity || this.entity}/${params.id}`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: `entities.${params.entity || this.entity}.deleteById`,
        });
    }

    // Get entity columns
    public async columns(
        params: EntityFnParams<unknown, { name: string; type: string }>
    ): Promise<BshResponse<{ name: string; type: string }> | undefined> {
        return this.client.get<{ name: string; type: string }>({
            path: `${this.baseEndpoint}/${params.entity || this.entity}/columns`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: `entities.${params.entity || this.entity}.columns`,
        });
    }

    // Export entities
    public async export<TT = T>(
        params: EntityFnParamsWithPayload<BshSearch<TT>, Blob> & {
            format: 'csv' | 'json' | 'excel',
            filename?: string,
        }
    ): Promise<void> {
        const defaultName = `${params.entity || this.entity}_export_${new Date().toISOString().split('T')[0]}`;
        const exportFilename = params.filename || `${defaultName}.${params.format == 'excel' ? 'xlsx' : params.format}`;

        await this.client.download<TT>({
            path: `${this.baseEndpoint}/${params.entity || this.entity}/export?format=${params.format}&filename=${exportFilename}`,
            options: {
                responseType: 'blob',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onDownload: params.onDownload, onError: params.onError },
            api: `entities.${params.entity || this.entity}.export`,
        });
    }
}

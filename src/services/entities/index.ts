import { BshClient } from "@src/client/bsh-client";
import { BshResponse, BshSearch } from "@types";
import { bshConfigs } from "@config";
import { BshCallbackParams, BshCallbackParamsWithPayload } from "@src/services";

export type EntityFnParams<T = unknown, R = T> = BshCallbackParams<T, R> & { entity: string }
export type EntityFnParamsWithPayload<T = unknown, R = T> = BshCallbackParamsWithPayload<T, R> & { entity: string }

export class EntityService {
    private static instance: EntityService;
    private readonly baseEndpoint = '/api/entities';

    private constructor() {
    }

    private get client(): BshClient {
        return bshConfigs.createClient();
    }

    public static getInstance(): EntityService {
        if (!EntityService.instance) {
            EntityService.instance = new EntityService();
        }
        return EntityService.instance;
    }

    // Get a single entity by ID
    public async findById<T>(params: EntityFnParams<T> & { id: string }): Promise<BshResponse<T> | undefined> {
        return this.client.get<T>({
            path: `${this.baseEndpoint}/${params.entity}/${params.id}`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    // Create a new entity
    public async create<T>(
        params: EntityFnParamsWithPayload<T>
    ): Promise<BshResponse<T> | undefined> {
        return this.client.post<T>({
            path: `${this.baseEndpoint}/${params.entity}`,
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

    // Create multiple entities in batch
    public async createMany<T>(
        params: EntityFnParamsWithPayload<T[], T>
    ): Promise<BshResponse<T> | undefined> {
        return this.client.post<T>({
            path: `${this.baseEndpoint}/${params.entity}/batch`,
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

    // Update an existing entity
    public async update<T>(
        params: EntityFnParamsWithPayload<T>
    ): Promise<BshResponse<T> | undefined> {
        return this.client.put<T>({
            path: `${this.baseEndpoint}/${params.entity}`,
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

    // Update multiple entities in batch
    public async updateMany<T>(
        params: EntityFnParamsWithPayload<T[], T>
    ): Promise<BshResponse<T> | undefined> {
        return this.client.put<T>({
            path: `${this.baseEndpoint}/${params.entity}/batch`,
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

    // Search for entities
    public async search<T>(
        params: EntityFnParamsWithPayload<BshSearch<T>, T>
    ): Promise<BshResponse<T> | undefined> {
        return this.client.post<T>({
            path: `${this.baseEndpoint}/${params.entity}/search`,
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

    // Delete entities by search criteria
    public async delete<T>(
        params: EntityFnParamsWithPayload<BshSearch<T>, { effected: number }>
    ): Promise<BshResponse<{ effected: number }> | undefined> {
        return this.client.post<{ effected: number }>({
            path: `${this.baseEndpoint}/${params.entity}/delete`,
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

    // Delete a single entity by ID
    public async deleteById<T>(
        params: EntityFnParams<T, { effected: number }> & { id: string }
    ): Promise<BshResponse<{ effected: number }> | undefined> {
        return this.client.delete<{ effected: number }>({
            path: `${this.baseEndpoint}/${params.entity}/${params.id}`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    // Get entity columns
    public async columns(
        params: EntityFnParams<unknown, { name: string; type: string }>
    ): Promise<BshResponse<{ name: string; type: string }> | undefined> {
        return this.client.get<{ name: string; type: string }>({
            path: `${this.baseEndpoint}/${params.entity}/columns`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    // Export entities
    public async export<T>(
        params: EntityFnParamsWithPayload<BshSearch<T>, Blob> & {
            format: 'csv' | 'json' | 'excel',
            filename?: string,
        }
    ): Promise<void> {
        const defaultName = `${params.entity}_export_${new Date().toISOString().split('T')[0]}`;
        const exportFilename = params.filename || `${defaultName}.${params.format == 'excel' ? 'xlsx' : params.format}`;

        await this.client.download<T>({
            path: `${this.baseEndpoint}/${params.entity}/export?format=${params.format}&filename=${exportFilename}`,
            options: {
                responseType: 'blob',
                responseFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onDownload: params.onDownload, onError: params.onError },
        });
    }
}

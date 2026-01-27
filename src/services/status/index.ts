import { BshClient } from "@src/client/bsh-client";
import { BshResponse } from "@types";
import { BshCallbackParams } from "@src/services";
import { EngineStatus, HealthCheckData } from "@src/types";

export class StatusService {
    private readonly baseEndpoint = '/api/status';

    public constructor(private readonly client: BshClient) {
    }

    public async load(params?: BshCallbackParams<unknown, EngineStatus>): Promise<BshResponse<EngineStatus> | undefined> {
        return this.client.get<EngineStatus>({
            path: this.baseEndpoint,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params?.onSuccess, onError: params?.onError },
            api: 'status.load',
        });
    }

    public async health(params?: BshCallbackParams<unknown, HealthCheckData>): Promise<BshResponse<HealthCheckData> | undefined> {
        return this.client.get<HealthCheckData>({
            path: `${this.baseEndpoint}/health`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params?.onSuccess, onError: params?.onError },
            api: 'status.health',
        });
    }
}

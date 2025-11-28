import { BshClient } from "@src/client/bsh-client";
import { BshResponse, BshSettings } from "@types";
import { BshCallbackParams, BshCallbackParamsWithPayload } from "@src/services";

export class SettingsService {
    private readonly baseEndpoint = '/api/settings';

    public constructor(private readonly client: BshClient) {
    }

    public async load(params: BshCallbackParams<unknown, BshSettings>): Promise<BshResponse<BshSettings> | undefined> {
        return this.client.get<BshSettings>({
            path: `${this.baseEndpoint}`,
            options: {
                responseType: 'json',
                requestFormat: 'json'
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'settings.load',
        });
    }

    public async update(params: BshCallbackParamsWithPayload<BshSettings, BshSettings>): Promise<BshResponse<BshSettings> | undefined> {
        return this.client.put<BshSettings>({
            path: `${this.baseEndpoint}`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: { ...params.payload, name: 'BshEngine' },
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'settings.update',
        });
    }
}


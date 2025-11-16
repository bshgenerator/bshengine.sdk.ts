import { BshClient } from "@src/client/bsh-client";
import { BshResponse, BshSettings } from "@types";
import { bshConfigs } from "@config";
import { BshCallbackParams, BshCallbackParamsWithPayload } from "@src/services";

export class SettingsService {
    private static instance: SettingsService;
    private readonly baseEndpoint = '/api/settings';

    private constructor() {
    }

    private get client(): BshClient {
        return bshConfigs.createClient();
    }

    public static getInstance(): SettingsService {
        if (!SettingsService.instance) {
            SettingsService.instance = new SettingsService();
        }
        return SettingsService.instance;
    }

    public async load(params: BshCallbackParams<unknown, BshSettings>): Promise<BshResponse<BshSettings> | undefined> {
        return this.client.get<BshSettings>({
            path: `${this.baseEndpoint}`,
            options: {
                responseType: 'json',
                responseFormat: 'json'
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async update(params: BshCallbackParamsWithPayload<BshSettings, BshSettings>): Promise<BshResponse<BshSettings> | undefined> {
        return this.client.put<BshSettings>({
            path: `${this.baseEndpoint}`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
                body: { ...params.payload, name: 'BshEngine' },
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }
}


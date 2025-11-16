import { BshClient } from "@src/client/bsh-client";
import { BshResponse, BshTriggerPlugin, BshTriggerAction } from "@types";
import { bshConfigs } from "@config";
import { BshCallbackParams } from "@src/services";

export class BshUtilsService {
    private static instance: BshUtilsService;
    private readonly baseEndpoint = '/api/utils';

    private constructor() {
    }

    private get client(): BshClient {
        return bshConfigs.createClient();
    }

    public static getInstance(): BshUtilsService {
        if (!BshUtilsService.instance) {
            BshUtilsService.instance = new BshUtilsService();
        }
        return BshUtilsService.instance;
    }

    public async triggerPlugins(params: BshCallbackParams<unknown, BshTriggerPlugin>): Promise<BshResponse<BshTriggerPlugin> | undefined> {
        return this.client.get<BshTriggerPlugin>({
            path: `${this.baseEndpoint}/triggers/plugins`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async triggerActions(params: BshCallbackParams<unknown, BshTriggerAction>): Promise<BshResponse<BshTriggerAction> | undefined> {
        return this.client.get<BshTriggerAction>({
            path: `${this.baseEndpoint}/triggers/actions`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }
}

import { BshClient } from "@src/client/bsh-client";
import { BshResponse, BshTriggerPlugin, BshTriggerAction } from "@types";
import { BshCallbackParams } from "@src/services";

export class BshUtilsService {
    private readonly baseEndpoint = '/api/utils';

    public constructor(private readonly client: BshClient) {
    }

    public async triggerPlugins(params: BshCallbackParams<unknown, BshTriggerPlugin>): Promise<BshResponse<BshTriggerPlugin> | undefined> {
        return this.client.get<BshTriggerPlugin>({
            path: `${this.baseEndpoint}/triggers/plugins`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'utils.triggerPlugins',
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
            api: 'utils.triggerActions',
        });
    }
}

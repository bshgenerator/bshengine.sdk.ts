import { BshClient } from "@src/client/bsh-client";
import { BshResponse, PluginInstalledResponse } from "@types";
import { BshCallbackParamsWithPayload } from "@src/services";
import { CoreEntities } from "@src/types/core";

export class PluginService {
    private readonly baseEndpoint = '/api/plugins';

    public constructor(private readonly client: BshClient) {
    }

    public async installZip(
        params: BshCallbackParamsWithPayload<{ file: File }, PluginInstalledResponse>
    ): Promise<BshResponse<PluginInstalledResponse> | undefined> {
        const formData = new FormData();
        formData.set('file', params.payload.file);

        return this.client.post<PluginInstalledResponse>({
            path: `${this.baseEndpoint}/install/zip`,
            options: {
                responseType: 'json',
                requestFormat: 'form',
                body: formData,
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'plugins.installZip',
            entity: CoreEntities.BshPlugins,
        });
    }

    public async installCore(
        params: BshCallbackParamsWithPayload<PluginInstalledResponse>
    ): Promise<BshResponse<PluginInstalledResponse> | undefined> {
        return this.client.post<PluginInstalledResponse>({
            path: `${this.baseEndpoint}/install/core`,
            options: {
                responseType: 'json'
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'plugins.installZip',
            entity: CoreEntities.BshPlugins,
        });
    }
}

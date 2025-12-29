import { BshClient } from "@src/client/bsh-client";
import { BshResponse, UploadResponse, UploadOptions } from "@types";
import { BshCallbackParamsWithPayload } from "@src/services";
import { CoreEntities } from "@src/types/core";

export class ImageService {
    private readonly baseEndpoint = '/api/images';

    public constructor(private readonly client: BshClient) {
    }

    public async upload(params: BshCallbackParamsWithPayload<{
        file: File;
        namespace?: string;
        assetId?: string;
        options?: UploadOptions;
    }, UploadResponse>): Promise<BshResponse<UploadResponse> | undefined> {
        const formData = new FormData();
        formData.set('file', params.payload.file);
        if (params.payload.namespace) formData.set('namespace', params.payload.namespace);
        if (params.payload.assetId) formData.set('assetId', params.payload.assetId);
        if (params.payload.options) formData.set('options', JSON.stringify(params.payload.options));

        return this.client.post<UploadResponse>({
            path: `${this.baseEndpoint}/upload`,
            options: {
                responseType: 'json',
                requestFormat: 'form',
                body: formData,
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'image.upload',
            entity: CoreEntities.BshFiles,
        });
    }
}


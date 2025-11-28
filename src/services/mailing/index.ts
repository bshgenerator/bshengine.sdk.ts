import { BshClient } from "@src/client/bsh-client";
import { BshResponse, MailingPayload } from "@types";
import { BshCallbackParamsWithPayload } from "@src/services";

export class MailingService {
    private readonly baseEndpoint = '/api/mailing';

    public constructor(private readonly client: BshClient) {
    }

    public async send(params: BshCallbackParamsWithPayload<MailingPayload, MailingPayload>): Promise<BshResponse<MailingPayload> | undefined> {
        return this.client.post<MailingPayload>({
            path: `${this.baseEndpoint}/send`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'mailing.send',
        });
    }
}


import { BshClient } from "@src/client/bsh-client";
import { BshResponse, MailingPayload } from "@types";
import { bshConfigs } from "@config";
import { BshCallbackParamsWithPayload } from "@src/services";

export class MailingService {
    private static instance: MailingService;
    private readonly baseEndpoint = '/api/mailing';

    private constructor() {
    }

    private get client(): BshClient {
        return bshConfigs.createClient();
    }

    public static getInstance(): MailingService {
        if (!MailingService.instance) {
            MailingService.instance = new MailingService();
        }
        return MailingService.instance;
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
        });
    }
}


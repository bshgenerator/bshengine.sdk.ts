export type BshResponse<T> = {
    data: T[]
    timestamp: number
    code: number
    status: string
    error: string
    meta?: {
        type?: string,
        sql?: string,
        error?: string,
        tips?: {[key: string]: string}
    }
    endpoint?: string,
    api?: string,
    validations?: {field: string, error: string}[]
}

export const isOk = (response: BshResponse<unknown> | undefined) => response == undefined ? false : response?.code >= 200 && response?.code < 300

export class BshError extends Error {
    constructor(
        public status: number,
        public endpoint: string,
        public response?: BshResponse<unknown>
    ) {
        if (response) response.endpoint = endpoint
        super(JSON.stringify(response, null, 2));
        this.name = 'BshError';
    }
}

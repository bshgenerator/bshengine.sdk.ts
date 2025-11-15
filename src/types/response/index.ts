export type BshResponse<T> = {
    data: T[]
    timestamp: number
    code: number
    status: string
    error: string
    meta?: {
        sql: string
        error: string
        tips?: {[key: string]: string}
    }
    pagination?: {
        current: number
        total: number
        pages: number
        first: boolean
        last: boolean
    }
    endpoint?: string,
    validations?: {field: string, error: string}[]
}

export const isOk = (response: BshResponse<unknown>) => response.code >= 200 && response.code < 300

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

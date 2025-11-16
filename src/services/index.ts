import { BshResponse } from '@types';
import { BshError } from '@types';

export type BshCallbackParams<T = unknown, R = T> = {
    onSuccess?: (response: BshResponse<R>) => void;
    onDownload?: (blob: Blob) => void;
    onError?: (error: BshError) => void;
}

export type BshCallbackParamsWithPayload<T = unknown, R = T> = BshCallbackParams<T, R> & {
    payload: T;
}

export * from './entities';
export * from './auth';
export * from './user';

import { BshResponse } from '@types';
import { BshError } from '@types';
import { EntityService } from './entities';
import { UserService } from './user';
import { AuthService } from './auth';
import { SettingsService } from './settings';
import { ImageService } from './image';
import { MailingService } from './mailing';
import { BshUtilsService } from './utils';
import { CachingService } from './caching';
import { coreEntities } from './core';

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
export * from './settings';
export * from './image';
export * from './mailing';
export * from './utils';
export * from './caching';

export const services = {
    entities: EntityService.getInstance(),
    core: coreEntities,
    auth: AuthService.getInstance(),
    user: UserService.getInstance(),
    settings: SettingsService.getInstance(),
    image: ImageService.getInstance(),
    mailing: MailingService.getInstance(),
    utils: BshUtilsService.getInstance(),
    caching: CachingService.getInstance(),
}

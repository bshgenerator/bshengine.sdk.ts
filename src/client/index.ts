import { BshClientFn } from './types';

export * from './types';
export * from './bsh-client';

export const fetchClientFn: BshClientFn = async (params) => {
    console.log(params);
    return fetch(
        params.path,
        {
            method: params.options.method,
            body: params.options.requestFormat === 'form' ?
                params.options.body as BodyInit : params.options.body ?
                    JSON.stringify(params.options.body) : undefined,
            headers: params.options.headers,
        }
    );
};

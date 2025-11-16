import {BshObject} from "@types";

export type BshConfigurations<T extends Record<string, unknown> = Record<string, unknown>> = {
    name: string;
    description: string;
    config?: T;
} & BshObject

export type BshSettings = {
    name: string;
    api: {
        response?: {
            showSql?: boolean;
        };
        auth?: {
            enableRegister?: boolean;
        };
    };
}

export const defaultSettings: BshSettings = {
    name: 'BshEngine',
    api: {
        response: {
            showSql: true
        },
        auth: {
            enableRegister: false
        }
    }
}


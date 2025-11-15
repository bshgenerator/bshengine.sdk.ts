import {BshDate, BshObject, BshObjectPure} from "../core";

export type BshUser = {
    userId: string
    email: string
    password?: string
    roles: string[]
    status: 'ACTIVATED' | 'REQUIRED_ACTIVATION' | 'DISABLED' | 'REQUIRED_RESET_PASSWORD'
    profile?: {
        firstName?: string
        lastName?: string
        phone?: string
        picture?: string
        tags?: string[]
        [k: string]: unknown
    }
} & BshObject;

export type BshUserInit = {
    email: string
    password?: string
    roles?: string[]
    profile: BshUser['profile']
}

export type BshUserPure = BshObjectPure<BshUser>;

export type BshRole = {
    name: string
    public?: boolean
    description?: string
} & BshObject;

export type BshRolePure = BshObjectPure<BshRole>;

export type BshPolicy = {
    name: string
    description?: string
    principals: {
        type: Uppercase<'user' | 'group' | 'role' | 'apiKey' | 'any'>
        value: string[]
    }[]
    permissions: {
        entity: string[]
        actions: ('READ' | 'WRITE' | 'DELETE' | 'UPDATE' | 'SEARCH' | '*')[]
        allow: boolean
    }[]
    enabled: boolean
    priority?: number
    apiKeyId?: number
} & BshObject;

export type BshPolicyPure = BshObjectPure<BshPolicy>;
export const PrincipalType = ['user', 'role', 'any', 'apiKey', /*'group'*/] as const;
export const PolicyActions = ['*', 'READ', 'WRITE', 'DELETE', 'UPDATE', 'SEARCH'] as const;

export type BshApiKeysScopes = {
    read: boolean
    write: boolean
    delete: boolean
    update: boolean
}

export type BshApiKeysForm = {
    name: string
    description?: string
    duration: number
    type: 'PERSONAL' | 'MACHINE'
    scopes: string[] // Format: ["EntityName:ACTION", ...]
}

export type BshApiKeys = BshApiKeysForm & {
    id: number
    apiKey: string
    startedAt: BshDate
    expiresAt?: BshDate
    status: 'ACTIVE' | 'REVOKED'
    userId?: string
} & BshObject;


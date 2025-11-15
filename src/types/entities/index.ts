import {BshObject, BshObjectPure} from '@types';

export type BshEntities = {
    name: string
    dbTable: string
    dbSchema: string
    type: 'Table' | 'View' | 'Function'
    dbSource: string
    updateStrategy: 'Replace' | 'Upsert'
    insertDuplicate: 'Upsert' | 'Error'
    bshSchema?: string
    plugin?: string
    auditable?: boolean
    pks: {
        key: string
        strategy: 'AutoIncrement' | 'UUID' | 'Fixed'
        type: 'string' | 'number'
    }[]
    permissions?: {
        write?: boolean
        read?: boolean
        delete?: boolean
        update?: boolean
    }
} & BshObject;

export type BshEntitiesPure = BshObjectPure<BshEntities>;
export type BshEntityPermissions = 'read' | 'write' | 'update' | 'delete';
export const BshEntityTypes = ['Table', 'View', 'Function'] as const;
export const BshUpdateStrategies = ['Replace', 'Upsert'] as const;
export const BshInsertDuplicates = ['Upsert', 'Error'] as const;
export const BshPKStrategies = ['AutoIncrement', 'UUID', 'Fixed'] as const;
export const BshPKTypes = ['string', 'number'] as const;
export const BshEntityPermissions = ['read', 'write', 'update', 'delete'] as const;

export type BshSchemas = {
    name: string
    label: string
    description: string
    plugin: string
    properties: {
        type: string

        name: string
        displayName: string
        description: string

        required: boolean
        unique: boolean
        default: string

        length: number
        maxLength: number
        minLength: number

        pattern: string
    }[]
} & BshObject;

export type BshSchemasPure = BshObjectPure<BshSchemas>;
export type BshSchemaProperty = BshSchemas['properties'][number];

export type BshTypes = {
    name: string
    label: string
    plugin?: string
    baseType?: string
    schema?: string
    meta?: {
        description?: string
        pattern?: string
        maxLength?: number
        minLength?: number
        max?: number
        min?: number
    }
} & BshObject;

export type BshTypesPure = BshObjectPure<BshTypes>;


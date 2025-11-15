export type BshDate = { $date: string }

export type BshObject = {
    persistenceId: string,
    CreatedAt?: BshDate,
    CreatedBy?: string,
    LastUpdatedAt?: BshDate
    LastUpdatedBy?: string
}

export type BshObjectPure<T> = Omit<T, 'persistenceId' | 'CreatedAt' | 'CreatedBy' | 'LastUpdatedAt' | 'LastUpdatedBy'>

export const CoreEntities = {
    BshEntities: 'BshEntities',
    BshSchemas: 'BshSchemas',
    BshDataSources: 'BshDataSources',
    BshTypes: 'BshTypes',
    BshUsers: 'BshUsers',
    BshPolicies: 'BshPolicies',
    BshRoles: 'BshRoles',
    BshFiles: 'BshFiles',
    BshConfigurations: 'BshConfigurations',
    BshEmails: 'BshEmails',
    BshEventLogs: 'BshEventLogs',
    BshEmailTemplates: 'BshEmailTemplates',
    BshTriggers: 'BshTriggers',
    BshTriggerInstances: 'BshTriggerInstances',
} as const;

export type CoreEntities = keyof typeof CoreEntities


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
    BshTypes: 'BshTypes',

    BshUsers: 'BshUsers',
    BshPolicies: 'BshPolicies',
    BshRoles: 'BshRoles',
    BshApiKeys: 'BshApiKeys',

    BshFiles: 'BshFiles',

    BshConfigurations: 'BshConfigurations',

    BshEmails: 'BshEmails',
    BshEmailTemplates: 'BshEmailTemplates',

    BshEventLogs: 'BshEventLogs',
    BshTriggers: 'BshTriggers',
    BshTriggerInstances: 'BshTriggerInstances',

    BshPlugins: 'BshPlugins',
} as const;

export type CoreEntities = keyof typeof CoreEntities

export const PluginBasedEntities: CoreEntities[] = [
    CoreEntities.BshEntities,
    CoreEntities.BshSchemas,
    CoreEntities.BshTypes,
    CoreEntities.BshPolicies,
    CoreEntities.BshRoles,
    CoreEntities.BshConfigurations,
    CoreEntities.BshEmailTemplates,
    CoreEntities.BshTriggers,
];

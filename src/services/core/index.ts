import { BshCallbackParams, BshCallbackParamsWithPayload, EntityService } from "@src/services";
import { BshConfigurations, BshEmailTemplate, BshEntities, BshEventLogs, BshFiles, BshPolicy, BshResponse, BshRole, BshSchemas, BshSearch, BshTrigger, BshTriggerInstance, BshTypes, BshUser, SentEmail } from "@types";

export const CoreEntities = {
    BshEntities: 'BshEntities',
    BshSchemas: 'BshSchemas',
    BshTypes: 'BshTypes',

    BshUsers: 'BshUsers',
    BshPolicies: 'BshPolicies',
    BshRoles: 'BshRoles',

    BshFiles: 'BshFiles',

    BshConfigurations: 'BshConfigurations',

    BshEmails: 'BshEmails',
    BshEmailTemplates: 'BshEmailTemplates',

    BshEventLogs: 'BshEventLogs',
    BshTriggers: 'BshTriggers',
    BshTriggerInstances: 'BshTriggerInstances',
} as const;

export type CoreEntities = keyof typeof CoreEntities

export class CoreEntityService<T> {
    /**
     * Get the EntityService instance, always using the current global configuration.
     * This ensures that if global configs change, the service will use the updated configs.
     */
    private get entityService(): EntityService {
        return EntityService.getInstance();
    }

    public constructor(private readonly entity: CoreEntities) {
    }

    public async findById(params: BshCallbackParams<T> & { id: string }): Promise<BshResponse<T> | undefined> {
        return this.entityService.findById({
            entity: this.entity,
            ...params,
        });
    }

    public async create(params: BshCallbackParamsWithPayload<T>): Promise<BshResponse<T> | undefined> {
        return this.entityService.create({
            entity: this.entity,
            ...params,
        });
    }

    public async createMany(params: BshCallbackParamsWithPayload<T[], T>): Promise<BshResponse<T> | undefined> {
        return this.entityService.createMany({
            entity: this.entity,
            ...params,
        });
    }

    public async update(params: BshCallbackParamsWithPayload<T>): Promise<BshResponse<T> | undefined> {
        return this.entityService.update({
            entity: this.entity,
            ...params,
        });
    }

    public async updateMany(params: BshCallbackParamsWithPayload<T[], T>): Promise<BshResponse<T> | undefined> {
        return this.entityService.updateMany({
            entity: this.entity,
            ...params,
        });
    }

    public async search(params: BshCallbackParamsWithPayload<BshSearch<T>, T>): Promise<BshResponse<T> | undefined> {
        return this.entityService.search({
            entity: this.entity,
            ...params,
        });
    }

    public async delete(params: BshCallbackParamsWithPayload<BshSearch<T>, { effected: number }>): Promise<BshResponse<{ effected: number }> | undefined> {
        return this.entityService.delete({
            entity: this.entity,
            ...params,
        });
    }

    public async deleteById(params: BshCallbackParams<T, { effected: number }> & { id: string }): Promise<BshResponse<{ effected: number }> | undefined> {
        return this.entityService.deleteById({
            entity: this.entity,
            ...params,
        });
    }

    public async columns(params: BshCallbackParams<unknown, { name: string; type: string }>): Promise<BshResponse<{ name: string; type: string }> | undefined> {
        return this.entityService.columns({
            entity: this.entity,
            ...params,
        });
    }

    public async export(params: BshCallbackParamsWithPayload<BshSearch<T>, Blob> & {
        format: 'csv' | 'json' | 'excel',
        filename?: string,
    }): Promise<void> {
        return this.entityService.export({
            entity: this.entity,
            ...params,
        });
    }
}

export const coreEntities: Record<CoreEntities, CoreEntityService<any>> = {
    BshEntities: new CoreEntityService<BshEntities>('BshEntities'),
    BshSchemas: new CoreEntityService<BshSchemas>('BshSchemas'),
    BshTypes: new CoreEntityService<BshTypes>('BshTypes'),

    BshUsers: new CoreEntityService<BshUser>('BshUsers'),
    BshPolicies: new CoreEntityService<BshPolicy>('BshPolicies'),
    BshRoles: new CoreEntityService<BshRole>('BshRoles'),

    BshFiles: new CoreEntityService<BshFiles>('BshFiles'),

    BshConfigurations: new CoreEntityService<BshConfigurations>('BshConfigurations'),

    BshEmails: new CoreEntityService<SentEmail>('BshEmails'),
    BshEmailTemplates: new CoreEntityService<BshEmailTemplate>('BshEmailTemplates'),

    BshEventLogs: new CoreEntityService<BshEventLogs>('BshEventLogs'),
    BshTriggers: new CoreEntityService<BshTrigger>('BshTriggers'),
    BshTriggerInstances: new CoreEntityService<BshTriggerInstance>('BshTriggerInstances'),
};

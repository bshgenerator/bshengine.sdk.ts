import { BshDate } from "../core";

export type ServiceStatusType = 'OK' | 'WARNING' | 'ERROR';
export type EngineStatusType = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';

export type ServiceStatus = {
    name: string;
    status: ServiceStatusType;
    message: string;
    details?: Record<string, unknown>;
}

export interface ConfigurationDetails {
    datasource: 'configured' | 'missing';
    'datasource.url'?: 'configured' | 'missing';
    'datasource.user'?: 'configured' | 'missing';
    'datasource.password'?: 'configured' | 'missing';
    admin: 'configured' | 'missing';
    'admin.email'?: 'missing';
    env: string;
    host: string;
}

export interface DatabaseDetails {
    'pool.name': string;
    'pool.active': number;
    'pool.idle': number;
    'pool.total': number;
    'pool.waiting': number;
    'pool.maximumSize': number;
    error?: string;
}

export interface SecretsDetails {
    'jwt.secret': string;
    mailing: string;
    cloudinary: string;
    secrets?: string;
}

export interface ProviderDetails {
    status?: string;
    provider?: string;
    config?: 'present' | 'missing';
}

export interface AdminDetails {
    email?: string;
    status?: string;
    configuredEmail?: string;
    exists?: boolean;
    config?: string;
    adminUsers?: number;
    error?: string;
}

export interface CorePluginDetails {
    status?: string;
    version?: string;
    installedAt?: BshDate,
    InstallationMode?: string,
}

export interface CachesDetails {
    totalCaches: number;
    totalEntries: number;
    cacheNames: string[];
}

export type ConfigurationServiceStatus = ServiceStatus & {
    name: 'configuration';
    details?: ConfigurationDetails;
}

export type DatabaseServiceStatus = ServiceStatus & {
    name: 'database';
    details?: DatabaseDetails;
}

export type SecretsServiceStatus = ServiceStatus & {
    name: 'secrets';
    details?: SecretsDetails;
}

export type MailingServiceStatus = ServiceStatus & {
    name: 'mailing';
    details?: ProviderDetails;
}

export type StorageServiceStatus = ServiceStatus & {
    name: 'storage';
    details?: ProviderDetails;
}

export type AdminServiceStatus = ServiceStatus & {
    name: 'admin';
    details?: AdminDetails;
}

export type CorePluginServiceStatus = ServiceStatus & {
    name: 'corePlugin';
    details?: CorePluginDetails;
}

export type CachesServiceStatus = ServiceStatus & {
    name: 'caches';
    details?: CachesDetails;
}

export type AllServiceStatuses =
    | ConfigurationServiceStatus
    | DatabaseServiceStatus
    | SecretsServiceStatus
    | MailingServiceStatus
    | StorageServiceStatus
    | AdminServiceStatus
    | CorePluginServiceStatus
    | CachesServiceStatus;

export interface EngineStatus {
    status: EngineStatusType;
    version: string;
    environment: string;
    timestamp: BshDate;
    services: AllServiceStatuses[];
}

export interface HealthCheckData {
    status: EngineStatusType;
    version: string;
    timestamp: BshDate;
}

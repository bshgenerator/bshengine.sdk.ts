import {BshObject} from "@types";

export type BshConfigurations<T extends Record<string, unknown> = Record<string, unknown>> = {
    name: string;
    description: string;
    config?: T;
} & BshObject

export type ApplicationSettings = BshConfigurations<{
    name: string;
    description: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    timezone: string;
    language: string;
}>

export type APIConfiguration = BshConfigurations<{
    baseUrl: string;
    version: string;
    rateLimit: string;
    timeout: string;
    enableSwagger: boolean;
    enableMetrics: boolean;
    enableCaching: boolean;
    cacheTimeout: string;
    enableCompression: boolean;
    maxRequestSize: string;
    enableCors: boolean;
    enableHealthCheck: boolean;
}>

export type DatabaseConfiguration = BshConfigurations<{
    host: string;
    port: string;
    database: string;
    username: string;
    password: string;
    sslEnabled: boolean;
    connectionPool: string;
    timeout: string;
    maxConnections: string;
    idleTimeout: string;
}>

export type SecuritySettings = BshConfigurations<{
    jwtSecret: string;
    tokenExpiry: string;
    passwordPolicy: 'weak' | 'medium' | 'strong';
    twoFactorEnabled: boolean;
    rateLimitEnabled: boolean;
    corsOrigins: string;
    sessionTimeout: string;
    maxLoginAttempts: string;
    lockoutDuration: string;
    requireHttps: boolean;
    enableAuditLog: boolean;
}>

export type NotificationSettings = BshConfigurations<{
    emailEnabled: boolean;
    smsEnabled: boolean;
    webhookEnabled: boolean;
    webhookUrl: string;
    emailFrom: string;
    smsProvider: string;
    smsApiKey: string;
    emailProvider: string;
    smtpHost: string;
    smtpPort: string;
    smtpUsername: string;
    smtpPassword: string;
    enablePushNotifications: boolean;
    pushServiceKey: string;
    enableSlack: boolean;
    slackWebhookUrl: string;
    enableDiscord: boolean;
    discordWebhookUrl: string;
}>


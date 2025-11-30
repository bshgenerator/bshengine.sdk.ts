import { BshAuthFn, BshClient, BshClientFn, BshErrorInterceptor, BshPostInterceptor, BshPreInterceptor, BshRefreshTokenFn, fetchClientFn } from "@client";
import { ApiKeyService, AuthService, BshUtilsService, CachingService, EntityService, ImageService, MailingService, SettingsService, UserService } from "@src/services";
import { BshEntities, BshPolicy,BshRole, BshEmailTemplate, BshEventLogs, BshSchemas, BshTypes, BshUser, SentEmail, BshTrigger, BshTriggerInstance, BshFiles, BshConfigurations } from "@types";

export class BshEngine {
    private host?: string;
    private clientFn: BshClientFn = fetchClientFn;
    private authFn?: BshAuthFn;
    private refreshTokenFn?: BshRefreshTokenFn;

    private postInterceptors: BshPostInterceptor<unknown>[] = [];
    private preInterceptors: BshPreInterceptor<unknown>[] = [];
    private errorInterceptors: BshErrorInterceptor<unknown>[] = [];

    constructor(params: {
        host?: string;
        apiKey?: string;
        jwtToken?: string;
        refreshToken?: string;
        clientFn?: BshClientFn;
        authFn?: BshAuthFn;
        refreshTokenFn?: BshRefreshTokenFn;
        postInterceptors?: BshPostInterceptor<unknown>[];
        preInterceptors?: BshPreInterceptor<unknown>[];
        errorInterceptors?: BshErrorInterceptor<unknown>[];
    } = {}) {
        this.host = params.host;
        if (params.apiKey && !params.authFn) this.authFn = async () => ({ type: 'APIKEY', token: params.apiKey! });
        if (params.jwtToken && !params.authFn) this.authFn = async () => ({ type: 'JWT', token: params.jwtToken! });
        if (params.refreshToken) this.refreshTokenFn = async () => params.refreshToken!;
        this.clientFn = params.clientFn || this.clientFn || fetchClientFn;
        this.authFn = params.authFn || this.authFn;
        this.refreshTokenFn = params.refreshTokenFn || this.refreshTokenFn;
        this.postInterceptors = params.postInterceptors || [];
        this.preInterceptors = params.preInterceptors || [];
        this.errorInterceptors = params.errorInterceptors || [];
    }

    // Configuration
    public withClient(clientFn: BshClientFn) {
        this.clientFn = clientFn;
        return this;
    }

    public withAuth(authFn: BshAuthFn) {
        this.authFn = authFn;
        return this;
    }

    public withRefreshToken(refreshTokenFn: BshRefreshTokenFn) {
        this.refreshTokenFn = refreshTokenFn;
        return this;
    }

    // Interceptors
    public postInterceptor(interceptor: BshPostInterceptor<unknown>) {
        this.postInterceptors.push(interceptor);
        return this;
    }

    public preInterceptor(interceptor: BshPreInterceptor<unknown>) {
        this.preInterceptors.push(interceptor);
        return this;
    }

    public errorInterceptor(interceptor: BshErrorInterceptor<unknown>) {
        this.errorInterceptors.push(interceptor);
        return this;
    }

    // getters
    public getPostInterceptors() {
        return this.postInterceptors;
    }

    public getPreInterceptors() {
        return this.preInterceptors;
    }

    public getErrorInterceptors() {
        return this.errorInterceptors;
    }

    // Client
    private get client(): BshClient {
        return new BshClient(this.host, this.clientFn, this.authFn, this.refreshTokenFn, this);
    }

    // Services
    public get entities() {
        return new EntityService(this.client);
    }

    public entity<T>(entity: string) {
        return new EntityService<T>(this.client, entity);
    }

    public get core() {
        return {
            BshEntities: this.entity<BshEntities>('BshEntities'),
            BshSchemas: this.entity<BshSchemas>('BshSchemas'),
            BshTypes: this.entity<BshTypes>('BshTypes'),
            BshUsers: this.entity<BshUser>('BshUsers'),
            BshPolicies: this.entity<BshPolicy>('BshPolicies'),
            BshRoles: this.entity<BshRole>('BshRoles'),
            BshFiles: this.entity<BshFiles>('BshFiles'),
            BshConfigurations: this.entity<BshConfigurations>('BshConfigurations'),
            BshEmails: this.entity<SentEmail>('BshEmails'),
            BshEmailTemplates: this.entity<BshEmailTemplate>('BshEmailTemplates'),
            BshEventLogs: this.entity<BshEventLogs>('BshEventLogs'),
            BshTriggers: this.entity<BshTrigger>('BshTriggers'),
            BshTriggerInstances: this.entity<BshTriggerInstance>('BshTriggerInstances'),
        }
    }

    public get auth() {
        return new AuthService(this.client);
    }

    public get user() {
        return new UserService(this.client);
    }

    public get settings() {
        return new SettingsService(this.client);
    }

    public get image() {
        return new ImageService(this.client);
    }

    public get mailing() {
        return new MailingService(this.client);
    }

    public get utils() {
        return new BshUtilsService(this.client);
    }

    public get caching() {
        return new CachingService(this.client);
    }

    public get apiKey() {
        return new ApiKeyService(this.client);
    }
}
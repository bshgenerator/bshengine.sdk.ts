
import { BshClient } from "@src/client/bsh-client";
import { BshResponse, BshUser, BshUserInit, LoginParams, AuthTokens } from "@types";
import { BshCallbackParamsWithPayload } from "@src/services";
import { CoreEntities } from "@src/types/core";

export class AuthService {
    private readonly baseEndpoint = '/api/auth';

    public constructor(private readonly client: BshClient) {
    }

    public async login(params: BshCallbackParamsWithPayload<LoginParams, AuthTokens>): Promise<BshResponse<AuthTokens> | undefined> {
        return this.client.post<AuthTokens>({
            path: `${this.baseEndpoint}/login`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'auth.login',
        });
    }

    public async register(params: BshCallbackParamsWithPayload<BshUserInit, BshUser>): Promise<BshResponse<BshUser> | undefined> {
        return this.client.post<BshUser>({
            path: `${this.baseEndpoint}/register`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'auth.register',
            entity: CoreEntities.BshUsers,
        });
    }

    public async refreshToken(params: BshCallbackParamsWithPayload<{ refresh: string }, AuthTokens>): Promise<BshResponse<AuthTokens> | undefined> {
        return this.client.post<AuthTokens>({
            path: `${this.baseEndpoint}/refresh`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'auth.refreshToken',
        });
    }

    public async forgetPassword(
        params: BshCallbackParamsWithPayload<{ email: string }, unknown>): Promise<BshResponse<unknown> | undefined> {
        return this.client.post<unknown>({
            path: `${this.baseEndpoint}/forget-password`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'auth.forgetPassword',
        });
    }

    public async resetPassword(params: BshCallbackParamsWithPayload<{ email: string, code: string, newPassword: string }, unknown>): Promise<BshResponse<unknown> | undefined> {
        return this.client.post<unknown>({
            path: `${this.baseEndpoint}/reset-password`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'auth.resetPassword',
        });
    }

    public async activateAccount(params: BshCallbackParamsWithPayload<{ email: string, code: string }, unknown>): Promise<BshResponse<unknown> | undefined> {
        return this.client.post<unknown>({
            path: `${this.baseEndpoint}/activate-account`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'auth.activateAccount',
        });
    }

    public async resendActivationEmail(params: BshCallbackParamsWithPayload<{ email: string }, unknown>): Promise<BshResponse<unknown> | undefined> {
        return this.client.post<unknown>({
            path: `${this.baseEndpoint}/resend-activation-email`,
            options: {
                responseType: 'json',
                requestFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            api: 'auth.resendActivationEmail',
            entity: CoreEntities.BshUsers,
        });
    }
}

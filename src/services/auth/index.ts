
import { BshClient } from "@src/client/bsh-client";
import { BshResponse, BshUser, BshUserInit } from "@types";
import { bshConfigs } from "@config";
import { BshCallbackParamsWithPayload } from "@src/services";

export type LoginParams = {
    email: string;
    password: string;
}

export type LoginResponse = {
    token: string;
    refresh: string;
}

export class AuthService {
    private static instance: AuthService;
    private readonly baseEndpoint = '/api/auth';

    private constructor() {
    }

    private get client(): BshClient {
        return bshConfigs.createClient();
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    public async login(params: BshCallbackParamsWithPayload<LoginParams, LoginResponse>): Promise<BshResponse<LoginResponse> | undefined> {
        return this.client.post<LoginResponse>({
            path: `${this.baseEndpoint}/login`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async register(params: BshCallbackParamsWithPayload<BshUserInit, BshUser>): Promise<BshResponse<BshUser> | undefined> {
        return this.client.post<BshUser>({
            path: `${this.baseEndpoint}/register`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async refreshToken(params: BshCallbackParamsWithPayload<{ refresh: string }, LoginResponse>): Promise<BshResponse<LoginResponse> | undefined> {
        return this.client.post<LoginResponse>({
            path: `${this.baseEndpoint}/refresh`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async forgetPassword(
        params: BshCallbackParamsWithPayload<{ email: string }, unknown >): Promise<BshResponse<unknown> | undefined> {
        return this.client.post<unknown>({
            path: `${this.baseEndpoint}/forget-password`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async resetPassword(params: BshCallbackParamsWithPayload<{ email: string, code: string, newPassword: string }, unknown>): Promise<BshResponse<unknown> | undefined> {
        return this.client.post<unknown>({
            path: `${this.baseEndpoint}/reset-password`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }

    public async activateAccount(params: BshCallbackParamsWithPayload<{ email: string, code: string }, unknown>): Promise<BshResponse<unknown> | undefined> {
        return this.client.post<unknown>({
            path: `${this.baseEndpoint}/activate-account`,
            options: {
                responseType: 'json',
                responseFormat: 'json',
                body: params.payload,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
        });
    }
}

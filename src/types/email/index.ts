import {BshObject, BshObjectPure, BshConfigurations} from '@types';

export type SentEmail = {
    Id: string;
    subject: string;
    from: string;
    to: string;
} & BshObject;

export type BshEmailTemplate = {
    name: string;
    subject: string;
    body: string;
    html: boolean;
} & BshObject;

export type BshEmailTemplatePure = BshObjectPure<BshEmailTemplate>;

export type MailingPayload = {
    to: string;
    subject: string;
    body: string;
    html: boolean
}

export type GmailConfig = {
    email: string;
    password: string;
    host: string;
    port: number;
    protocol: string;
    auth: boolean;
    starttls: boolean;
    from: string;
}

export type MailDevConfig = GmailConfig

export type EmailProvider = 'gmail' | 'maildev';

export type EmailConfiguration = BshConfigurations & {
    enabled: EmailProvider;
    gmail?: GmailConfig;
    maildev?: MailDevConfig;
}


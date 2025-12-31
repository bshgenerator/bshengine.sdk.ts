import { BshDate, BshObject } from "../core";

export type BshPlugin = {
    id: string
    name: string
    description: string
    version: string
    author: string
    license: string
    lastInstalledAt: BshDate
    variables: Record<string, unknown>,
    image: string;
} & BshObject;

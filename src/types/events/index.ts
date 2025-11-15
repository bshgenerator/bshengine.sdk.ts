import {BshDate, BshObject, BshObjectPure, CoreEntities} from "../core";

export type BshEventLogs = {
    id: string
    start: BshDate
    end: BshDate
    duration: number
    payload: string
    error?: string
    stack?: string
    plugin?: string
} & BshObject;

export type BshTrigger<Event = BshTriggerEvent> = {
    name: string
    displayName: string
    criteria?: string
    entity: CoreEntities | string
    action: ('READ' | 'INSERT' | 'UPDATE' | 'SEARCH' | 'DELETE' | 'COLUMNS' | 'EXPORT')[]
    events: Event[]
    enabled: boolean
} & BshObject;

export type BshTriggerPure = BshObjectPure<BshTrigger<BshTriggerEventPure>>

export type BshTriggerEvent = {
    name: string
    plugin: string
    entity?: string
    criteria?: string
    input?: object
    output?: object
    failed?: object
    enabled: boolean
} & BshObject;

export type BshTriggerEventPure = BshObjectPure<BshTriggerEvent>

export type BshTriggerInstance = {
    Id: number
    trigger: { name: string, entity: string }
    event: { name: string, plugin: string }
    payload: object
    output: object
    input: object
    status: 'InProgress' | 'Success' | 'Failed'
    error?: string
    trac?: string
} & BshObject;

export type BshTriggerPlugin = {
    name: string
    category: string
    input: object /*json schema*/
    output: object /*json schema*/
}

export type BshTriggerAction = {
    name: string
}


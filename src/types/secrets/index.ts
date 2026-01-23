export type SecretSource = {
    id: string,
    name: string,
    prefix: string,
    secrets?: Record<string, any>
}

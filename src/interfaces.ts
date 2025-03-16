import { Role } from "discord.js"

declare module 'discord.js' {
    interface Reaction {
        _emoji: {
            name: string
        }
    }
    interface Client {
        commands: string[]
    }
}

export interface Roles {
    cache: Role[]
}

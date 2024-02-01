import { Client as DiscordClient, Collection, MessageReaction, Role } from "discord.js";

export interface ClientWithCommands extends Client {
    commands: Collection<string, any>
}

export interface Client extends DiscordClient {
    commands: Collection<any, any>;
}


export interface Reaction extends MessageReaction {
    _emoji: {
        name: string
    }
}

export interface Roles {
    cache: Role[]
}
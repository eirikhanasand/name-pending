import { Client as DiscordClient, Collection } from "discord.js";

export interface ClientWithCommands extends Client {
    commands: Collection<string, any>
}

export interface Client extends DiscordClient {
    commands: Collection<any, any>;
}
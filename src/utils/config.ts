// Purpose: Configures the environment variables and exports them as a single object.
import dotenv from 'dotenv'

// Configures the environment variables
dotenv.config()

// Destructures the environment variables
const { 
    DISCORD_CLIENT_ID,
    DISCORD_GUILD_ID,
    DISCORD_STYRET_ROLE_ID,
    DISCORD_TEKKOM_ROLE_ID,
    DISCORD_MINECRAFT_LOG_CHANNEL_ID,
    DISCORD_TOKEN,
    MINECRAFT_URL,
    MINECRAFT_SURVIVAL,
    MINECRAFT_CREATIVE,
    MINECRAFT_SURVIVAL_PORT,
    MINECRAFT_CREATIVE_PORT,
    MINECRAFT_PORT,
    API
} = process.env

// Throws an error if any of the essential environment variables are missing
if (
    !DISCORD_CLIENT_ID
    || !DISCORD_GUILD_ID
    || !DISCORD_STYRET_ROLE_ID
    || !DISCORD_TEKKOM_ROLE_ID
    || !DISCORD_MINECRAFT_LOG_CHANNEL_ID
    || !DISCORD_TOKEN
    || !MINECRAFT_URL
    || !MINECRAFT_SURVIVAL
    || !MINECRAFT_CREATIVE
    || !MINECRAFT_SURVIVAL_PORT
    || !MINECRAFT_CREATIVE_PORT
    || !MINECRAFT_PORT
    || !API
) {
    throw new Error('Missing essential environment variables in config.')
}

// Exports the environment variables as a single object
const config = {
    clientId: DISCORD_CLIENT_ID,
    guildId: DISCORD_GUILD_ID,
    styret: DISCORD_STYRET_ROLE_ID,
    roleID: DISCORD_TEKKOM_ROLE_ID,
    minecraft_log: DISCORD_MINECRAFT_LOG_CHANNEL_ID,
    token: DISCORD_TOKEN,
    minecraft_url: MINECRAFT_URL,
    minecraft_port: Number(MINECRAFT_PORT),
    minecraft_servers: [
        {
            port: Number(MINECRAFT_SURVIVAL_PORT), 
            name: MINECRAFT_SURVIVAL
        }, 
        {
            port: Number(MINECRAFT_CREATIVE_PORT),
            name: MINECRAFT_CREATIVE
        }
    ],
    api: API
}

// Exports the config object
export default config

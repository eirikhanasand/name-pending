// Purpose: Configures the environment variables and exports them as a single object.
import dotenv from 'dotenv'

// Configures the environment variables
dotenv.config()

// Destructures the environment variables
const { 
    DISCORD_CLIENT_ID,
    DISCORD_GUILD_ID,
    DISCORD_ROLE_ID,
    DISCORD_CHANNEL_ID,
    DISCORD_TOKEN,
    MINECRAFT_URL_PROD,
    MINECRAFT_URL_DEV,
    MINECRAFT_PROD,
    MINECRAFT_DEV,
    MINECRAFT_PROD_PORT,
    MINECRAFT_DEV_PORT,
    MINECRAFT_PORT,
} = process.env

// Throws an error if any of the essential environment variables are missing
if (
    !DISCORD_CLIENT_ID
    || !DISCORD_GUILD_ID
    || !DISCORD_ROLE_ID
    || !DISCORD_CHANNEL_ID
    || !DISCORD_TOKEN
    || !MINECRAFT_URL_PROD
    || !MINECRAFT_PROD
    || !MINECRAFT_PROD_PORT
    || !MINECRAFT_PORT
) {
    throw new Error('Missing essential environment variables in config.')
}

// Exports the environment variables as a single object
const config = {
    clientId: DISCORD_CLIENT_ID,
    guildId: DISCORD_GUILD_ID,
    channelId: DISCORD_CHANNEL_ID,
    roleID: DISCORD_ROLE_ID,
    token: DISCORD_TOKEN,
    minecraft_port: Number(MINECRAFT_PORT),
    minecraft_servers: [
        {
            ip: MINECRAFT_URL_PROD,
            port: Number(MINECRAFT_PROD_PORT), 
            name: MINECRAFT_PROD
        }, 
        {
            ip: MINECRAFT_URL_DEV,
            port: Number(MINECRAFT_DEV_PORT),
            name: MINECRAFT_DEV
        }
    ],
}

// Exports the config object
export default config

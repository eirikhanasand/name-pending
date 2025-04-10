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
    MINECRAFT_PORT,
    MINECRAFT_URL_PROD,
    MINECRAFT_SERVER_NAME,
} = process.env

// Throws an error if any of the essential environment variables are missing
if (
    !DISCORD_CLIENT_ID
    || !DISCORD_GUILD_ID
    || !DISCORD_ROLE_ID
    || !DISCORD_CHANNEL_ID
    || !DISCORD_TOKEN
    || !MINECRAFT_PORT
    || !MINECRAFT_URL_PROD
    || !MINECRAFT_SERVER_NAME
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
    minecraft_server_url: MINECRAFT_URL_PROD,
    minecraft_server_name: MINECRAFT_SERVER_NAME,
}

// Exports the config object
export default config

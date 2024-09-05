import { Client } from "discord.js"
import { schedule } from "node-cron"
import autoCreate from "./wiki.js"
import dotenv from 'dotenv'
import { getNextWeekYearAndWeek } from "./wiki.js"

dotenv.config()

const { DISCORD_TEKKOM_VERV_CHANNEL_ID } = process.env

if (!DISCORD_TEKKOM_VERV_CHANNEL_ID) {
    throw new Error('Missing DISCORD_TEKKOM_VERV_CHANNEL_ID in autoCreateMeetings.ts')
}

export default async function autoCreateMeetings(client: Client) {
    const channel = await client.channels.fetch(DISCORD_TEKKOM_VERV_CHANNEL_ID as string)

    if (!channel) {
        throw new Error(`Channel with ID ${DISCORD_TEKKOM_VERV_CHANNEL_ID} not found in autoCreateMeetings.ts`)
    }

    schedule('0 16 * * 4', () => {
        const weekNumber = getNextWeekYearAndWeek(false).currentWeek
        if (weekNumber % 2 !== 0) {
            autoCreate({ channel, isStyret: false });
        }
    })
}
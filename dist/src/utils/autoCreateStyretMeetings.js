import autoCreate from "./wiki.js";
import dotenv from 'dotenv';
dotenv.config();
const { DISCORD_SAKER_TIL_STYREMOTER_CHANNEL_ID } = process.env;
if (!DISCORD_SAKER_TIL_STYREMOTER_CHANNEL_ID) {
    throw new Error('Missing DISCORD_SAKER_TIL_STYREMOTER_CHANNEL_ID in autoCreateStyretMeetings.ts');
}
export default async function autoCreateStyretMeetings(client) {
    const channel = await client.channels.fetch(DISCORD_SAKER_TIL_STYREMOTER_CHANNEL_ID);
    if (!channel) {
        throw new Error(`Channel with ID ${DISCORD_SAKER_TIL_STYREMOTER_CHANNEL_ID} not found in autoCreateStyretMeetings.ts`);
    }
    // schedule('0 12 * * 1', () => {
    //     autoCreate({ channel, isStyret: true })
    // })
    autoCreate({ channel, isStyret: true });
}

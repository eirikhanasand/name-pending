import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import getTotalLinks from '../../webarchive/getTotalLinks.js';

export const data = new SlashCommandBuilder()
    .setName('info')
    .setDescription('Info regarding the bot.');
export async function execute(message) {
    const info = getTotalLinks()
    const embed = new EmbedBuilder()
        .setTitle('Info')
        .setDescription('Bottens foreløpige hovedoppgave er å arkivere alle Logins domener og sider i web.archive.org. Dette er en gratis nettside hvor vi kan lagre hele foreningens historie uten å bruke egen lagringsplass. For å arkivere hele Logins digitale fotavtrykk kan du bruke /archive kommandoen. Merk at denne har en cooldown på 45 minutter hver gang den kjøres.\n\n**Er det noe vi trenger?** JA! web.archive.org er hovedårsaken til at vi har god informasjon tilbake i tid. Blant annet ble det her funnet referater fra årsmøter, vedtekter og tidligere nettsidedesign som vi ellers ikke hadde hatt tilgang til. Dessuten er det gratis, så det er utelukkende positivt for foreningen.\n\nNedenfor finner du en total oversikt over antall urler Login disponerer som kan arkiveres.')
        .setColor("#fd8738")
        .setTimestamp()
        .addFields(
            {name: "Created", value: "21.08.23", inline: true},
            {name: "Updated", value: "26.08.23", inline: true},
            { name: " ", value: " ", inline: false },
            {name: "Domains", value: `${info.domains}`, inline: true},
            {name: "Paths", value: `${info.paths}`, inline: true}
        )
    await message.reply({ embeds: [embed]});
}
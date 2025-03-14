import { ThreadChannel } from "discord.js"

export default async function templates(thread: ThreadChannel) {
    // Checks if the channel is '#pr-kontakt'
    if (thread.parent?.name === 'pr-kontakt') {

        // Sends the reminder message
        return await thread.send({
            content: "Husk å ha med:\n```\nTittel: Thread tittel skal være arrangement / grunn for kontakt\nSted (Hvor skjer det?):\nDato og klokkeslett (Når skjer det?):\nBeskrivelse/promotekst (Hva er det?):\nRelease dato (Når er det ønsket at promo postes?):\n```"
        })
    }

    // Checks if the channel is '#saker-til-styremøter'
    if (thread.parent?.name === 'saker-til-styremøter') {

        // Sends the reminder message
        return await thread.send({
            content: "Husk å ha med:\n```\nType sak: O / D / V - \nBeskrivelse av saken.\n\nEksempel:\nD - Nytt format av saker\nDenne linjen og resten av meldingen er innholdet i saken.```\nDersom du ønsker å redigere en sak må du redigere samme melding. Flere meldinger for samme sak vil ikke komme med. Meldinger uten type vil heller ikke komme med. Slike meldinger antas å være urelevant diskusjon.\n"
        })
    }

    // Checks if the channel is '#refunderinger'
    if (thread.parent?.name === 'refunderinger') {
        return await thread.send({
            content: "Kvittering SKAL ha følgende for å bli godkjent:\n```\nDato for kjøp\nOrganisasjonsnummer til selger\nKvitteringsnummer\nHvem som har kjøpt\nHvem som har solgt\nBetalingsform (vipps, Visa)\nMVA: (12%,15%,25%)\nTotalsum (med og uten MVA)\nHva som er kjøpt (fritekst)\nPDF til kvittering som vedlegg\nVedtektssak\nKontonummer```"
        })
    }
}

import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('registry')
    .setDescription('Guide on how to use our registry.')
export async function execute(message: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
        .setTitle('Registry')
        .setDescription('Guide on how to use our registry')
        .setColor("#fd8738")
        .setTimestamp()
        .addFields(
            {name: "**[LOCAL]**", value: "docker login registry.gitlab.login.no", inline: true},
            {name: "**Description**", value: "Logs into Logins gitlab registry. Use the LDAP username and a access token with sufficient permissions.", inline: true},
            {name: " ", value: " ", inline: false},
            {name: "**[OPTIONAL]**", value: "docker service create --name <repository_name> --with-registry-auth registry.gitlab.login.no/tekkom/<repository>:latest", inline: true},
            {name: "**Description**", value: "Creates a new registry item, use if the registry does not exist.", inline: true},
            {name: " ", value: " ", inline: false},
            {name: "**[LOCAL]**", value: "docker buildx build --platform linux/amd64,linux/arm64 --push -t registry.gitlab.login.no/<repository>:latest .", inline: true},
            {name: "**Description**", value: "Builds a docker image for the Linux server we run our infrastructure on and pushes it to the registry. This makes the code available anywhere.", inline: true},
            {name: " ", value: " ", inline: false},
            {name: "**[REMOTE]**", value: "docker image pull registry.gitlab.login.no/<repository>:latest", inline: true},
            {name: "**Description**", value: "Updates the image to the latest version in the registry.", inline: true},
            {name: " ", value: " ", inline: false},
            {name: "**[REMOTE]**", value: "docker service update --with-registry-auth --image registry.gitlab.login.no/tekkom/playground/tekkom-bot:latest tekkom-bot", inline: true},
            {name: "**Description**", value: "Updates the docker service specified, effectively puts the latest version into production.", inline: true},
        )
    await message.reply({ embeds: [embed]})
}

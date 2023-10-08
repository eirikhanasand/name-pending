import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('registry')
    .setDescription('Guide on how to use our registry.');
export async function execute(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('Registry')
        .setDescription('Guide on how to use our registry')
        .setColor("#fd8738")
        .setTimestamp()
        .addFields(
            {name: "[LOCAL]", value: "docker buildx build --platform linux/amd64,linux/arm64 --push -t registry.git.logntnu.no/<repository>:latest ."},
            {name: "[DESCRIPTION]", value: "Builds a docker image for the Linux server we run our infrastructure on and pushes it to the registry. This makes the code available anywhere."},
            {name: "[REMOTE]", value: "docker image pull registry.git.logntnu.no/<repository>:latest"},
            {name: "[DESCRIPTION]", value: "Updates the image to the latest version in the registry."},
            {name: "[OPTIONAL]", value: "docker service create --name <repository_name> --with-registry-auth registry.git.logntnu.no/tekkom/<repository>:latest"},
            {name: "[DESCRIPTION]", value: "Creates a new registry item, use if the registry does not exist."},
            {name: "[REMOTE]", value: "docker service update --with-registry-auth --image registry.git.logntnu.no/tekkom/playground/tekkom-bot:latest tekkom-bot"},
            {name: "[DESCRIPTION]", value: "Updates the docker service specified, effectively puts the latest version into production."},
        )
    await interaction.reply({ embeds: [embed]});
}
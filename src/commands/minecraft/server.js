import { SlashCommandBuilder } from 'discord.js';
import { fork } from 'child_process';

export const data = new SlashCommandBuilder()
    .setName('testeren')
    .setDescription('test');

export async function execute(message) {
    await message.reply('Pong!');
    const child = fork('src/minecraft/listen.js')

    child.stdout.on('message', (data) => {
        console.log("Child:", data);
    })

    child.stdout.on('close', () => {
        console.log("Child process terminated");
    })
}
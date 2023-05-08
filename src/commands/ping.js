import { SlashCommandBuilder } from 'discord.js';

// Example slash command
const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

const execute = async (interaction) => {
  await interaction.reply('Pong! 🏓');
};

export default { data, execute };

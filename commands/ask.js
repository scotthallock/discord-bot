const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('ask')
  .setDescription('Ask the AI coding assistant!')
  .addStringOption((option) =>
    option
      .setName('question')
      .setDescription('the question to ask the assistant')
      .setRequired(true)
  );

const execute = async (interaction) => {
  await interaction.reply(
    `You asked "${interaction.options.getString('question')}"`
  );
};

module.exports = { data, execute };

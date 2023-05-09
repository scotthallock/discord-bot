import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import fileDirName from './utils/fileDirName.js';

const { __dirname } = fileDirName(import.meta);

export const registerEvents = async () => {
  // Environment variables
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const ACORN_USERNAME = process.env.ACORN_USERNAME;
  const ACORN_DISCRIMINATOR = process.env.ACORN_DISCRIMINATOR;

  // Create a new client instance
  // MessageContent is a privileged intent. You must enable privileged gateway intents
  // in the Discord Developer Portal under "Privileged Gateway Intents" in the "Bot" section
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.commands = new Collection();

  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    // Import the command file
    const { default: command } = await import(filePath);

    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }

  client.on(Events.InteractionCreate, async (interaction) => {
    // Exit the handler if the interaction is not a slash command
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  });

  // Listen for all new messages
  // Becuase we have the `MessageContent` intent, we can access the message content
  client.on(Events.MessageCreate, (message) => {
    const { content, author } = message;

    // Celebrate a win
    if (/( (w|W)(?![^ ])|(?<![^ ])(w|W) |🇼)/.test(content)) {
      message.react('🇼');
    }

    // He gets an acorn
    if (
      author.username === ACORN_USERNAME &&
      author.discriminator === ACORN_DISCRIMINATOR
    ) {
      message.react('1100547267666137118');
    }
  });

  // When the client is ready, run this code (only once)
  client.once(Events.ClientReady, (c) => {
    console.log(`🤖 Bot is ready! Logged in as ${c.user.tag}`);
  });

  // Log in to Discord with your client's token
  client.login(BOT_TOKEN).then(() => console.info('🤖 Bot is logged in.'));
};

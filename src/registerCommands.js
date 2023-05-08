import fs from 'node:fs';
import path from 'node:path';
import { REST, Routes } from 'discord.js';
import fileDirName from './utils/fileDirName.js';

const { __dirname } = fileDirName(import.meta);

export const registerCommands = async () => {
  // Environment variables
  const CLIENT_ID = process.env.CLIENT_ID;
  const GUILD_ID = process.env.GUILD_ID;
  const BOT_TOKEN = process.env.BOT_TOKEN;

  const commands = [];

  // Grab all the command files from the /commands folder
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));

  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    // Import the command file
    const { default: command } = await import(filePath);

    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }

  // Construct and prepare an instance of the REST module
  const rest = new REST().setToken(BOT_TOKEN);

  // Deploy the commands
  (async () => {
    try {
      console.log(
        `Registering ${commands.length} application (/) commands to the Discord server...`
      );

      // The put method is used to fully refresh all commands in the guild with the current set
      const data = await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
      );

      console.log(
        `Successfully registered ${data.length} application (/) commands!`
      );
    } catch (error) {
      console.error(error);
    }
  })();
};

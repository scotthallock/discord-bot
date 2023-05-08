## A Discord bot

### Helpful resources:

1. [Discord.js guide](https://discordjs.guide/#before-you-begin) - read through the "HOME", "INSTALLATIONS & PREPARATIONS", and "CREATING YOUR BOT" sections, which cover project structure in Node.js and how to build a **slash command** for your bot.
2. [Discord developer portal](https://discord.com/developers/applications) - this is where you access your applications and bot users.

### Installation:

1. Run `npm install` to install dependencies
2. Rename `example.env` to `.env` and input the keys and ids. Ask the owner of this repository for help if needed.
3. Start the bot with `npm run start`

### Commands:

1. `/ping` - The bot replies with "Pong!". Just a simple example to show how to build a slash command.
2. `/ask [question]` - Ask a question related to coding/programming. The bot sends the question to OpenAI's API to generate an AI response. It uses the `gpt-3.5-turbo` model.

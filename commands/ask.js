require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');

// OpenAI things
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const instructions = `You are a coding assistant and only respond to questions related to coding or programming.
  
### Example 1

user: How do you create a deep copy in JavaSrcipt?

response: To create a deep copy of an object in JavaScript, you can use a combination of \`JSON.parse()\` and \`JSON.stringify()\` methods. Here's an example:

\`\`\`js
const original = {a: 1, b: 2, c: {d: 3, e: 4}};
const copy = JSON.parse(JSON.stringify(original));
\`\`\`

In this code, we use we use \`JSON.stringify()\` to convert the \`originalObject\` to a JSON string, and then use \`JSON.parse()\` to convert the string back to an object.

Note that this method will not work for objects that contain functions or undefined values, as they cannot be represented in JSON. Also, be aware that deep copying large or complex objects can be resource-intensive and may impact performance.

Another way to create a deep copy is to use the \`structuredClone()\` method:

\`\`\`js
const original = {a: 1, b: 2, c: {d: 3, e: 4}};
const copy = structedClone(original);
\`\`\`

The \`structedClone()\` method will also not work for objects that contain functions.
`;

// Send a request to the API
// Chat completions API: https://platform.openai.com/docs/guides/chat
const sendOpenAIRequest = async (question) => {
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: instructions },
      { role: 'user', content: question },
    ],
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  if (response.status !== 200) {
    throw new Error('Open API request failed');
  }

  return response.data.choices[0].message?.content;
};

const data = new SlashCommandBuilder()
  .setName('ask')
  .setDescription(
    'Ask the AI coding assistant. May occasionally generate incorrect information.'
  )
  .addStringOption((option) =>
    option
      .setName('question')
      .setDescription('the question to ask the assistant')
      .setRequired(true)
  );

const execute = async (interaction) => {
  try {
    const question = interaction.options.getString('question');

    const requestPromise = sendOpenAIRequest(question);

    // If Discord doesn't recieve acknowledgement from the bot within 3 seconds,
    // it will consider the interaction to have failed. So, we must deferReply()
    // https://discordjs.guide/slash-commands/response-methods.html#deferred-responses

    console.log('here');

    await interaction.deferReply();

    console.log('how about here');

    const completion = await requestPromise;

    console.log({ completion });

    await interaction.editReply({
      content: completion || 'Response not found. 🤔 Please try again!',
    });
  } catch (error) {
    console.log(error);
    await interaction.editReply({
      content: 'There was an error with the OpenAI API request.',
    });
  }
};

module.exports = { data, execute };

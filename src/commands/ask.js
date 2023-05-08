import { SlashCommandBuilder } from 'discord.js';

// OpenAI things
import { Configuration, OpenAIApi } from 'openai';
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const instructions = `You are a coding assistant and only respond to questions related to coding or programming.
  
### Example

user: How do you make a GET request in JavaScript?

response: You can use the built-in \`fetch()\` function in JavaScript to send a GET request. Here's an example:

\`\`\`js
fetch('https://example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
\`\`\`

In this code, we use \`fetch()\` to send a GET request to the specified URL. The \`then()\` method is used to handle the response by first converting it to a JSON object using the \`json()\` method, and then logging it to the console. The \`catch()\` method is used to handle any errors that may occur during the request.
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
    max_tokens: 600,
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

    await interaction.deferReply();

    const completion = await requestPromise;

    await interaction.editReply({
      content:
        completion ||
        'There was an issue with the response. 🤔 Please try again!',
    });
  } catch (error) {
    console.log(error);
    await interaction.editReply({
      content: 'There was an error with the OpenAI API request.',
    });
  }
};

export default { data, execute };

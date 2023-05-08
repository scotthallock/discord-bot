// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config();

import { registerEvents } from './src/registerEvents.js';
import { registerCommands } from './src/registerCommands.js';

// Register the commands on the Discord server
// so that the commands appear when the user types `/`
registerCommands();

// Create the event listeners for the Bot
// and log the Bot into the server
registerEvents();

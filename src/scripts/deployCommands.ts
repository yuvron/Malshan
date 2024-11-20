import { getCommands } from '../utils/getCommands';
import { config } from '../utils/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';

async function uploadCommands() {
	const commandsToUpload = getCommands().map((command) => command.data.toJSON());
	console.log(`Started uploading ${commandsToUpload.length} slash commands.`);
	const rest = new REST({ version: '9' }).setToken(config.discord.botToken);
	const data = await rest.put(
		Routes.applicationGuildCommands(config.discord.applicationId, config.discord.serverId),
		{
			body: commandsToUpload,
		}
	);
	console.log(`Successfully uploaded ${data['length']} slash commands.`);
}

uploadCommands();

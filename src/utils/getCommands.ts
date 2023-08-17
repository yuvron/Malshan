import path from 'path';
import fs from 'fs';
import { Collection } from 'discord.js';

export function getCommands(): Collection<string, any> {
	const commands: Collection<string, any> = new Collection([]);

	const commandFolderPath = path.resolve(__dirname, '../commands');
	const commandFiles = fs.readdirSync(commandFolderPath).filter((file) => file.endsWith('.ts'));

	for (const commandFile of commandFiles) {
		const commandFilePath = path.resolve(commandFolderPath, commandFile);
		const command = require(commandFilePath).default;
		if ('data' in command && 'execute' in command) {
			commands.set(command.data.name, command);
		} else {
			console.log(
				`[WARNING] The command at ${commandFile} is missing a required "data" or "execute" property.`
			);
		}
	}
	return commands;
}

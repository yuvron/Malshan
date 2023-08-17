import {
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
	CommandInteraction,
} from 'discord.js';

export interface ICommand {
	data:
		| Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>
		| SlashCommandSubcommandsOnlyBuilder;
	execute: (interaction: CommandInteraction) => Promise<void>;
}

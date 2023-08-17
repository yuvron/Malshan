import { Collection, Interaction } from 'discord.js';

export type InteractionWithCommandName = Interaction & {
	commandName: string;
};

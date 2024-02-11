import { ICommand } from '../interfaces/command';
import { SlashCommandBuilder } from 'discord.js';

const ping: ICommand = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
	execute: async (interaction) => {
		await interaction.reply('Pong!!!');
	},
};

export default ping;

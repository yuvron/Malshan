import { config } from '../utils/config';
import {
	Client,
	Events,
	GatewayIntentBits,
	GuildMember,
	Interaction,
	Routes,
	VoiceState,
} from 'discord.js';
import { REST } from '@discordjs/rest';
import { ClientWithCommands } from '../types/clientWithCommands';
import { InteractionWithCommandName } from '../types/interactionWithCommandName';
import { getCommands } from '../utils/getCommands';
import WhatsappClient from './whatsapp';
import Singleton from '../utils/singleton';

export default class DiscordClient extends Singleton {
	client: ClientWithCommands;
	rest: REST;
	whatsappClient: WhatsappClient;
	recentlyConnected: string[];

	constructor(whatsappClient: WhatsappClient) {
		super(DiscordClient);
		if (this.client) {
			return;
		}

		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildVoiceStates,
			],
		}) as ClientWithCommands;
		this.client.commands = getCommands();
		this.rest = new REST({ version: '9' }).setToken(config.botToken);
		this.whatsappClient = whatsappClient;
		this.recentlyConnected = [];

		this.handleReady = this.handleReady.bind(this);
		this.handleInteractionCreate = this.handleInteractionCreate.bind(this);
		this.handleVoiceStateUpdate = this.handleVoiceStateUpdate.bind(this);

		this.client.on(Events.ClientReady, this.handleReady);
		this.client.on(Events.InteractionCreate, this.handleInteractionCreate);
		this.client.on(Events.VoiceStateUpdate, this.handleVoiceStateUpdate);

		this.client.login(config.botToken);
	}

	handleReady(client: Client) {
		console.log(`Discord Bot - connected as ${client.user.tag}`);
	}

	handleInteractionCreate(interaction: Interaction) {
		const { commandName } = interaction as InteractionWithCommandName;
		const command = (interaction.client as ClientWithCommands).commands.get(commandName);
		command.execute(interaction);
	}

	async handleVoiceStateUpdate(before: VoiceState, after: VoiceState) {
		if (before.guild.id === config.serverId) {
			if (after.channelId && after.channel.id !== config.afkChannelId) {
				const { user } = (await this.rest.get(
					Routes.guildMember(config.serverId, before.id)
				)) as GuildMember;
				if (!this.recentlyConnected.includes(user.id)) {
					console.log(`Discord Bot - ${user['global_name'] || user.username} connected`);
					const msg = `🔴   🔴   🔴\n\n*${
						user['global_name'] || user.username
					}* is online!\n\n🔴   🔴   🔴`;
					await this.whatsappClient.sendMessage(msg);
					this.recentlyConnected.push(user.id);
					setTimeout(
						() => this.recentlyConnected.splice(this.recentlyConnected.indexOf(user.id), 1),
						config.connectionCooldownMinutes * 60 * 1000
					);
				}
			}
		}
	}
}

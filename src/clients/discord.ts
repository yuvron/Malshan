import { config } from '../utils/config';
import {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	GuildMember,
	Interaction,
	Routes,
	VoiceChannel,
	VoiceState,
} from 'discord.js';
import { REST } from '@discordjs/rest';
import { ClientWithCommands } from '../types/clientWithCommands';
import { InteractionWithCommandName } from '../types/interactionWithCommandName';
import { getCommands } from '../utils/getCommands';
import { getIgnoredUsers } from '../utils/getIgnoredUsers';

export default class DiscordClient {
	client: ClientWithCommands;
	rest: REST;
	recentlyConnected: string[];
	ignoredUsers: string[];
	whatsappSendMessage: (msg: string) => Promise<void>;
	serverId: string;
	afkChannelId: string;
	isLogServerId: boolean;
	isLogChannelId: boolean;
	cooldownMinutes: number;

	constructor(whatsappSendMessage: (msg: string) => Promise<void>) {
		this.whatsappSendMessage = whatsappSendMessage;

		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildVoiceStates,
			],
		}) as ClientWithCommands;
		this.client.commands = getCommands();
		const botToken = config.discord.botToken;
		this.rest = new REST({ version: '9' }).setToken(botToken);
		this.recentlyConnected = [];
		this.ignoredUsers = getIgnoredUsers();

		this.handleReady = this.handleReady.bind(this);
		this.handleInteractionCreate = this.handleInteractionCreate.bind(this);
		this.handleVoiceStateUpdate = this.handleVoiceStateUpdate.bind(this);

		this.client.on(Events.ClientReady, this.handleReady);
		this.client.on(Events.InteractionCreate, this.handleInteractionCreate);
		this.client.on(Events.VoiceStateUpdate, this.handleVoiceStateUpdate);

		this.client.login(botToken);

		this.serverId = config.discord.serverId;
		this.afkChannelId = config.discord.afkChannelId;
		this.isLogServerId = config.discord.isLogServerId;
		this.isLogChannelId = config.discord.isLogChannelId;
		this.cooldownMinutes = config.cooldownMinutes;
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
		if (this.isLogServerId) {
			console.log(`Discord Bot - server id: ${before.guild.id}`);
		}
		if (this.isLogChannelId) {
			console.log(`Discord Bot - channel id: ${after.channelId}`);
		}
		if (before.guild.id !== this.serverId) {
			return;
		}
		const didUserJoin = !before.channelId && after.channelId;
		if (!didUserJoin) {
			return;
		}
		const isAfkChannel = after.channel.id === this.afkChannelId;
		if (isAfkChannel) {
			return;
		}

		const { user } = (await this.rest.get(
			Routes.guildMember(this.serverId, before.id)
		)) as GuildMember;
		if (this.ignoredUsers.includes(user.username)) {
			return;
		}

		if (!this.recentlyConnected.includes(user.id)) {
			const usersCount = (await this.getConnectedUsers()).length;
			console.log(`Discord Bot - ${user['global_name'] || user.username} connected`);
			const msg = `*${user['global_name'] || user.username}* is online!\n\n*${usersCount}* ${
				usersCount === 1 ? 'person is' : 'people are'
			} in\n\n🔴   🔴   🔴`;
			await this.whatsappSendMessage(msg);
			this.recentlyConnected.push(user.id);
			setTimeout(
				() => this.recentlyConnected.splice(this.recentlyConnected.indexOf(user.id), 1),
				this.cooldownMinutes * 60 * 1000
			);
		}
	}

	async getConnectedUsers(): Promise<string[]> {
		let guild = this.client.guilds.cache.get(this.serverId);
		const channels = await guild.channels.fetch();
		const connectedUsers: string[] = [];
		for (const channel of channels) {
			if (channel[1] instanceof VoiceChannel && channel[1].id !== this.afkChannelId) {
				const channelMembers = channel[1].members as Collection<string, GuildMember>;
				for (const member of channelMembers) {
					if (!this.ignoredUsers.includes(member[1].user.username)) {
						connectedUsers.push(member[1].user.globalName || member[1].user.username);
					}
				}
			}
		}
		return connectedUsers;
	}
}

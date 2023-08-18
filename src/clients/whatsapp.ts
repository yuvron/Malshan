import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { config } from '../utils/config';
import Singleton from '../utils/singleton';
import DiscordClient from './discord';

const numberEmojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export default class WhatsappClient extends Singleton {
	client: Client;
	isReady: boolean;
	discordClient: DiscordClient;
	isUsersCountInCooldown: boolean;

	constructor() {
		super(WhatsappClient);
		if (this.client) {
			return;
		}

		this.isReady = false;
		this.client = new Client({
			authStrategy: new LocalAuth(),
		});
		this.discordClient = new DiscordClient();
		this.isUsersCountInCooldown = false;

		this.client.on('loading_screen', (percent, message) => {
			console.log(`WhatsApp Bot - loading ${percent}%`);
		});

		this.client.on('qr', (qr) => {
			qrcode.generate(qr, { small: true });
		});

		this.client.on('authenticated', () => {
			console.log('WhatsApp Bot - authenticated');
		});

		this.client.on('auth_failure', (msg) => {
			console.error(`WhatsApp Bot - authentication failed: ${msg}`);
		});

		this.client.on('ready', () => {
			console.log('WhatsApp Bot - ready');
			this.isReady = true;
		});

		this.client.on('message_create', (msg) => this.handleMessageCreate(msg));

		this.client.initialize();
	}

	async handleMessageCreate(msg: Message) {
		if (
			(msg.to === config.whatsappChatId || msg.from === config.whatsappChatId) &&
			msg.body === 'מישהו פה?'
		) {
			if (this.isUsersCountInCooldown) {
				return;
			}
			this.isUsersCountInCooldown = true;
			setTimeout(() => (this.isUsersCountInCooldown = false), config.cooldownMinutes * 60 * 1000);
			const connectedUsers = await this.discordClient.getConnectedUsers();
			const usersCount = connectedUsers.length;
			await msg.reply(
				`*${numberEmojis[usersCount]}* ${
					usersCount === 1 ? 'person is' : 'people are'
				} in\n\n${connectedUsers.map((user) => `☢️ *${user}*`).join('\n\n')}`
			);
		}
	}

	async sendMessage(msg: string) {
		if (this.isReady) {
			await this.client.sendMessage(config.whatsappChatId, msg);
		} else {
			console.error('WhatsApp Bot - tried to send message before whatsapp client is ready');
		}
	}
}

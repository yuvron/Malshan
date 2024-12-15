import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import { config } from '../utils/config';

const numberEmojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
const authorsMap = {};
const adjectives = [];
const bannedKeyWords = [];
export default class WhatsappClient {
	client: Client;
	isReady: boolean;
	qrCode: string;
	isUsersCountOnCooldown: boolean;
	isSummarizeOnCooldown: boolean;
	discordGetConnectedUsers: () => Promise<string[]>;
	aiSummarizeMessages: (messages: { sender: string; body: string }[]) => Promise<string>;
	chatId: string;
	cooldownMinutes: number;
	isLogChatId: boolean;

	constructor(
		discordGetConnectedUsers: () => Promise<string[]>,
		aiSummarizeMessages: (messages: { sender: string; body: string }[]) => Promise<string>
	) {
		this.discordGetConnectedUsers = discordGetConnectedUsers;
		this.aiSummarizeMessages = aiSummarizeMessages;
		this.isReady = false;
		const wwebVersion = '2.2410.1';
		this.client = new Client({
			authStrategy: new LocalAuth(),
			// webVersionCache: {
			// 	type: 'remote',
			// 	remotePath:
			// 		'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
			// },
		});
		this.isUsersCountOnCooldown = false;
		this.isSummarizeOnCooldown = false;

		this.client.on('loading_screen', (percent) => {
			console.log(`WhatsApp Bot - loading ${percent}%`);
		});
		this.client.on('qr', (qr) => {
			console.log('WhatsApp Bot - generating qr code');
			this.qrCode = qr;
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

		this.chatId = config.whatsapp.chatId;
		this.cooldownMinutes = config.cooldownMinutes;
		this.isLogChatId = config.whatsapp.isLogChatId;
	}

	async handleMessageCreate(msg: Message) {
		if (this.isLogChatId) {
			console.log(`WhatsApp Bot - chat id from: ${msg.from}, chat id to: ${msg.to}`);
		}
		if (msg.to === this.chatId || msg.from === this.chatId) {
			if (msg.body === config.whatsapp.whoIsHereMessage) {
				this.handleWhoIsHereMessage(msg);
			} else if (msg.body === config.whatsapp.tldrForMeMessage) {
				this.handleTldrForMeMessage(msg);
			}
		}
	}

	async handleWhoIsHereMessage(msg: Message) {
		if (this.isUsersCountOnCooldown) {
			return;
		}
		this.isUsersCountOnCooldown = true;
		setTimeout(() => (this.isUsersCountOnCooldown = false), this.cooldownMinutes * 60 * 1000);
		const connectedUsers = await this.discordGetConnectedUsers();
		const usersCount = connectedUsers.length;
		await msg.reply(
			`*${numberEmojis[usersCount]}* ${usersCount === 1 ? 'person is' : 'people are'} in${
				connectedUsers.length > 0 ? '\n\n' : ''
			}${connectedUsers.map((user) => `☢️ *${user}*`).join('\n\n')}`
		);
	}

	async handleTldrForMeMessage(msg: Message) {
		if (this.isSummarizeOnCooldown) {
			return;
		}
		this.isSummarizeOnCooldown = true;
		setTimeout(() => (this.isSummarizeOnCooldown = false), this.cooldownMinutes * 60 * 1000);

		const chat = await this.client.getChatById(this.chatId);
		const messages = await chat.fetchMessages({
			limit: config.ai.historyMessagesAmount,
		});
		const filteredMessages = messages.filter(
			(msg) =>
				authorsMap[msg.author] &&
				![config.whatsapp.whoIsHereMessage, config.whatsapp.tldrForMeMessage].includes(
					msg.body
				) &&
				!bannedKeyWords.some((word) => msg.body.includes(word))
		);
		const adjectivesCopy = [...adjectives];
		const adjectiveMap = Object.fromEntries(
			Object.entries(authorsMap).map(([author, name]) => {
				const adjective = adjectivesCopy.splice(
					Math.floor(Math.random() * adjectivesCopy.length),
					1
				)[0];
				return [author, name + ' ה' + adjective];
			})
		);
		const messagesContents = filteredMessages.map((msg) => ({
			sender: config.ai.useAdjectives
				? (adjectiveMap[msg.author] as string)
				: (authorsMap[msg.author] as string),
			body: msg.body,
		}));
		const response = await this.aiSummarizeMessages(messagesContents);
		await msg.reply(response);
		return;
	}

	async sendMessage(msg: string) {
		if (this.isReady) {
			await this.client.sendMessage(this.chatId, msg);
		} else {
			console.error('WhatsApp Bot - tried to send message before whatsapp client is ready');
		}
	}
}

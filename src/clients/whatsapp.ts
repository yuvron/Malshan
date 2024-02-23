import { Client, LocalAuth, Message } from "whatsapp-web.js";
import { config } from "../utils/config";

const numberEmojis = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

export default class WhatsappClient {
	client: Client;
	isReady: boolean;
	qrCode: string;
	isUsersCountOnCooldown: boolean;
	discordGetConnectedUsers: () => Promise<string[]>;
	chatId: string;
	questionMessage: string;
	cooldownMinutes: number;
	isLogChatId: boolean;

	constructor(discordGetConnectedUsers: () => Promise<string[]>) {
		this.discordGetConnectedUsers = discordGetConnectedUsers;
		this.isReady = false;
		this.client = new Client({
			authStrategy: new LocalAuth(),
		});
		this.isUsersCountOnCooldown = false;

		this.client.on("loading_screen", (percent) => {
			console.log(`WhatsApp Bot - loading ${percent}%`);
		});
		this.client.on("qr", (qr) => {
			console.log("WhatsApp Bot - generating qr code");
			this.qrCode = qr;
		});
		this.client.on("authenticated", () => {
			console.log("WhatsApp Bot - authenticated");
		});
		this.client.on("auth_failure", (msg) => {
			console.error(`WhatsApp Bot - authentication failed: ${msg}`);
		});
		this.client.on("ready", async () => {
			console.log("WhatsApp Bot - ready");
			this.client.sendMessage(
				this.chatId,
				`I'm Here Beautiful people! \n\n${numberEmojis[(await this.discordGetConnectedUsers()).length]} ${
					(await this.discordGetConnectedUsers()).length === 1 ? "person is" : "people are"
				} in`
			);
			this.isReady = true;
		});
		this.client.on("message_create", (msg) => this.handleMessageCreate(msg));

		this.client.initialize();

		this.chatId = config.whatsapp.chatId;
		this.questionMessage = config.whatsapp.questionMessage;
		this.cooldownMinutes = config.cooldownMinutes;
		this.isLogChatId = config.whatsapp.isLogChatId;
	}

	async handleMessageCreate(msg: Message) {
		if (this.isLogChatId) {
			console.log(`WhatsApp Bot - chat id from: ${msg.from}, chat id to: ${msg.to}`);
		}
		if ((msg.to === this.chatId || msg.from === this.chatId) && msg.body === this.questionMessage) {
			if (this.isUsersCountOnCooldown) {
				return;
			}
			this.isUsersCountOnCooldown = true;
			setTimeout(() => (this.isUsersCountOnCooldown = false), this.cooldownMinutes * 60 * 1000);
			const connectedUsers = await this.discordGetConnectedUsers();
			const usersCount = connectedUsers.length;
			if (!msg.author.includes("526618184")) {
				await msg.reply(
					`*${numberEmojis[usersCount]}* ${usersCount === 1 ? "person is" : "people are"} in${connectedUsers.length > 0 ? "\n\n" : ""}${connectedUsers
						.map((user) => `☢️ *${user}*`)
						.join("\n\n")}`
				);
			} else {
				await msg.reply(`*${numberEmojis[0]}* people are in\n\n No one likes you..`);
			}
		}
	}

	async sendMessage(msg: string) {
		if (this.isReady) {
			await this.client.sendMessage(this.chatId, msg);
		} else {
			console.error("WhatsApp Bot - tried to send message before whatsapp client is ready");
		}
	}
}

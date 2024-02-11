import DiscordClient from './clients/discord';
import WhatsappClient from './clients/whatsapp';

export default class Manager {
	whatsappClient: WhatsappClient;
	discordClient: DiscordClient;

	constructor() {
		this.whatsappClient = new WhatsappClient(this.discordGetConnectedUsers);
		this.discordClient = new DiscordClient(this.whatsappSendMessage);
	}

	async discordGetConnectedUsers(): Promise<string[]> {
		return await this.discordClient.getConnectedUsers();
	}

	async whatsappSendMessage(msg: string) {
		return await this.whatsappClient.sendMessage(msg);
	}

	isWhatsappReady(): boolean {
		return this.whatsappClient.isReady;
	}

	getWhatsappQrCode(): string {
		return this.whatsappClient.qrCode;
	}
}

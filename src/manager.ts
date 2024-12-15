import AiService from './clients/ai';
import DiscordClient from './clients/discord';
import WhatsappClient from './clients/whatsapp';

export default class Manager {
	whatsappClient: WhatsappClient;
	discordClient: DiscordClient;
	aiService: AiService;

	constructor() {
		this.whatsappClient = new WhatsappClient(
			() => this.discordGetConnectedUsers(),
			(messages: { sender: string; body: string }[]) => this.aiSummarizeMessages(messages)
		);
		this.discordClient = new DiscordClient((msg: string) => this.whatsappSendMessage(msg));
		this.aiService = new AiService();
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

	async aiSummarizeMessages(messages: { sender: string; body: string }[]) {
		return this.aiService.summarizeMessages(messages);
	}
}

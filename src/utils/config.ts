import { config as loadEnv } from 'dotenv';
import fs from 'fs';

loadEnv();

export const config = {
	serverPort: +process.env['SERVER_PORT'],
	isLogToFile: process.env['IS_LOG_TO_FILE'].toLowerCase() === 'true',
	cooldownMinutes: +process.env['COOLDOWN_MINUTES'] || 10,
	discord: {
		botToken: process.env['DISCORD_BOT_TOKEN'],
		applicationId: process.env['DISCORD_APPLICATION_ID'],
		serverId: process.env['DISCORD_SERVER_ID'],
		afkChannelId: process.env['DISCORD_AFK_CHANNEL_ID'],
		isLogServerId: process.env['DISCORD_IS_LOG_SERVER_ID'].toLowerCase() === 'true',
		isLogChannelId: process.env['DISCORD_IS_LOG_CHANNEL_ID'].toLowerCase() === 'true',
	},
	whatsapp: {
		chatId: process.env['WHATSAPP_CHAT_ID'],
		whoIsHereMessage: process.env['WHATSAPP_WHO_IS_HERE_MESSAGE'],
		tldrForMeMessage: process.env['WHATSAPP_TLDR_FOR_ME_MESSAGE'],
		isLogChatId: process.env['WHATSAPP_IS_LOG_CHAT_ID'].toLowerCase() === 'true',
	},
	ai: {
		apiKey: process.env['AI_API_KEY'],
		maxTokens: +process.env['AI_MAX_TOKENS'] || 5000,
		useAdjectives: process.env['AI_USE_ADJECTIVES'].toLowerCase() === 'true' || false,
		historyMessagesAmount: +process.env['AI_HISTORY_MESSAGES_AMOUNT'] || 150,
	},
};

if (config.isLogToFile) {
	if (!fs.existsSync('./logs')) {
		fs.mkdirSync('./logs');
	}
	const logStream = fs.createWriteStream(
		`./logs/${new Date()
			.toISOString()
			.slice(0, 16)
			.replace(/[-T:.]/g, '_')}.log`,
		{ flags: 'a' }
	);
	process.stdout.write = logStream.write.bind(logStream);
	process.stderr.write = logStream.write.bind(logStream);
}

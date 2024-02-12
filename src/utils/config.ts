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
	},
	whatsapp: {
		chatId: process.env['WHATSAPP_CHAT_ID'],
		questionMessage: process.env['WHATSAPP_QUESTION_MESSAGE'],
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

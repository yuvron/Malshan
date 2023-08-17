import { config as loadEnv } from 'dotenv';
loadEnv();

export const config = {
	botToken: process.env['BOT_TOKEN'],
	applicationId: process.env['APPLICATION_ID'],
	serverId: process.env['SERVER_ID'],
	afkChannelId: process.env['AFK_CHANNEL_ID'],
	whatsappChatId: process.env['WHATSAPP_CHAT_ID'],
	cooldownMinutes: +process.env['COOLDOWN_MINUTES'],
};

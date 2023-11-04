import DiscordClient from './clients/discord';
import WhatsappClient from './clients/whatsapp';
import fs from 'fs';

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

const whatsapp = new WhatsappClient();
const discord = new DiscordClient();

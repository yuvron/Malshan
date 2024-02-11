import path from 'path';
import express from 'express';
import qrcode from 'qrcode';
import { config } from './utils/config';
import Manager from './manager';

const manager = new Manager();

const app = express();

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/qrcode', async (req, res) => {
	if (manager.isWhatsappReady()) {
		res.send('OK');
	} else if (manager.getWhatsappQrCode()) {
		const qrSvg = await qrcode.toString(manager.getWhatsappQrCode(), { type: 'svg', width: 600 });
		res.type('svg');
		res.send(qrSvg);
	} else {
		res.send('WAITING');
	}
});

app.listen(config.serverPort, () =>
	console.log(`listening on http://localhost:${config.serverPort}`)
);

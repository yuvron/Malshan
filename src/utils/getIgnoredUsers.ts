import fs from 'fs';
import path from 'path';

export function getIgnoredUsers() {
	const ignoredUsersFilePath = path.resolve(__dirname, '../../data/ignoredUsers.json');
	const ignoredUsers = fs.readFileSync(ignoredUsersFilePath, 'utf-8');
	return JSON.parse(ignoredUsers);
}

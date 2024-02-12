# Malshan

This project was created to allow a group of friends to always know who is online and who is getting online, so they won't have to worry about inviting each other and wait.

A combination of a Discord bot and a WhatsApp bot, to notify Whatsapp group chat members when someone joins a Discord voice channel, and also allow users to ask who is connected and be replied with the list of users in the voice channel.

## Setup

1. Install dependencies and build

```
npm install
npm run build
```

2. Copy the `.env.example` file located in the root folder, to a `.env` file, remove all comments and fill the variables with your own data.

3. If there are Discord users you want to ignore like music bots and similar, copy the `.ignoredUsers.json.example` file located in the `data` folder to a `.ignoredUsers.json` file, add the users you want to ignore in a list.

4. Start the application and head to the http endpoint (http:localhost:<serverPort>) to see the status.

```
npm start
```

5. If it's the first time you start the application, a qr code will be shown, scan it using the WhatsApp application on your phone to allow access to the bot.

6. After that the message on the screen should be OK, and you will be able to use the bot. (Websocket is planned, but currently manual refresh is required to see the updated screen)

## Screenshots

### When someone joins the Discord voice channel

![Dashboard](./readme/alert.png)

### When someone asks if someone is here

![Dashboard](./readme/question.png)

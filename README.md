# Protoid-R
Discord bot for reputation from confirmed trades (basically r/hardwareswap's Confirmed Trade Thread)

# Getting Started

## Database
This bot uses Firebase's Firestore as database solution to keep track of reputation points for each user.
- Create a new Firebase project
- Go to *Project settings*
- Go to *Service accounts*
- Click on *Generate new private key* button
- Save *JSON* file under `config/` folder

## Discord

- Create 5 roles for the reputation system in your discord guild
- Create 1 admin role in your discord guild
- Create 1 text channel where users will use to confirm trades (will be used later for `trade_repChannelID`)

## Create a new bot

- Create a new discord bot in [https://discordapp.com/developers/applications/](https://discordapp.com/developers/applications/)
- Go to *Bot*
- Click on *Copy* button and save the *token* somewhere (will be used later for `token`)

## Add the bot to your discord guild

- Go to *OAuth2*
- Check `bot`
- Check `Manage Roles`
- Click on *Copy* button and paste the URL in a browser
- Follow instructions and add the bot to your discord guild

## Source code

- Clone this repo
- `cd` into folder and `npm i`
- Configure `src/main.js`
  - Edit this line
  ```js
  const serviceAccount = require('...');
  ```
  to reference the *JSON* file you saved from *Database* step

    Example:
  ```js
  const serviceAccount = require('../config/myserviceaccountfile.json');
  ```
- Configure `config/prodConfig.json`
  - Don't know how to get role's ID?
    - Put your guild ID in `guildID`
    - `npm start`
    - Type in `!getrolesid` in any channel in your guild
    - Kill the `node` process with `CTRL+C`
    - Come back and fill out the rest of `config/prodConfig.json`
  - `trade_repChannelID` is the channel ID where users will use to confirm trades
  - `token` is the token key you got when you created a new discord bot
- Comment out this line now if you want to disable this command (optional)
```js
if (msg.content === '!getrolesid') getrolesid(msg);
```
- All set! Simply run `npm start` and you're good to go

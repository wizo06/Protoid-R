const admin = require('firebase-admin');
const config = require('../config/prodConfig.json');
const moment = require('moment');
const discord = require('discord.js');
const serviceAccount = require('../config/protoid-r-firebase-adminsdk-zko60-57f5ed14fa.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

const BOT = new discord.Client();

// Colors
const Reset = '\x1b[0m';
const Bright = '\x1b[1m';
const Dim = '\x1b[2m';
const Underscore = '\x1b[4m';
const Blink = '\x1b[5m';
const Reverse = '\x1b[7m';
const Hidden = '\x1b[8m';

const FgBlack = '\x1b[30m';
const FgRed = '\x1b[31m';
const FgGreen = '\x1b[32m';
const FgYellow = '\x1b[33m';
const FgBlue = '\x1b[34m';
const FgMagenta = '\x1b[35m';
const FgCyan = '\x1b[36m';
const FgWhite = '\x1b[37m';

const plusrep = async msg => {
  try {
    if (msg.mentions.members.size === 1 ) {
      if (msg.author.id !== msg.mentions.members.first().id) {
        let messageAuthorID = msg.author.id;
        let taggedUserID = msg.mentions.members.first().id;

        await msg.react('⭕');

        const confirmFilter = (reaction, user) => reaction.emoji.name === '⭕' && user.id === taggedUserID;

        await msg.awaitReactions(confirmFilter, { maxUsers: 1 })

        /* +1 for the message author */
        let messageAuthorDoc = await db.collection('users').doc(messageAuthorID).get();
        if (messageAuthorDoc.exists) {
          let repPoints = messageAuthorDoc.data().repPoints;
          await db.collection('users').doc(messageAuthorID).update({ repPoints: repPoints + 1 });
        }
        else {
          await db.collection('users').doc(messageAuthorID).set({ repPoints: 1 });
        }

        /* +1 for the tagged user */
        let taggedUserDoc = await db.collection('users').doc(taggedUserID).get();
        if (taggedUserDoc.exists) {
          let repPoints = taggedUserDoc.data().repPoints;
          await db.collection('users').doc(taggedUserID).update({ repPoints: repPoints + 1 });
        }
        else {
          await db.collection('users').doc(taggedUserID).set({ repPoints: 1 });
        }

        await msg.react('✅');

        await updateRole(msg, messageAuthorID);
        await updateRole(msg, taggedUserID);
      }
      else {
        msg.reply('Error! You can not tag yourself.');
      }
    }
    else {
      msg.reply('Error! You have to tag **one and only one** user.');
    }
  }
  catch (err) {
    console.log(`${FgRed}[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${err}${Reset}`);
  }
};

const updateRole = async (msg, messageAuthorID) => {
  return new Promise(async (resolve, reject) => {
    try {
      /* Update role for message author */
      let messageAuthorDoc = await db.collection('users').doc(messageAuthorID).get();
      if (messageAuthorDoc.exists) {
        let repPoints = messageAuthorDoc.data().repPoints;

        if (repPoints >= 30) {
          let guildMember = await BOT.guilds.get(config.guildID).members.get(messageAuthorID).addRole(config.plusThirtyRepRole);
          guildMember.removeRole(config.plusFifteenRepRole);
          guildMember.removeRole(config.plusFiveRepRole);
          guildMember.removeRole(config.plusThreeRepRole);
          guildMember.removeRole(config.plusOneRepRole);
          resolve(config.plusThirtyRepRole);
        }
        else if (repPoints >= 15) {
          let guildMember = await BOT.guilds.get(config.guildID).members.get(messageAuthorID).addRole(config.plusFifteenRepRole);
          guildMember.removeRole(config.plusThirtyRepRole);
          guildMember.removeRole(config.plusFiveRepRole);
          guildMember.removeRole(config.plusThreeRepRole);
          guildMember.removeRole(config.plusOneRepRole);
          resolve(config.plusFifteenRepRole);
        }
        else if (repPoints >= 5) {
          let guildMember = await BOT.guilds.get(config.guildID).members.get(messageAuthorID).addRole(config.plusFiveRepRole);
          guildMember.removeRole(config.plusThirtyRepRole);
          guildMember.removeRole(config.plusFifteenRepRole);
          guildMember.removeRole(config.plusThreeRepRole);
          guildMember.removeRole(config.plusOneRepRole);
          resolve(config.plusFiveRepRole);
        }
        else if (repPoints >= 3) {
          let guildMember = await BOT.guilds.get(config.guildID).members.get(messageAuthorID).addRole(config.plusThreeRepRole);
          guildMember.removeRole(config.plusThirtyRepRole);
          guildMember.removeRole(config.plusFifteenRepRole);
          guildMember.removeRole(config.plusFiveRepRole);
          guildMember.removeRole(config.plusOneRepRole);
          resolve(config.plusThreeRepRole);
        }
        else if (repPoints >= 1) {
          let guildMember = await BOT.guilds.get(config.guildID).members.get(messageAuthorID).addRole(config.plusOneRepRole);
          guildMember.removeRole(config.plusThirtyRepRole);
          guildMember.removeRole(config.plusFifteenRepRole);
          guildMember.removeRole(config.plusFiveRepRole);
          guildMember.removeRole(config.plusThreeRepRole);
          resolve(config.plusOneRepRole);
        }
        else if (repPoints === 0) {
          let guildMember = await BOT.guilds.get(config.guildID).members.get(messageAuthorID);
          guildMember.removeRole(config.plusThirtyRepRole);
          guildMember.removeRole(config.plusFifteenRepRole);
          guildMember.removeRole(config.plusFiveRepRole);
          guildMember.removeRole(config.plusThreeRepRole);
          guildMember.removeRole(config.plusOneRepRole);
          resolve('552596586283139104');
        }
      }
      else {
        msg.reply(`Error! I could not assign <@${messageAuthorID}> the proper role. Please contact <@${config.staffRole}>.`);
        reject();
      }
    }
    catch (err) {
      console.log(`${FgRed}[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${err}${Reset}`);
      reject();
    }
  });
};

const getrep = async msg => {
  try {
    if (msg.content.split(' ').length === 2) {
      let discordID = msg.content.split(' ')[1];

      let doc = await db.collection('users').doc(discordID).get();
      if (doc.exists) {
        msg.channel.send(`<@${discordID}> has ${doc.data().repPoints} reputation points.`);
      }
      else {
        msg.channel.send(`<@${discordID}> has 0 reputation points.`);
      }
    }
    else {
      msg.reply('Error! Wrong usage. Correct usage is: `!getrep 1234567890` (replace 1234567890 with discord ID)');
    }
  }
  catch (err) {
    console.log(`${FgRed}[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${err}${Reset}`);
  }
}

const setrep = async msg => {
  try {
    if (msg.content.split(' ').length === 3) {
      let discordID = msg.content.split(' ')[1];
      let repPoints = parseInt(msg.content.split(' ')[2]);

      if (!isNaN(repPoints)) {
        /* Update reputation point */
        await db.collection('users').doc(discordID).set({ repPoints });
        msg.channel.send(`<@${discordID}>'s reputation points is now ${repPoints}.`);

        /* Update role */
        let role = await updateRole(msg, discordID);
        msg.channel.send(`<@${discordID}>'s role is now <@&${role}>`);
      }
      else {
        msg.channel.send(`Error! ${msg.content.split(' ')[2]} is not a number. Correct usage is: \`!setrep 1234567890 6\` (replace 1234567890 with discord ID)`)
      }
    }
    else {
      msg.reply('Error! Wrong usage. Correct usage is: `!setrep 1234567890 6` (replace 1234567890 with discord ID)');
    }
  }
  catch (err) {
    console.log(`${FgRed}[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${err}${Reset}`);
  }
}

const getrolesid = async msg => {
  try {
    let fields = [];

    BOT.guilds.get(config.guildID).roles.map(x => {
      fields.push({name: x.id, value: x.name})
    })

    let embed = {
      title: 'List of roles',
      fields
    }

    await msg.channel.send('', { embed })
  }
  catch (err) {
    console.log(`${FgRed}[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${err}${Reset}`);
  }
}

BOT.on('message', msg => {
  if (msg.author.id === BOT.user.id) return;

  switch(msg.channel.type) {
    case 'text':
      if (msg.content === '!getrolesid') getrolesid(msg);
      else if (msg.channel.id === config.trade_repChannelID) plusrep(msg);
      else if (msg.member.roles.get(config.staffRole)) {
        switch(msg.content.split(' ')[0]) {
          case '!getrep':
            getrep(msg);
            break;
          case '!setrep':
            setrep(msg);
            break;
          default:
            break;
        }
      }
    break;
  }
})

/* Websocket has connection error */
BOT.on('error', err => {
  console.log(`${FgRed}[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${err}${Reset}`);
});

/*Log in*/
BOT.login(config.token)
.then(async () => {
  try {
    console.log(`${FgGreen}[${moment().format('YYYY-MM-DD HH:mm:ss')}] Logged in as ${BOT.user.tag}${Reset}`);
    BOT.user.setActivity('MapleStory 2',{type:'PLAYING'})
    console.log(`${FgGreen}**********************************************${Reset}`);
  }
  catch (err) {
    console.log(`${FgRed}[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${err}${Reset}`);
  }
})
.catch(err => console.log(`${FgRed}[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${err}${Reset}`));

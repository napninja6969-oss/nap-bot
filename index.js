const { Client, GatewayIntentBits, PermissionsBitField, ChannelType } = require("discord.js");
const { QuickDB } = require("quick.db");

const db = new QuickDB();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions
  ]
});

const prefix = ".";

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});


// =========================
// 📊 LEVEL SYSTEM
// =========================

client.on("messageCreate", async message => {

  if (message.author.bot) return;
  if (!message.guild) return;

  let xp = await db.get(`xp_${message.author.id}`);
  if (!xp) xp = 0;

  xp += 5;

  await db.set(`xp_${message.author.id}`, xp);

  let level = await db.get(`level_${message.author.id}`);
  if (!level) level = 1;

  let needed = level * 100;

  if (xp >= needed) {

    level++;

    await db.set(`level_${message.author.id}`, level);
    await db.set(`xp_${message.author.id}`, 0);

    message.channel.send(`${message.author} leveled up to **${level}** 🎉`);
  }

});


// =========================
// 🎮 COMMAND HANDLER
// =========================

client.on("messageCreate", async message => {

  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).split(" ");
  const cmd = args.shift().toLowerCase();


  // PING
  if (cmd === "ping") {
    return message.reply("🏓 Pong!");
  }


  // LEVEL
  if (cmd === "level") {

    let level = await db.get(`level_${message.author.id}`) || 1;
    let xp = await db.get(`xp_${message.author.id}`) || 0;

    message.reply(`Level: **${level}** | XP: **${xp}**`);
  }


  // COINFLIP
  if (cmd === "coinflip") {

    const result = Math.random() < 0.5 ? "Heads" : "Tails";

    message.reply(`🪙 ${result}`);
  }


  // ROLL
  if (cmd === "roll") {

    const roll = Math.floor(Math.random() * 6) + 1;

    message.reply(`🎲 You rolled ${roll}`);
  }


  // AVATAR
  if (cmd === "avatar") {

    message.reply(message.author.displayAvatarURL({ dynamic: true }));
  }


  // =========================
  // 🎫 TICKET SYSTEM
  // =========================

  if (cmd === "ticket") {

    const channel = await message.guild.channels.create({
      name: `ticket-${message.author.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: message.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: message.author.id,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    channel.send(`Support will be with you shortly ${message.author}`);
  }


  // CLOSE TICKET
  if (cmd === "close") {

    if (!message.channel.name.startsWith("ticket-")) return;

    message.channel.delete();
  }


  // =========================
  // 🎭 REACTION ROLES
  // =========================

  if (cmd === "reactionrole") {

    const role = message.guild.roles.cache.find(r => r.name === "Member");

    if (!role) return message.reply("Create a role named **Member** first.");

    const msg = await message.channel.send("React with 👍 to get Member role");

    await msg.react("👍");

    const filter = (reaction, user) => reaction.emoji.name === "👍";

    const collector = msg.createReactionCollector({ filter });

    collector.on("collect", async (reaction, user) => {

      const member = await message.guild.members.fetch(user.id);

      member.roles.add(role);

    });

  }


  // =========================
  // 🔊 VOICE CHANNEL CREATOR
  // =========================

  if (cmd === "voice") {

    const channel = await message.guild.channels.create({
      name: `${message.author.username}'s Room`,
      type: ChannelType.GuildVoice
    });

    message.reply(`Voice channel created: ${channel.name}`);
  }


  // =========================
  // 🧹 CLEAR MESSAGES
  // =========================

  if (cmd === "clear") {

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply("No permission");

    const amount = parseInt(args[0]);

    if (!amount) return message.reply("Enter number");

    await message.channel.bulkDelete(amount);

    message.channel.send(`Deleted ${amount} messages`);
  }


  // HELP
  if (cmd === "help") {

    message.reply(`
Commands:

.fun
.ping
.level
.coinflip
.roll
.avatar

🎫 Ticket
.ticket
.close

🎭 Roles
.reactionrole

🔊 Voice
.voice

🧹 Moderation
.clear
`);
  }

});

client.login(process.env.TOKEN);


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
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {

  if (message.author.bot || !message.guild) return;

  // =========================
  // 📊 LEVEL SYSTEM
  // =========================

  let xp = await db.get(`xp_${message.author.id}`) || 0;
  let level = await db.get(`level_${message.author.id}`) || 1;

  xp += 5;
  await db.set(`xp_${message.author.id}`, xp);

  const needed = level * 100;

  if (xp >= needed) {
    level++;
    await db.set(`level_${message.author.id}`, level);
    await db.set(`xp_${message.author.id}`, 0);
    message.channel.send(`${message.author} leveled up to **${level}** 🎉`);
  }

  // Ignore messages without prefix
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();


  // 🏓 PING
  if (cmd === "ping") {
    return message.reply("🏓 Pong!");
  }


  // 📊 LEVEL
  if (cmd === "level") {
    const level = await db.get(`level_${message.author.id}`) || 1;
    const xp = await db.get(`xp_${message.author.id}`) || 0;

    return message.reply(`Level: **${level}** | XP: **${xp}**`);
  }


  // 🪙 COINFLIP
  if (cmd === "coinflip") {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";
    return message.reply(`🪙 ${result}`);
  }


  // 🎲 ROLL
  if (cmd === "roll") {
    const roll = Math.floor(Math.random() * 6) + 1;
    return message.reply(`🎲 You rolled **${roll}**`);
  }


  // 🖼 AVATAR
  if (cmd === "avatar") {
    return message.reply(message.author.displayAvatarURL({ dynamic: true }));
  }


  // 🎫 CREATE TICKET
  if (cmd === "ticket") {

    const existing = message.guild.channels.cache.find(
      c => c.name === `ticket-${message.author.id}`
    );

    if (existing) return message.reply("You already have an open ticket.");

    const channel = await message.guild.channels.create({
      name: `ticket-${message.author.id}`,
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

    channel.send(`🎫 Support will be with you shortly ${message.author}`);
  }


  // CLOSE TICKET
  if (cmd === "close") {

    if (!message.channel.name.startsWith("ticket-"))
      return message.reply("This is not a ticket channel.");

    message.channel.delete();
  }


  const reactionRoles = {
  "🔴": "RED",
  "🟠": "ORANGE",
  "🟡": "YELLOW",
  "🟢": "GREEN",
  "🔵": "BLUE",
  "🟣": "PURPLE",
  "⚫": "BLACK",
  "⚪": "WHITE",
  "🌸": "PINK"
};


  // 🔊 VOICE CHANNEL
  if (cmd === "voice") {

    const channel = await message.guild.channels.create({
      name: `${message.author.username}'s Room`,
      type: ChannelType.GuildVoice
    });

    return message.reply(`🔊 Voice channel created: **${channel.name}**`);
  }


  // 🧹 CLEAR
  if (cmd === "clear") {

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply("❌ You don't have permission.");

    const amount = parseInt(args[0]);

    if (!amount || amount > 100)
      return message.reply("Enter a number between **1-100**.");

    await message.channel.bulkDelete(amount, true);

    message.channel.send(`🧹 Deleted ${amount} messages`);
  }


  // HELP
  if (cmd === "help") {

    message.reply(`
📜 **Commands**

🎮 Fun
.ping
.coinflip
.roll
.avatar

📊 Level
.level

🎫 Tickets
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


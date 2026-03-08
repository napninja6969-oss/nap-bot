const { Client, GatewayIntentBits, PermissionsBitField, ChannelType, EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");

const db = new QuickDB();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

const prefix = ".";

// ===== CONFIG =====

const WELCOME_CHANNEL = "welcome"; 
const GOODBYE_CHANNEL = "goodbye";

const levelRoles = {
  5: "14",
  10: "15",
  15: "16",
  20: "17",
  25: "18",
  30: "19",
  35: "20",
  40: "21"
};

const colorRoles = {
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

// ===== READY =====

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===== WELCOME =====

client.on("guildMemberAdd", async member => {

  const channel = member.guild.channels.cache.find(c => c.name === WELCOME_CHANNEL);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("🎉 Welcome")
    .setDescription(`Welcome ${member} to **${member.guild.name}**!`)
    .setThumbnail(member.user.displayAvatarURL())
    .setColor("Green")
    .setFooter({ text: `Member #${member.guild.memberCount}` });

  channel.send({ embeds: [embed] });

  try {

    const dmEmbed = new EmbedBuilder()
      .setTitle("Welcome!")
      .setDescription(`Welcome to **${member.guild.name}**!\nEnjoy your stay.`)
      .setColor("Blue");

    member.send({ embeds: [dmEmbed] });

  } catch {}

});

// ===== GOODBYE =====

client.on("guildMemberRemove", member => {

  const channel = member.guild.channels.cache.find(c => c.name === GOODBYE_CHANNEL);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("👋 Goodbye")
    .setDescription(`${member.user.tag} left the server`)
    .setColor("Red");

  channel.send({ embeds: [embed] });

});

// ===== LEVEL SYSTEM =====

client.on("messageCreate", async message => {

  if (!message.guild) return;
  if (message.author.bot) return;

  let xp = await db.get(`xp_${message.author.id}`) || 0;
  let level = await db.get(`level_${message.author.id}`) || 1;

  xp += 5;

  const needed = level * 100;

  if (xp >= needed) {

    level++;

    await db.set(`level_${message.author.id}`, level);
    await db.set(`xp_${message.author.id}`, 0);

    message.channel.send(`${message.author} leveled up to **${level}**`);

    const roleName = levelRoles[level];

    if (roleName) {

      const role = message.guild.roles.cache.find(r => r.name === roleName);

      if (role) {

        const member = message.guild.members.cache.get(message.author.id);
        member.roles.add(role);

      }

    }

  } else {

    await db.set(`xp_${message.author.id}`, xp);

  }

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  // ===== BASIC COMMANDS =====

  if (cmd === "ping") return message.reply("🏓 Pong");

  if (cmd === "level") {

    const level = await db.get(`level_${message.author.id}`) || 1;
    const xp = await db.get(`xp_${message.author.id}`) || 0;

    message.reply(`Level: **${level}** | XP: **${xp}**`);

  }

  // ===== COLOR ROLES PANEL =====

  if (cmd === "colorroles") {

    const embed = new EmbedBuilder()
      .setTitle("🎨 Choose Your Color")
      .setDescription(`
🔴 RED
🟠 ORANGE
🟡 YELLOW
🟢 GREEN
🔵 BLUE
🟣 PURPLE
⚫ BLACK
⚪ WHITE
🌸 PINK
`)
      .setColor("Blurple");

    const msg = await message.channel.send({ embeds: [embed] });

    for (const emoji in colorRoles) {
      await msg.react(emoji);
    }

  }

  // ===== TICKET =====

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

  if (cmd === "close") {

    if (!message.channel.name.startsWith("ticket-")) return;

    message.channel.delete();

  }

  // ===== CLEAR =====

  if (cmd === "clear") {

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply("No permission");

    const amount = parseInt(args[0]);

    if (!amount) return;

    await message.channel.bulkDelete(amount);

    message.channel.send(`Deleted ${amount} messages`);

  }

});

// ===== REACTION ROLES =====

client.on("messageReactionAdd", async (reaction, user) => {

  if (user.bot) return;

  const roleName = colorRoles[reaction.emoji.name];
  if (!roleName) return;

  const role = reaction.message.guild.roles.cache.find(r => r.name === roleName);
  if (!role) return;

  const member = await reaction.message.guild.members.fetch(user.id);

  member.roles.add(role);

});

client.on("messageReactionRemove", async (reaction, user) => {

  if (user.bot) return;

  const roleName = colorRoles[reaction.emoji.name];
  if (!roleName) return;

  const role = reaction.message.guild.roles.cache.find(r => r.name === roleName);
  if (!role) return;

  const member = await reaction.message.guild.members.fetch(user.id);

  member.roles.remove(role);

});

// ===== LOGIN =====

client.login(process.env.TOKEN);

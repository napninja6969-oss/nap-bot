const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const prefix = ".";

// Ready event
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Welcome message
client.on("guildMemberAdd", member => {
  const channel = member.guild.systemChannel;
  if (!channel) return;
  channel.send(`Welcome ${member.user.tag} to the server! 🎉`);
});

// Message commands
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  // Bad word filter
  const badWords = ["badword1", "badword2"];
  if (badWords.some(word => message.content.toLowerCase().includes(word))) {
    await message.delete();
    message.channel.send(`${message.author}, watch your language.`);
    return;
  }

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Ping
  if (command === "ping") {
    message.reply("Pong!");
  }

  // Hello
  else if (command === "hello") {
    message.reply("Hello 👋");
  }

  // Server info
  else if (command === "server") {
    message.reply(`Server name: ${message.guild.name}`);
  }

  // User info
  else if (command === "user") {
    message.reply(`Your username is ${message.author.username}`);
  }

  // Bot info
  else if (command === "botinfo") {
    message.reply(`Bot name: ${client.user.username}`);
  }

  // Help command
  else if (command === "help") {
    message.reply(`
Commands:
.ping
.hello
.server
.user
.botinfo
.help
.kick @user
.ban @user
.clear 10
`);
  }

  // Kick command
  else if (command === "kick") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply("You don't have permission.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention a user to kick.");

    await member.kick();
    message.channel.send(`${member.user.tag} was kicked.`);
  }

  // Ban command
  else if (command === "ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("You don't have permission.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention a user to ban.");

    await member.ban();
    message.channel.send(`${member.user.tag} was banned.`);
  }

  // Clear messages
  else if (command === "clear") {
    const amount = parseInt(args[0]);
    if (!amount) return message.reply("Specify number of messages.");

    await message.channel.bulkDelete(amount, true);
    message.channel.send(`Deleted ${amount} messages.`)
      .then(msg => setTimeout(() => msg.delete(), 3000));
  }
});

client.login(process.env.TOKEN);

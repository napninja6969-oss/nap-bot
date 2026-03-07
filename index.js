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

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("guildMemberAdd", member => {
  const channel = member.guild.systemChannel;
  if (channel) {
    channel.send(`Welcome ${member.user.tag} to the server 🎉`);
  }
});

client.on("messageCreate", async message => {

  if (message.author.bot) return;

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    return message.reply("Pong!");
  }

  if (command === "hello") {
    return message.reply("Hello 👋");
  }

  if (command === "server") {
    return message.reply(`Server name: ${message.guild.name}`);
  }

  if (command === "user") {
    return message.reply(`Your username is ${message.author.username}`);
  }

  if (command === "avatar") {
    return message.reply(message.author.displayAvatarURL({ dynamic: true }));
  }

  if (command === "coinflip") {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";
    return message.reply(`🪙 ${result}`);
  }

  if (command === "roll") {
    const roll = Math.floor(Math.random() * 6) + 1;
    return message.reply(`🎲 You rolled ${roll}`);
  }

  if (command === "clear") {

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply("You don't have permission.");

    const amount = parseInt(args[0]);
    if (!amount) return message.reply("Enter number of messages.");

    await message.channel.bulkDelete(amount, true);
    return message.channel.send(`Deleted ${amount} messages`);
  }

  if (command === "kick") {

    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply("You don't have permission.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention a user.");

    await member.kick();
    return message.channel.send(`${member.user.tag} was kicked`);
  }

  if (command === "ban") {

    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("You don't have permission.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention a user.");

    await member.ban();
    return message.channel.send(`${member.user.tag} was banned`);
  }

  if (command === "help") {

    return message.reply(`
Commands:
.ping
.hello
.server
.user
.avatar
.coinflip
.roll
.clear
.kick
.ban
.help
`);
  }

});

client.login(process.env.TOKEN);

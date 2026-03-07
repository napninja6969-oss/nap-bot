const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", message => {
  if (message.author.bot) return;

  const command = message.content.toLowerCase();

  if (command === ".ping") {
    message.reply("Pong!");
  } 
  else if (command === ".hello") {
    message.reply("Hello 👋");
  } 
  else if (command === ".server") {
    message.reply(`Server name: ${message.guild.name}`);
  } 
  else if (command === ".user") {
    message.reply(`Your username is ${message.author.username}`);
  }
});

client.login(process.env.TOKEN);


const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const config = require("./config.json");

const client = new Client({
 intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildVoiceStates
 ]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
 const command = require(`./commands/${file}`);
 client.commands.set(command.name, command);
}

client.once("ready", () => {
 console.log(`🤖 Bot online as ${client.user.tag}`);
});

client.on("messageCreate", message => {
 if (!message.content.startsWith(config.prefix) || message.author.bot) return;

 const args = message.content.slice(config.prefix.length).split(/ +/);
 const command = args.shift().toLowerCase();

 const cmd = client.commands.get(command);
 if (cmd) cmd.execute(message, args, client);
});

client.login(process.env.TOKEN);


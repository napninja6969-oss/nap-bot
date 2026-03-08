```javascript
const { 
Client, 
GatewayIntentBits, 
EmbedBuilder, 
PermissionsBitField, 
ActionRowBuilder, 
ButtonBuilder, 
ButtonStyle, 
Events 
} = require('discord.js');

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
});

const prefix = "!";

/* ================= READY ================= */

client.once("ready", () => {
console.log(`Logged in as ${client.user.tag}`);
});

/* ================= WELCOME SYSTEM ================= */

client.on(Events.GuildMemberAdd, async member => {

const channel = member.guild.channels.cache.find(c => c.name === "welcome");

if(!channel) return;

const embed = new EmbedBuilder()
.setTitle("Welcome!")
.setDescription(`Welcome to **${member.guild.name}**, ${member}!`)
.setThumbnail(member.user.displayAvatarURL())
.setColor("Green")
.setFooter({text:"Enjoy your stay!"});

channel.send({embeds:[embed]});

try{
await member.send(`Welcome to **${member.guild.name}**!`);
}catch{}
});

/* ================= GOODBYE SYSTEM ================= */

client.on(Events.GuildMemberRemove, member => {

const channel = member.guild.channels.cache.find(c => c.name === "goodbye");

if(!channel) return;

const embed = new EmbedBuilder()
.setTitle("Goodbye!")
.setDescription(`${member.user.tag} has left the server.`)
.setColor("Red");

channel.send({embeds:[embed]});

});

/* ================= COMMANDS ================= */

client.on("messageCreate", async message => {

if(message.author.bot) return;
if(!message.content.startsWith(prefix)) return;

const args = message.content.slice(prefix.length).trim().split(/ +/);
const command = args.shift().toLowerCase();

/* ===== PING ===== */

if(command === "ping"){
message.reply(`🏓 Pong! ${client.ws.ping}ms`);
}

/* ===== CLEAR ===== */

if(command === "clear"){

if(!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
return message.reply("No permission");

const amount = args[0];

if(!amount) return message.reply("Specify amount");

await message.channel.bulkDelete(amount,true);

message.channel.send(`Deleted ${amount} messages`);
}

/* ===== KICK ===== */

if(command === "kick"){

if(!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
return;

const member = message.mentions.members.first();

if(!member) return message.reply("Mention user");

member.kick();

message.channel.send(`${member.user.tag} kicked`);
}

/* ===== BAN ===== */

if(command === "ban"){

if(!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
return;

const member = message.mentions.members.first();

if(!member) return message.reply("Mention user");

member.ban();

message.channel.send(`${member.user.tag} banned`);
}

/* ================= EMBED BUILDER ================= */

if(command === "embed"){

const text = args.join(" ");

if(!text) return message.reply("Provide embed text");

const embed = new EmbedBuilder()
.setDescription(text)
.setColor("Blue")
.setFooter({text:`Requested by ${message.author.tag}`});

message.channel.send({embeds:[embed]});
}

/* ================= COLOR ROLE PANEL ================= */

if(command === "colorpanel"){

const embed = new EmbedBuilder()
.setTitle("Choose Your Color Role")
.setDescription("Click a button to get a role")
.setColor("Purple");

const row = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("red_role")
.setLabel("Red")
.setStyle(ButtonStyle.Danger),

new ButtonBuilder()
.setCustomId("blue_role")
.setLabel("Blue")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("green_role")
.setLabel("Green")
.setStyle(ButtonStyle.Success)

);

message.channel.send({embeds:[embed],components:[row]});

}

});

/* ================= BUTTON ROLE HANDLER ================= */

client.on(Events.InteractionCreate, async interaction => {

if(!interaction.isButton()) return;

const member = interaction.member;

if(interaction.customId === "red_role"){

const role = interaction.guild.roles.cache.find(r => r.name === "Red");

if(!role) return interaction.reply({content:"Role not found",ephemeral:true});

member.roles.add(role);

interaction.reply({content:"Red role added!",ephemeral:true});
}

if(interaction.customId === "blue_role"){

const role = interaction.guild.roles.cache.find(r => r.name === "Blue");

if(!role) return interaction.reply({content:"Role not found",ephemeral:true});

member.roles.add(role);

interaction.reply({content:"Blue role added!",ephemeral:true});
}

if(interaction.customId === "green_role"){

const role = interaction.guild.roles.cache.find(r => r.name === "Green");

if(!role) return interaction.reply({content:"Role not found",ephemeral:true});

member.roles.add(role);

interaction.reply({content:"Green role added!",ephemeral:true});
}

});

/* ================= LOGIN ================= */

client.login("YOUR_BOT_TOKEN");
```

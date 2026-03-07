const { Client, GatewayIntentBits, PermissionsBitField, ChannelType } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions
  ]
});

const prefix = ".";
const spamMap = new Map();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("guildMemberAdd", member => {
  const channel = member.guild.systemChannel;
  if (!channel) return;
  channel.send(`Welcome ${member.user.tag} to the server 🎉`);
});

client.on("messageCreate", async message => {

  if (message.author.bot) return;

  // BAD WORD FILTER
  const badWords = ["badword1","badword2"];
  if (badWords.some(w => message.content.toLowerCase().includes(w))) {
    await message.delete();
    return message.channel.send(`${message.author} watch your language.`);
  }

  // SIMPLE ANTI SPAM
  const now = Date.now();
  const timestamps = spamMap.get(message.author.id) || [];
  timestamps.push(now);
  spamMap.set(message.author.id, timestamps.filter(t => now - t < 5000));

  if (spamMap.get(message.author.id).length > 5) {
    message.delete();
    return message.channel.send(`${message.author} stop spamming.`);
  }

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).split(" ");
  const command = args.shift().toLowerCase();

  // PING
  if (command === "ping") {
    message.reply("Pong!");
  }

  // HELLO
  else if (command === "hello") {
    message.reply("Hello 👋");
  }

  // USER INFO
  else if (command === "user") {
    message.reply(`Username: ${message.author.username}`);
  }

  // SERVER INFO
  else if (command === "server") {
    message.reply(`Server name: ${message.guild.name}`);
  }

  // AVATAR
  else if (command === "avatar") {
    message.reply(message.author.displayAvatarURL({dynamic:true}));
  }

  // COINFLIP
  else if (command === "coinflip") {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";
    message.reply(`🪙 ${result}`);
  }

  // ROLL
  else if (command === "roll") {
    const roll = Math.floor(Math.random()*6)+1;
    message.reply(`🎲 You rolled ${roll}`);
  }

  // CLEAR
  else if (command === "clear") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return message.reply("No permission.");

    const amount = parseInt(args[0]);
    if (!amount) return message.reply("Specify number.");

    await message.channel.bulkDelete(amount,true);
    message.channel.send(`Deleted ${amount} messages`)
      .then(m=>setTimeout(()=>m.delete(),3000));
  }

  // KICK
  else if (command === "kick") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply("No permission.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention a user.");

    await member.kick();
    message.channel.send(`${member.user.tag} kicked`);
  }

  // BAN
  else if (command === "ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("No permission.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention user.");

    await member.ban();
    message.channel.send(`${member.user.tag} banned`);
  }

  // TICKET
  else if (command === "ticket") {

    const existing = message.guild.channels.cache.find(
      c => c.name === `ticket-${message.author.id}`
    );

    if (existing) return message.reply("You already have a ticket.");

    const channel = await message.guild.channels.create({
      name:`ticket-${message.author.id}`,
      type:ChannelType.GuildText,
      permissionOverwrites:[
        { id:message.guild.id, deny:["ViewChannel"] },
        { id:message.author.id, allow:["ViewChannel","SendMessages"] }
      ]
    });

    channel.send(`${message.author} Support will be with you soon.`);
  }

  // CLOSE TICKET
  else if (command === "close") {
    if (!message.channel.name.startsWith("ticket-")) return;
    message.channel.delete();
  }

  // REACTION ROLE MESSAGE
  else if (command === "reactrole") {

    const msg = await message.channel.send("React with 👍 to get the Member role.");
    await msg.react("👍");

    const filter = (reaction,user) => reaction.emoji.name === "👍" && !user.bot;

    const collector = msg.createReactionCollector({filter});

    collector.on("collect",(reaction,user)=>{

      const member = message.guild.members.cache.get(user.id);
      const role = message.guild.roles.cache.find(r=>r.name==="Member");

      if(role) member.roles.add(role);

    });
  }

  // HELP
  else if (command === "help") {

    message.reply(`
Commands:
.ping
.hello
.server
.user
.avatar
.coinflip
.roll
.ticket
.close
.reactrole
.clear
.kick
.ban
.help
`);

  }

});

client.login(process.env.TOKEN);

module.exports = (client) => {

client.on("messageReactionAdd", async (reaction, user) => {

 if (reaction.message.partial) await reaction.message.fetch();

 if (reaction.message.channel.name === "role-select") {

 const role = reaction.message.guild.roles.cache.find(r => r.name === reaction.emoji.name);

 if (role) {
  const member = await reaction.message.guild.members.fetch(user.id);
  member.roles.add(role);
 }

 }

});

};

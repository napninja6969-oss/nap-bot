module.exports = (client) => {

client.on("voiceStateUpdate", (oldState, newState) => {

 if (newState.channel && newState.channel.name === "Create Voice") {

  const channel = newState.guild.channels.create({
   name: `${newState.member.user.username}'s Room`,
   type: 2
  });

  newState.member.voice.setChannel(channel);

 }

});

};

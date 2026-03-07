const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
 name: "ticket",
 execute(message) {

 const button = new ButtonBuilder()
  .setCustomId("create_ticket")
  .setLabel("🎫 Create Ticket")
  .setStyle(ButtonStyle.Primary);

 const row = new ActionRowBuilder().addComponents(button);

 message.channel.send({
  content: "Press the button to open a support ticket",
  components: [row]
 });

 }
};

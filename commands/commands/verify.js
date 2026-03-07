const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
 name: "verify",
 execute(message) {

 const button = new ButtonBuilder()
  .setCustomId("verify_user")
  .setLabel("✅ Verify")
  .setStyle(ButtonStyle.Success);

 const row = new ActionRowBuilder().addComponents(button);

 message.channel.send({
  content: "Click to verify yourself",
  components: [row]
 });

 }
};

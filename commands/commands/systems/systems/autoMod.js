module.exports = (client) => {

client.on("messageCreate", message => {

 if (message.author.bot) return;

 const bannedWords = ["badword1","badword2"];

 if (bannedWords.some(word => message.content.includes(word))) {
  message.delete();
  message.channel.send(`${message.author}, watch your language.`);
 }

});

};

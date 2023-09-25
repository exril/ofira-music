const Command = require("../../abstract/Command.js");
const { MessageEmbed } = require('discord.js');

module.exports = class Vote extends Command {
  constructor(client) {
    super(client, {
      name: "vote",
      description: "Checks a user vote and also returns the vote link",
      category: 'Utility',
    });
  }
  
  async run(msg) {
    const embed = new MessageEmbed()
    .setColor(this.client.util.color.primary)
    .setAuthor(this.client.user.tag, this.client.user.avatarURL({ size: 1024 }))
    .setDescription(
      `${this.client.dbl.hasVoted(msg.author.id) ? "You have already voted, you can vote me in every 12 hours" : "You have not voted me, vote me from the link below"}\n`+
      `Vote Link: [Click here](https://top.gg/bot/${this.client.user.id}/vote)`
      )
    .setFooter(`Requested by: ${msg.author.tag}`, msg.author.displayAvatarURL({ dynamic: true }));

    return msg.channel.send(embed);
  }
};
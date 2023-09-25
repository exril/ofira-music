const Command = require("../../abstract/Command.js");
const { MessageEmbed } = require('discord.js');

module.exports = class Invite extends Command {
  constructor(client) {
    super(client, {
      name: "invite",
      description: "Gives you the invite and support server link",
      category: 'Utility',
      aliases: ["support", "inv"],
    });
  }
  
  async run(msg) {
    const embed = new MessageEmbed()
    .setColor(this.client.util.color.primary)
    .setAuthor(this.client.user.tag, this.client.user.avatarURL({ size: 1024 }))
    .setDescription(
      `Want to invite me to your server: [Click here](https://discord.com/oauth2/authorize?client_id=818570692847992902&permissions=8&scope=bot)\n`+
      `Need support or encountered a bug, join my server: [Click here](https://discord.gg/ndYpyzAU2Z)\n`+
      `Enjoying using Ofira, you can support us by voting our bot on top.gg: [Click here](https://top.gg/bot/818570692847992902/vote)\n`+
      `Checkout our premium tiers and their perks: [Click here](https://www.patreon.com/ofira)`
      )
    return msg.channel.send(embed);
  }
};
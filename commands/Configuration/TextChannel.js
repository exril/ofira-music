const Command = require("../../abstract/Command.js");

module.exports = class TextChannel extends Command {
  constructor(client) {
    super(client, {
      name: "textchannel",
      description: "Bots main commander channel configuration",
      category: 'Configuration',
      aliases: ["tc"],
      usage: ["<channel/disable>"],
      example: ["#Ofira-Requests", "disable"],
      userPerms: ["MANAGE_GUILD"]
    });
  }
  
  async run(msg, [value]) {
    if (!value || (value && !value.match(/disable|off|<#(\d{17,19})>|\d{17,19}/))) return this.argsMissing(msg);

    let channel;

    if (["off", "disable"].includes(value)) {
      msg.guild.config.plugins.playerConfig.textChannel = null;
      msg.guild.config.markModified("plugins.playerConfig.textChannel");
      msg.guild.config.save();
    } else {

      if (!["disable", "off"].includes(value)) channel = await this.client.util.resolveChannel(value, msg.guild);

      if (!channel) return this.client.send(msg.channel.id, {
        embed: {
          color: this.client.util.color.error,
          description: `${this.client.util.emoji.error} | Provide a valid channel!`
        }
      });

      msg.guild.config.plugins.playerConfig.textChannel = channel.id;
      msg.guild.config.markModified("plugins.playerConfig.textChannel");
      msg.guild.config.save();
    }

    return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.success,
        description: `${this.client.util.emoji.success} | Default channel has been ${["off", "disable"].includes(value) ? "removed" : `bound to ${channel.toString()}`}`
      }
    });
  }
};

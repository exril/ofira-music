const Command = require("../../abstract/Command.js");

module.exports = class TwentyFourHour extends Command {
  constructor(client) {
    super(client, {
      name: "247",
      description: "Enables/disables 24/7 vc system",
      category: 'Configuration',
      aliases: ["24/7", "24h"],
      usage: ["<enable/disable>"],
      example: ["enable"],
      userPerms: ["ADMINISTRATION"]
    });
  }
  
  async run(msg, [state]) {
    if (!state || (state && !state.match(/enable|disable|off|on/))) return this.argsMissing(msg);

    if (["off", "disable"].includes(state)) {
      msg.guild.config.plugins.playerConfig.livePlayer = false;
      msg.guild.config.markModified("plugins.playerConfig.livePlayer");
    } else {
      msg.guild.config.plugins.playerConfig.livePlayer = true;
      msg.guild.config.markModified("plugins.playerConfig.livePlayer");
    }
    
    if (msg.member.voice.channel) {
      msg.guild.config.plugins.playerConfig.voiceChannelID = msg.member.voice.channel.id;
      msg.guild.config.markModified("plugins.playerConfig.voiceChannelID");
    }
    
    msg.guild.config.save();

    return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.success,
        description: `${this.client.util.emoji.success} | 24/7 has ${["off", "disable"].includes(state) ? "disabled" : "enabled"}`
      }
    });
  }
};

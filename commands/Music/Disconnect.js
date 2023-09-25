const Command = require("../../abstract/Command.js");

module.exports = class Disconnect extends Command {
  constructor(client) {
    super(client, {
      name: "disconnect",
      description: "Disconnects the bot from your voice channel and clears the queue",
      category: 'Music',
      aliases: ["dc", "leave"]
    });
  }

  async run(msg) {
    if(!this.playerPerms.canStop(msg)) return;

    let dispatcher = this.client.players.get(msg.guild.id);

    let voiceChannel = this.client.channels.cache.get(dispatcher.voiceChannelID);

    if (msg.guild.config.plugins.playerConfig.livePlayer) {
      msg.guild.config.plugins.playerConfig.voiceChannelID = null;
      msg.guild.config.markModified("plugins.playerConfig.voiceChannelID");
      msg.guild.config.save();
    }

    dispatcher.destroy();

    return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.primary,
        description: `${this.client.util.emoji.success} | Disconnected from ${voiceChannel.toString()}`
      }
    });
  }
}
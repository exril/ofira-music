const Command = require("../../abstract/Command.js");

module.exports = class DistorTion extends Command {
  constructor(client) {
    super(client, {
      name: "distortion",
      description: "Adds distortion effect to track(s)",
      category: 'Filters',
      aliases: ["dtion"],
      voteLock: true
    });
  }

  async run(msg) {
    if(!this.playerPerms.canStopCurrent(msg)) return;

    const dispatcher = this.client.players.get(msg.guild.id);

    if (!dispatcher.filter.distortion) dispatcher.filter.setDistortion(true);
    else if (dispatcher.filter.distortion) dispatcher.filter.setDistortion(false);

    return this.client.send(msg.channel.id, { 
      embed: {
      color: this.client.util.color.primary,
      description: `${this.client.util.emoji.success} | Distortion has \`${dispatcher.filter.distortion ? "activated" : "unactivated"}\``
      }
    });
  }
}

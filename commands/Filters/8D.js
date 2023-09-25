const Command = require("../../abstract/Command.js");

module.exports = class VaporWave extends Command {
  constructor(client) {
    super(client, {
      name: "8D",
      description: "Adds 8D effect to track(s)",
      category: 'Filters',
      aliases: ["eightd"],
      voteLock: true
    });
  }

  async run(msg) {
    if(!this.playerPerms.canStopCurrent(msg)) return;

    const dispatcher = this.client.players.get(msg.guild.id);

    if (!dispatcher.filter._8d) dispatcher.filter.set8D(true);
    else if (dispatcher.filter._8d) dispatcher.filter.set8D(false);

    return this.client.send(msg.channel.id, { 
      embed: {
      color: this.client.util.color.primary,
      description: `${this.client.util.emoji.success} | 8D has \`${dispatcher.filter._8d ? "Activated" : "Unactivated"}\``
      }
    });
  }
}

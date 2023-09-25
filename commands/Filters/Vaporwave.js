const Command = require("../../abstract/Command.js");

module.exports = class VaporWave extends Command {
  constructor(client) {
    super(client, {
      name: "vaporwave",
      description: "Adds vaporwave effect to track(s)",
      category: 'Filters',
      aliases: ["vwave"],
      voteLock: true
    });
  }

  async run(msg) {
    if(!this.playerPerms.canStopCurrent(msg)) return;

    const dispatcher = this.client.players.get(msg.guild.id);

    if (!dispatcher.filter.vaporwave) dispatcher.filter.setVaporwave(true);
    else if (dispatcher.filter.vaporwave) dispatcher.filter.setVaporwave(false);

    return this.client.send(msg.channel.id, { 
      embed: {
      color: this.client.util.color.primary,
      description: `${this.client.util.emoji.success} | Vaporwave has \`${dispatcher.filter.vaporwave ? "activated" : "unactivated"}\``
      }
    });
  }
}

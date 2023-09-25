const Command = require("../../abstract/Command.js");

module.exports = class DayCore extends Command {
  constructor(client) {
    super(client, {
      name: "daycore",
      description: "Adds daycore effect to track(s)",
      category: 'Filters',
      aliases: ["dcore"],
      voteLock: true
    });
  }

  async run(msg) {
    if(!this.playerPerms.canStopCurrent(msg)) return;

    const dispatcher = this.client.players.get(msg.guild.id);

    if (!dispatcher.filter.daycore) dispatcher.filter.setDaycore(true);
    else if (dispatcher.filter.daycore) dispatcher.filter.setDaycore(false);

    return this.client.send(msg.channel.id, { 
      embed: {
      color: this.client.util.color.primary,
      description: `${this.client.util.emoji.success} | Daycore has \`${dispatcher.filter.daycore ? "activated" : "unactivated"}\``
      }
    });
  }
}

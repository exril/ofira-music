const Command = require("../../abstract/Command.js");

module.exports = class NightCore extends Command {
  constructor(client) {
    super(client, {
      name: "nightcore",
      description: "Adds nightcore effect to track(s)",
      category: 'Filters',
      aliases: ["ncore"],
      voteLock: true
    });
  }

  async run(msg) {
    if(!this.playerPerms.canStopCurrent(msg)) return;

    const dispatcher = this.client.players.get(msg.guild.id);

    if (!dispatcher.filter.nightcore) dispatcher.filter.setNightcore(true);
    else if (dispatcher.filter.nightcore) dispatcher.filter.setNightcore(false);

    return this.client.send(msg.channel.id, { 
      embed: {
      color: this.client.util.color.primary,
      description: `${this.client.util.emoji.success} | Nightcore has \`${dispatcher.filter.nightcore ? "activated" : "unactivated"}\``
      }
    });
  }
}

const Command = require("../../abstract/Command.js");

module.exports = class BassBoost extends Command {
  constructor(client) {
    super(client, {
      name: "bassboost",
      description: "Adds bassboost effect to track(s)",
      category: 'Filters',
      aliases: ["bb"],
      usage: ["<low/medium/high>"],
      example: ["high"],
      voteLock: true
    });
  }

  async run(msg, args) {
    if(!this.playerPerms.canStopCurrent(msg)) return;

    const dispatcher = this.client.players.get(msg.guild.id);

    if (!dispatcher.filter.bassboost) dispatcher.filter.setBassboost(true, args.length > 0 && args[0].toLowerCase().match(/low|medium|high/) ? args[0].toLowerCase() : "medium");
    else if (dispatcher.filter.bassboost && !args.length) dispatcher.filter.setBassboost(false);

    return this.client.send(msg.channel.id, { 
      embed: {
      color: this.client.util.color.primary,
      description: `${this.client.util.emoji.success} | Bassboost has \`${dispatcher.filter.bassboost ? "Activated" : "Unactivated"}\` ${dispatcher.filter.bassboost ? `on \`${args[0] || "medium"}\` level` : ""}`
      }
    });
  }
}

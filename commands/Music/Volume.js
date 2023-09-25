const Command = require("../../abstract/Command.js");

module.exports = class Volume extends Command {
  constructor(client) {
    super(client, {
      name: "volume",
      description: "Increases or decreases the volume if provided or returns the current volume",
      category: 'Music',
      usage: ["[volume]"],
      example: ["[1-200]"],
      aliases: ["vol"],
      voteLock: true
    });
  }

  async run(msg, args) {
    if(!this.playerPerms.canStopCurrent(msg)) return;

    let dispatcher = this.client.players.get(msg.guild.id);

    if (!args.length && dispatcher.player) return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.volume} | Current volume is \`${dispatcher.player.filters.volume * 100}\``
      }
    });

    let volume = parseInt(args[0]);

    if (volume > 200 || volume < 0) return msg.channel.send({embed: {
      color: this.client.util.color.error,
      title: `${this.client.util.emoji.error} | Volume input must be higher than \`0\` and not higher than \`200\`!`
    }});

    await dispatcher.player.setVolume(volume / 200);

    return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.primary,
        description: `${this.client.util.emoji.volume} | Volume has been updated to ${volume}%`
      }
    });
  }
}
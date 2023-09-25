const Command = require("../../abstract/Command.js");

module.exports = class AutoPlay extends Command {
  constructor(client) {
    super(client, {
      name: "autoplay",
      description: "Finds the similar tracks to the last current song and adds to the queue when queue is empty",
      category: 'Music',
      aliases: ["ap"]
    });
  }

  async run(msg) {
    if(!this.playerPerms.canStopCurrent(msg)) return;

    let dispatcher = this.client.players.get(msg.guild.id);

    dispatcher.autoPlay = !dispatcher.autoPlay;

    return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.primary,
        description: `${this.client.util.emoji.play} | Autoplay has been \`${dispatcher.autoPlay ? "enabled" : "disabled"}\``
      }
    })
  }
}
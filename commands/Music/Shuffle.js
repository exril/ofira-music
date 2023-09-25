const Command = require("../../abstract/Command.js");

module.exports = class Shuffle extends Command {
  constructor(client) {
    super(client, {
      name: "shuffle",
      description: "Starts playing the current song from start",
      category: 'Music',
    });
  }

  async run(msg) {
    if (!this.playerPerms.canStopQueue(msg)) return;

    let dispatcher = this.client.players.get(msg.guild.id);

    dispatcher.queue.shuffle();

    return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.primary,
        description: `${this.client.util.emoji.shuffle} | Queue Shuffled`
      }
    });
  }
}

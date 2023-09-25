const Command = require("../../abstract/Command.js");

module.exports = class Replay extends Command {
  constructor(client) {
    super(client, {
      name: "replay",
      description: "Starts playing the current song a",
      category: 'Music',
    });
  }

  async run(msg) {
    if(!this.playerPerms.canStopCurrent(msg)) return;

    let dispatcher = this.client.players.get(msg.guild.id);

    await dispatcher.player.seekTo(0);

    return msg.react(this.client.util.emoji.play);
  }
}

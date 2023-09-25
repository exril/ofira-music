const Command = require("../../abstract/Command.js");

module.exports = class Pause extends Command {
  constructor(client) {
    super(client, {
      name: "pause",
      description: "Pauses playback",
      category: 'Music',
    });
  }

  async run(msg) {
    if(!this.playerPerms.canStopCurrent(msg)) return;

    let dispatcher = this.client.players.get(msg.guild.id);

    dispatcher.pause();

    return msg.react(this.client.util.emoji.pause);
  }
}
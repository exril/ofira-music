const Command = require("../../abstract/Command.js");

module.exports = class Stop extends Command {
  constructor(client) {
    super(client, {
      name: "stop",
      description: "Stops the playback",
      category: 'Music',
    });
  }

  async run(msg) {
    if(!this.playerPerms.canStop(msg)) return;

    let dispatcher = this.client.players.get(msg.guild.id);

    dispatcher.setTrackRepeat(false);
    dispatcher.setQueueRepeat(false);
    dispatcher.queue.clear();
    dispatcher.filter.clearEffects();
    dispatcher.stop();

    await msg.react(this.client.util.emoji.stop);
  }
}
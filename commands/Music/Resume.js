const Command = require("../../abstract/Command.js");

module.exports = class Resume extends Command {
  constructor(client) {
    super(client, {
      name: "resume",
      description: "Resumes playback",
      category: 'Music',
    });
  }

  async run(msg) {
    if(!this.playerPerms.canStopCurrent(msg)) return;

    let dispatcher = this.client.players.get(msg.guild.id);

    dispatcher.pause(false);

    return msg.react(this.client.util.emoji.play);
  }
}
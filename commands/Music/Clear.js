const Command = require("../../abstract/Command.js");
const { Collection } = require('discord.js');

module.exports = class Clear extends Command {
  constructor(client) {
    super(client, {
      name: "clear",
      description: "Clears the queue, or if a user is mentioned clears all the tracks queued by the user",
      category: 'Music',
      aliases: ["cl"],
      usage: ["[@user]"]
    });
  }
  
  async run(msg, [user]) {
    if (!this.playerPerms.canStop(msg)) return;

    let dispatcher = this.client.players.get(msg.guild.id);

    if (dispatcher.queue.length < 1) return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | Queue is empty`
      }
    });

    user = await this.client.util.resolveUser(user).catch(() => false);
    
    if (user) {
      let filterQueue = new Collection();
      let oldQueue = dispatcher.queue.length;

      for (let track of dispatcher.queue) if (track.requestedBy.id !== user.id) filterQueue.set(track.requestedBy.id, track);
      
      dispatcher.queue.clear();
      
      for (let track of filterQueue.array()) dispatcher.queue.push(track)

      return this.client.send(msg.channel.id, {
        embed: {
          color: this.client.util.color.primary,
          description: `${this.client.util.emoji.success} | Cleared \`${oldQueue - filterQueue.size}\` tracks from ${user.toString()} `
        }
      });
    } else if (!user) {
      dispatcher.setTrackRepeat(false);
      dispatcher.setQueueRepeat(false);
      dispatcher.queue.clear();

      return this.client.send(msg.channel.id, {
        embed: {
          color: this.client.util.color.primary,
          description: `${this.client.util.emoji.success} | Cleared the queue!`
        }
      });
    }
  }
};
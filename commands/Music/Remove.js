const Command = require("../../abstract/Command.js");
const { Collection } = require('discord.js');

module.exports = class RemoveDupes extends Command {
  constructor(client) {
    super(client, {
      name: "remove",
      description: "Removes duplicate songs from the queue",
      category: 'Music',
      aliases: ["rem"],
    });
  }
  
  async run(msg) {
    if (!this.playerPerms.canStop(msg)) return;

    let dispatcher = this.client.players.get(msg.guild.id);

    if (dispatcher.queue.length < 1) return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | Queue is empty`
      }
    });
    
    let filterQueue = new Collection();
    let oldQueue = dispatcher.queue.length;

    for (let track of dispatcher.queue) {
      if (!filterQueue.has(track.track)) filterQueue.set(track.track, track);
    }

    dispatcher.queue.clear();
    for (let track of filterQueue.array()) {
      dispatcher.queue.push(track);
    }

    return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.primary,
        description: `${this.client.util.emoji.success} | Removed \`${oldQueue - filterQueue.size}\` duplicates from the queue`
      }
    });
  }
};
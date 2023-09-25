const Command = require("../../abstract/Command.js");
const { MessageEmbed } = require('discord.js');
const OfiraDispatcher = require ("../../structures/player/Dispatcher.js");

module.exports = class Queue extends Command {
  constructor(client) {
    super(client, {
      name: "queue",
      description: "Shows information about the queue, if none returns the information about current playing track",
      category: 'Music',
      aliases: ["q"],
      clientPerms: ["MANAGE_MESSAGES"]
    });
  }
  
  async run(msg) {
      
      let dispatcher = this.client.players.get(msg.guild.id);
      
      
      const { current } = dispatcher;
      const Duration = this.client.util.formatDuration(current.info.length);
      const queue = dispatcher.queue.length > 9 ? dispatcher.queue.slice(0, 9) : dispatcher.queue;
      
      const embed = new MessageEmbed()
              .setColor(this.client.util.color.primary)
              .setTitle('Now Playing')
              .setThumbnail(`https://img.youtube.com/vi/${dispatcher.current.info.identifier}/default.jpg`)
              .setDescription(`[${dispatcher.current.info.title}](${dispatcher.current.info.uri}) [${Duration}]`)
              .setFooter(`• ${dispatcher.queue.length} total songs in queue`);
      if (queue.length) embed.addField('Up Next', queue.map((track, index) => `**${index + 1}.)** \`${track.info.title}\``).join('\n'));
      return msg.channel.send(embed);
  }
};
const Command = require("../../abstract/Command.js");
const { MessageEmbed } = require('discord.js');

module.exports = class NowPlaying extends Command {
  constructor(client) {
    super(client, {
      name: "nowplaying",
      description: "Shows information about the current playing song",
      category: 'Music',
      aliases: ["np"],
    });
  }
  
  async run(msg) {
    let dispatcher = this.client.players.get(msg.guild.id);

    if (!dispatcher || (dispatcher && !dispatcher.current)) return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | No queue found for this server`
      }
    });

    const { current } = dispatcher;
    const parsedCurrentDuration = this.client.util.formatDuration(dispatcher.player.position);
    const parsedDuration = this.client.util.formatDuration(current.info.length);

    const part = Math.floor((dispatcher.player.position / current.info.length) * 30);

    let status = dispatcher.playing ? this.client.util.emoji.play : this.client.util.emoji.pause;
    let progEmoji = dispatcher.playing ? this.client.util.emoji.prog_blue : this.client.util.emoji.prog_red;
    let embedColor = dispatcher.playing ? this.client.util.color.primary : this.client.util.color.error;
    let requester = msg.guild.members.cache.has(current.requestedBy.id) ? current.requestedBy.tag : "Unknown#0000";

    let progressBar = `${'—'.repeat(part) + progEmoji + '—'.repeat(30 - part)}`;

    let embed = new MessageEmbed()
    .setColor(embedColor)
    .setThumbnail(`https://i.ytimg.com/vi/${current.info.identifier}/default.jpg`)
    .setAuthor("| Now Playing", this.client.util.assets.clientPicture)
    .setDescription(`[${current.info.title}](${current.info.uri})`)
    .addField("\u200B", `\`\`\`${parsedCurrentDuration} ${status} ${progressBar} ${parsedDuration}\`\`\``)
    .setFooter(`Requested by ${requester}`);
    
    return this.client.send(msg.channel.id, { embed: embed.toJSON() })
  }
};
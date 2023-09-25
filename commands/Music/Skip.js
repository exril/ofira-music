const Command = require("../../abstract/Command.js");

module.exports = class Skip extends Command {
  constructor(client) {
    super(client, {
      name: "skip",
      description: "Skips the current playing track or ask for vote if more than 1 members in voice channel",
      category: 'Music',
      aliases: ["vs", "s"],
    });
  }

  async run(msg) {
    if (!this.playerPerms.canStop(msg)) return;

    let dispatcher = this.client.players.get(msg.guild.id);

    const voiceChannel = msg.guild.me.voice.channel.members.filter(m => m.user.bot ? !m.user.bot : m);
    
    const memberCount = voiceChannel.size;
    const hasAdmin = msg.member.permissions.has("ADMINISTRATOR")
    
    if (hasAdmin && memberCount > 2) {
      const required = Math.ceil(memberCount / 2);

      let m = await msg.channel.send({
        embed: {
          color: this.client.util.color.primary,
          title: `${this.client.util.emoji.vote} | Vote to skip`,
          description: `Votes required: \`${required}\``
        }
      });

      await m.react(this.client.util.emoji.vote).catch(e => e);

      const filter = (reaction, user) => {
        return reaction.emoji.name === this.client.util.emoji.vote && voiceChannel.has(user.id);
      }
      
      const collector = m.createReactionCollector(filter, { time: 8000, maxUsers: voiceChannel.size, maxEmoji: 1 });

      collector.on('collect', async (reaction, user) => {
        if (reaction.count >= required) {
          collector.stop();
          if (m.deletable && !m.deleted) await m.delete();          
          msg.react(this.client.util.emoji.skip).catch(e => e);
          await dispatcher.stop();
        }
      });    
    }
    msg.react(this.client.util.emoji.skip).catch();
    await dispatcher.stop();
  }
}

const AbstractEvent = require('../../abstract/Event');
const { MessageEmbed } = require('discord.js');

module.exports = class MessageEvent extends AbstractEvent {
  constructor(client) {
    super(client, { name: 'message' });
  }
  async run(msg) {

    if (msg.channel.type === 'dm' || !msg.channel.viewable || msg.author.bot) return;
    if (msg.webhookID) return;

    if (!msg.channel.permissionsFor(msg.guild.me).has('SEND_MESSAGES')) return;

    if (!this.client.guilds.cache.has(msg.guild.id)) await this.client.guilds.fetch(msg.guild.id, true, false);
        
    if (!msg.guild.restTimestamp || msg.guild.restTimestamp) msg.guild.restTimestamp = Date.now();

    const mentionRegex = new RegExp(`^<@!?${this.client.user.id}>$`);
    const mentionRegexPrefix = new RegExp(`^<@!?${this.client.user.id}> `);

    if (msg.guild) {
      msg.guild.config = await msg.guild.settings();
      msg.guild.prefix = msg.guild.config.prefix;
    }

    //if (msg.guild && !msg.member) await msg.guild.members.fetch(msg.author.id).catch(e => this.client.logger.error(e));

    let embed = new MessageEmbed()
      .setAuthor(`${this.client.user.username}`, this.client.user.avatarURL({ dynamic: true, size: 4096 }))
      .setColor(this.client.util.color.primary)
      .setThumbnail(this.client.user.avatarURL({ dynamic: true, size: 4096 }))
      .setDescription(`My prefix for this server is \`${msg.guild.prefix}\`\nWant to see all the commands available? Use \`${msg.guild.prefix}help\``);

    if (msg.content.match(mentionRegex)) return msg.channel.send(embed);

    const prefix = msg.content.match(mentionRegexPrefix) ? msg.content.match(mentionRegexPrefix)[0] : msg.guild.prefix;

    if (!msg.content.startsWith(prefix)) return;
    const [cmdName, ...cmdArgs] = msg.content
      .slice(prefix.length)
      .trim()
      .split(/\s+/);

    const command = this.client.fetchCommand(cmdName);
    if (!command) return;

    if (msg.guild.config.plugins.playerConfig.textChannel !== null && msg.guild.channels.cache.has(msg.guild.config.plugins.playerConfig.textChannel) && msg.guild.config.plugins.playerConfig.textChannel !== msg.channel.id) return;
    if (!msg.guild.shard) return msg.channel.send(`An error has occured, Try something like kicking the bot and inviting it again, if it doesn't solve your issue, join our support server if it doesn't resolve ${this.client.config.supportServer("ndYpyzAU2Z")}`);

    if(command.voteLock) {
      const voted = await this.client.dbl.hasVoted(msg.author.id);
      if(!voted) return msg.channel.send(new MessageEmbed().setColor(this.client.util.color.primary).setDescription(`You Must Vote Me To Use This Command! on [top.gg](https://top.gg/bot/818570692847992902/vote)`));
    }

    const permission = command.checkPermissions(msg);
    if (!permission) return;
    
    try {
      command.run(msg, cmdArgs);
    } catch (e) {
      msg.channel.send({
        embed: {
          color: this.client.util.color.error,
          description: `${this.client.util.emoji.error} | Something went wrong!`
        }
      });

      this.client.webhook.error({
        color: this.client.util.color.error,
        title: `${command.name} | Error Occured`,
        description: `${e.message}`
      });

      this.client.logger.error(`Something went wrong: \n${e.stack}`)
    }
  }
}

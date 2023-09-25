const BaseEvent = require('../../abstract/Event');
const { MessageEmbed } = require('discord.js');

module.exports = class GuildCreateEvent extends BaseEvent {
  constructor(client) {
    super(client, { name: 'guildCreate' });
  }
  async run(guild) {
    if (!guild || (guild && !guild.available)) return;

    if (!guild.owner) guild.owner = await guild.fetchOwner().catch(e => this.client.logger.error(e))

    let defaultChannel = "";

    guild.channels.cache.forEach((channel) => {
      if (channel.type === "text" && ["general-chat", "general", "public-chat", "commands", "bot-commands"].includes(channel.name)) {
        if (channel.permissionsFor(guild.me).has("SEND_MESSAGES")) defaultChannel = channel;
      } else if (channel.type === "text") {
        if (channel.permissionsFor(guild.me).has("SEND_MESSAGES")) defaultChannel = channel;
      }
    });

    let embed = new MessageEmbed()
      .setAuthor(`${this.client.user.username}`, this.client.user.avatarURL({ dynamic: true, size: 4096 }))
      .setColor(this.client.util.color.primary)
      .setThumbnail(this.client.user.avatarURL({ dynamic: true, size: 4096 }))
      .setDescription(`My prefix for this server is \`${this.client.config.prefix}\`\nWant to see all the commands available? Use \`${this.client.config.prefix}help\`\nFound a bug or facing any issues? [Support Server](${this.client.config.supportServer('ndYpyzAU2Z')}) to join my server.\nWant to invite the bot? [Click here](${this.client.config.inviteURL(this.client.user.id)}) to invite me in your server.`);

    if (defaultChannel) defaultChannel.send(embed);
    if (defaultChannel) defaultChannel.send("https://discord.gg/ndYpyzAU2Z");

    let guilds = await this.client.shard.fetchClientValues(`guilds.cache.size`);

    this.client.webhook.guild({
      color: this.client.util.color.success,
      title: 'Guild Joined',
      thumbnail: { url: guild.iconURL({ dynamic: true, size: 1024 }) },
      description: `Name: ${guild.name}\nGuild ID: ${guild.id}\nGuild Owner: ${(guild.owner ? guild.owner.user.tag : await this.client.users.resolve(guild.ownerID || "")) || "NA"}\nMember Count: ${guild.memberCount}\nTotal Guilds: ${guilds.reduce((acc, cur) => acc + cur).toLocaleString()}\nOn Shard: ${guild.shardID + 1}`
    });
  }
}

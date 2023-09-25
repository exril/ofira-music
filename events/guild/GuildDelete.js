const BaseEvent = require('../../abstract/Event');

module.exports = class GuildDeleteEvent extends BaseEvent {
  constructor(client) {
    super(client, { name: 'guildDelete' });
  }
  async run(guild) {
    if (!guild || (guild && !guild.available)) return;

    if (!guild.owner) guild.owner = await guild.fetchOwner().catch(e => this.client.logger.error(e))

    await this.client.db.deleteGuild(guild.id);
    
    if (this.client.players.has(guild.id)) this.client.players.get(guild.id).destroy();

    if (!guild.name && !guild.memberCount) return;

    let guilds = await this.client.shard.fetchClientValues(`guilds.cache.size`);

    this.client.webhook.guild({
      color: this.client.util.color.error,
      title: 'Guild Left',
      thumbnail: { url: guild.iconURL({ dynamic: true, size: 4096 }) },
      description: `Name: ${guild.name}\nGuild ID: ${guild.id}\nGuild Owner: ${(guild.owner ? guild.owner.user.tag : await this.client.users.resolve(guild.ownerID || "")) || "NA"}\nMember Count: ${guild.memberCount}\nTotal Guilds: ${guilds.reduce((acc, cur) => acc + cur, 0).toLocaleString()}\nOn Shard: ${guild.shardID + 1}`
    });
  }
}

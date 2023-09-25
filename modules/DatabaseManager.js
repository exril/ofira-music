const { Collection } = require('discord.js');

module.exports = class DatabaseManager {
  constructor(client) {
    this.client = client;
    this.guildSchema = require('../models/Guild');
    this.guildsCache = new Collection();
  }

  async fetchGuild(id) {
    if (this.guildsCache.has(id)) return this.guildsCache.get(id);

    let result = await this.guildSchema.findOne({ id });

    if (!result) {
      result = new this.guildSchema({ id });
      await result.save();
    }

    this.guildsCache.set(result.id, result);
    return result;
  }

  async sync(id) {
    let result = await this.guildSchema.findOne({ id });

    if (!result) {
      result = new this.guildSchema({ id });
      await result.save();
    }

    this.guildsCache.set(result.id, result);
    return result;
  }

  async deleteGuild(id) {
    await this.guildSchema.deleteOne({ id });
    if (this.guildsCache.has(id)) this.guildsCache.delete(id);
  }

  async findOne(...args) {
    let result = await this.guildSchema.findOne({ id });
    if (!this.guildsCache.has(result.id)) result = this.guildsCache.set(result.id, result);
    return result;
  }

  //'plugins.playerConfig.voiceChannelID': { regex$: '/<#(\d{17,19})>/' }

  async fetchLiveDeployers() {
    let first = true;
    let results;

    if (!first && this.guildsCache.size) results = this.guildsCache.filter(data => data.plugins.playerConfig.livePlayer && plugins.playerConfig.voiceChannelID.match(/<#(\d{17,19})>/));

    //console.log(`GuildIDs`, this.client.guilds.cache.map(g => g.id));
    if (!first && results && results.length) return results;
    else results = await this.guildSchema.find({
      'plugins.playerConfig.livePlayer': true,
      'plugins.playerConfig.voiceChannelID': { $ne: null }
    });

    for (let result of results) this.guildsCache.set(result.id, result);
    first = false;
    return results;
  }
}
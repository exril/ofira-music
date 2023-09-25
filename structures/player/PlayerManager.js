const { Collection } = require("discord.js");
const Dispatcher = require("./Dispatcher");

module.exports = class PlayerManager {
  constructor(client) {
    this.client = client;
    this.players = new Collection();
  }

  get shoukaku() {
    return this.client.shoukaku;
  }

  get size() {
    return this.players.size;
  }
  
  has(id) {
    return this.players.has(id);
  }
  
  delete(id) {
    return this.players.delete(id);
  }
  
  get(id) {
    return this.players.get(id);
  }

  getPlayers(playing) {
    let players = this.players;
    if(playing) players = players.filter(dispatcher => dispatcher.playing);
    return players;
  }
  
  async handleDeploy(playerData) {
    let { guildID, voiceChannelID, textChannelID, node } = playerData;

    if(!this.client.shoukaku.nodes.size) return;
    
    const existing = this.get(guildID);
    
    if (!existing || (existing && !existing.player)) {
      node = this.client.shoukaku.getNode() || node;
      
      let player = await node.joinVoiceChannel({
        guildID,
        voiceChannelID: voiceChannelID,
        deaf: true,
      }).catch(e => {
        if(!["The voice connection is not established in 15 seconds", "This player is not yet connected, please wait for it to connect"].includes(e.message)) this.client.logger.debug("Voice Connection", e.stack) 
      });
      
      const guildData = await this.client.db.fetchGuild(guildID) || false;
      
      const dispatcher = new Dispatcher(this.client, {
        guildID,
        textChannelID,
        voiceChannelID,
        node,
        player,
        guildData,
        livePlayer: guildData ? guildData.plugins.playerConfig.livePlayer : false,
      });
      this.players.set(guildID, dispatcher);
      this.client.logger.debug("Live-Deploy", `New dispatcher connection @ ${guildID}`);
      return dispatcher;
    }
  }

  async handle(playerData, queueData) {
    let { guildID, voiceChannelID, textChannelID, node } = playerData;

    if(!this.client.shoukaku.nodes.size) return;
    
    const existing = this.get(guildID);
    
    if (!existing) {
      node = this.client.shoukaku.getNode() || node;
      
      let player = await node.joinVoiceChannel({
        guildID,
        voiceChannelID: voiceChannelID,
        deaf: true,
      }).catch(e => {
        if(!["The voice connection is not established in 15 seconds", "This player is not yet connected, please wait for it to connect"].includes(e.message)) this.client.logger.debug("Voice Connection", e.stack) 
      });
      
      const guildData = await this.client.db.fetchGuild(guildID) || false;
      
      const dispatcher = new Dispatcher(this.client, {
        guildID,
        textChannelID,
        voiceChannelID,
        node,
        player,
        guildData,
        livePlayer: guildData ? guildData.plugins.playerConfig.livePlayer : false,
      });
      if (queueData) dispatcher.loadTracks(queueData)
      this.players.set(guildID, dispatcher);
      this.client.logger.debug("Deploy", `New dispatcher connection @ ${guildID}`);
      return dispatcher;
    } else {
      existing.textChannelID = textChannelID
      if (queueData) existing.loadTracks(queueData);
      return existing;
    }
  }
};
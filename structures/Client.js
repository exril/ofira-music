const { Client, Collection, MessageEmbed } = require('discord.js');
const { connect } = require('mongoose');
const { LavasfyClient } = require('lavasfy');
const { spotifyNodes } = require('../lavalinkConf.js');
const Logger = require('../modules/Logger');
const CommandHandler = require('../modules/CommandHandler');
const EventHandler = require('../modules/EventHandler');
const ShoukakuHandler = require('./ShoukakuHandler');
const DatabaseManager = require('../modules/DatabaseManager');
const PlayerManager = require('./player/PlayerManager');
const Utils = require('./Util');
const WebhookLogger = require('./WebhookLogger');
const MemorySweeper = require('./MemorySweeper');

module.exports = class OfiraClient extends Client {
  constructor(clientOptions) {
    super(clientOptions);

    Object.defineProperty(this, 'location', { value: process.cwd() });

    this.logger = new Logger(this);
    this.snek = require('axios');
    this.config = require('../config.js');
    this.db = new DatabaseManager(this);
    this.shoukaku = new ShoukakuHandler(this);
    this.players = new PlayerManager(this);
    this.spotifyHandler = new LavasfyClient({
      ...this.config.credentials.spotify,
      playlistLoadLimit: 5,
      useSpotifyMetadata: true,
    }, spotifyNodes);
    this.util = new Utils(this);
    this.webhook = new WebhookLogger(this);

    this.commands = new Collection();
    this.aliases = new Collection();
    this.events = new Collection();

    this.sweeper = new MemorySweeper(this);

    //Cache
    //this.liveCache = new Set();

    new CommandHandler(this).build('../commands');
    new EventHandler(this).build('../events');

    Object.defineProperty(this, 'quitting', { value: false, writable: true });
    ['beforeExit', 'SIGUSR1', 'SIGUSR2', 'SIGINT', 'SIGTERM'].map(event => process.once(event, this.exit.bind(this)));
  }

  async login() {
    await this.connectMongo();
    await super.login(this.config.token);
  }

  async connectMongo() {
    const connection = await connect(this.config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

    let state = connection.connections[0]._readyState;

    switch (state) {
      case 0:
        this.logger.log("MongoDB", "Client has been disconnected from database");
        break;
      case 1:
        this.logger.log("MongoDB", "Client has been connected to database");
        break;
      case 2:
        this.logger.log("MongoDB", "Client is attempting a connection to database");
        break;
      case 3:
        this.logger.log("MongoDB", "Client has been disconnected from database");
    }
  }
  /*
    async liveDeployers() {
      if (!this.shoukaku.nodes.size) return;
  
      let search = this.db.fetchLiveDeployers();
  
      if(!search || (search && !search.length)) return;
  
      this.interval = setInterval(() => {
        if (this.liveCache.size >= search.length) {
          this.logger.log("24/7 Deployer", "All voice channels on this instances has been connected");
          clearInterval(this.interval);
        }
  
        let datas = search.slice(this.liveCache.size, this.liveCache.size + 20);
  
        for (let data of datas) {
          if(!this.guilds.cache.has(data.id)) return;
          if(!this.channels.cache.has(data.plugins.playerConfig.voiceChannelID)) return;
  
          let { voiceChannelID, textChannelID } = data.plugins.playerConfig;
  
          this.players.spawnPlayer({ guildID: data.id, voiceChannelID, textChannelID }).then(() => {
            if (this.players.has(data.id)) this.liveCache.set(data.id).catch(e => this.logger.error("24/7 Deployer", e));
          });
        };
      }, this.config.timers.playerDeployerInterval);
  
    }
    */

  async liveDeployers() {
    if (!this.shoukaku.nodes.size) return;

    let times = 0;

    let search = await this.db.fetchLiveDeployers();

    if (!search || !search.length) return;

    for (let data of search) {
      if (times > 10) {
        await this.util.delay(5000);
        times = 0;
      }

      if (!this.guilds.cache.has(data.id)) continue;
      if (!this.channels.cache.has(data.plugins.playerConfig.voiceChannelID)) continue;

      let { voiceChannelID, textChannelID } = data.plugins.playerConfig;

      this.players.handleDeploy({ guildID: data.id, voiceChannelID, textChannelID })
        .then(() => {
          if (this.players.has(data.id)) times++;
        })
        .catch(e => this.logger.error(e));
    }
  }

  exit() {
    if (this.quitting) return;
    this.quitting = true;
    this.destroy();
  }

  fetchCommand(cmd) {
    return this.commands.get(cmd.toLowerCase()) || this.commands.get(this.aliases.get(cmd.toLowerCase()));
  }

  async send(channelID, options) {
    let channel = await this.util.fetchChannel(channelID);
    if (!channel) return;
    if (!options) throw new TypeError("Cannot send a empty message");

    let { content, ...embed } = options;

    return await channel.send(content, embed).catch(e => this.logger.log(e));
  };
  
  reloadCommand(args) {
    let cmdName = args[0].toLowerCase();
    
    let cmd = this.fetchCommand(cmdName);
    
    if (!cmd) return false;
    
    delete require.cache[require.resolve(`../commands/${cmd.category}/${this.util.toProperCase(cmd.name)}.js`)];
    
    try {
      const newCommand = require(`../commands/${cmd.category}/${this.util.toProperCase(cmd.name)}.js`);
      const newCmd = new newCommand();
      this.commands.delete(newCmd.name.toLowerCase())
      this.commands.set(newCmd.name.toLowerCase(), newCmd);
      return true;
    } catch(e) {
      this.logger.debug("Command Reload", e);
      return false;
    }
  }
}
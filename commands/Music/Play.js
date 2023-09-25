const Command = require("../../abstract/Command.js");

module.exports = class Play extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      description: "Play a song, or add it to the queue if there's already one playing.",
      category: 'Music',
      aliases: ["p"],
      usage: ["<song-title/link>"],
      example: [
        "Neffex Cold"
      ]
    });
  }
  
  async run(msg, args) {
    let memberVoice = msg.member.voice.channel;

    if (!memberVoice) return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | You must be in a voice channel to use this command!`
      }
    });

    if (!memberVoice.joinable) return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | I don't have permission to connect to ${memberVoice.toString()}`
      }
    });

    if (memberVoice.constructor.name !== "StageChannel" && !memberVoice.speakable) return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | I don't have permission to speak in ${memberVoice.toString()}`
      }
    });

    let dispatcher = this.client.players.get(msg.guild.id);

    let voiceSize = msg.guild.me.voice.channel ?  msg.guild.me.voice.channel.members.filter(m => m.user.bot ? !m.user.bot : m).size : 0;

    if (dispatcher && dispatcher.player && voiceSize && dispatcher.player.voiceConnection.voiceChannelID !== memberVoice.id) return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | You need to be in the same voice channel as me!`
      }
    });
    else if (dispatcher && dispatcher.player && !voiceSize && dispatcher.player.voiceConnection.voiceChannelID !== memberVoice.id) {
      if (dispatcher && dispatcher.player && dispatcher.player.voiceConnection) dispatcher.destroy();
    }

    if (!args.length && dispatcher && dispatcher.player && dispatcher.player.paused) return dispatcher.pause(false);

    if (!args.length && !msg.attachments.size) return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | Provide a query to search!`
      }
    });

    //if (!dispatcher || (dispatcher && !dispatcher.player)) dispatcher = await this.client.players.spawnPlayer();
    
    let playerOptions = {
      guildID: msg.guild.id,
      voiceChannelID: memberVoice.id,
      textChannelID: msg.channel.id
    };
    
    const player = this.client.players;

    if (msg.guild.config.plugins.playerConfig.livePlayer) {
      msg.guild.config.plugins.playerConfig.voiceChannelID = memberVoice.id;
      msg.guild.config.markModified("plugins.playerConfig.voiceChannelID");
      msg.guild.config.save();
    }

    if (dispatcher && !dispatcher.playing && dispatcher.player && dispatcher.player.paused && dispatcher.current) await dispatcher.play();

    if (msg.attachments.size) return player.handle(playerOptions, { msg });
    
    if (args.length && this.client.spotifyHandler.isValidURL(args.join(" "))) {
      let spotifyNode = this.client.spotifyHandler.getNode();

      let search = await spotifyNode.load(args.join(" ")).catch(() => {
        return this.client.send(msg.channel.id, {
          embed: {
            color: this.client.util.color.error,
            description: `${this.client.util.emoji.error} | An error occured while searching tracks`
          }
        });
      });

      switch (search.loadType) {
        case "LOAD_FAILED":
        this.client.send(msg.channel.id, {
          embed: {
            color: this.client.util.color.error,
            title: `${this.client.util.emoji.error} | Search failed!`
          }
        });
        break;
        case "NO_MATCHES":
        this.client.send(msg.channel.id, {
          embed: {
            color: this.client.util.color.error,
            description: `${this.client.util.emoji.error} | No results found!`
          }
        });
        break;
        case "TRACK_LOADED":
        case "SEARCH_RESULT":
        player.handle(playerOptions, { msg, searchData: null, node: null, playlist: false, tracks: search.tracks });
        break;
        case "PLAYLIST_LOADED":
        this.client.send(msg.channel.id, {
          embed: {
            color: this.client.util.color.primary,
            title: `${this.client.util.emoji.success} | Enqueued ${search.playlistInfo.name || "Unknown"}`,
            description: `Total \`${search.tracks.length}\` tracks are queued`
          }
        });
        player.handle(playerOptions, { msg, searchData: null, node: null, playlist: true, tracks: search.tracks, playlistInfo: search.playlist });
        break;
      }
    } else if (args.length) {
      let query;
      
      if (['youtube', 'soundcloud'].includes(args[0] ? args[0].toLowerCase() : null)) query = {
        source: args[0],
        query: args.slice(1).join(" ")
      };

      else if(this.client.util.validateSoundcloud(args.join(" "))) query = {
        source: 'soundcloud',
        query: args.join(" ")
      }
      else query = {
        source: 'youtube',
        query: args.join(" ")
      };

      player.handle(playerOptions, {msg, searchData: query, node: null})
    }
  }
};
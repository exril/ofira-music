const Command = require("../../abstract/Command.js");
const Track = require('../../structures/player/Track');

module.exports = class Search extends Command {
  constructor(client) {
    super(client, {
      name: "search",
      description: "Searches tracks on youtube",
      category: 'Music',
      example: ["Fearless Pt. II"]
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

    let voiceSize = msg.guild.me.voice.channel ? msg.guild.me.voice.channel.members.filter(m => m.user.bot ? !m.user.bot : m).size : 0;

    if (dispatcher && dispatcher.player && voiceSize && dispatcher.player.voiceConnection.voiceChannelID !== memberVoice.id) return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | You need to be in the same voice channel as me!`
      }
    });
    else if (dispatcher && dispatcher.player && !voiceSize && !dispatcher.player.voiceConnection.voiceChannelID !== memberVoice.id) {
      dispatcher.destroy();
    }

    if (!args.length) return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | Provide a query to search!`
      }
    });

    dispatcher = await this.client.players.handle({
      guildID: msg.guild.id,
      voiceChannelID: memberVoice.id,
      textChannelID: msg.channel.id
    });

    dispatcher.setTextChannel(msg.channel.id);

    if (msg.guild.config.plugins.playerConfig.livePlayer) {
      msg.guild.config.plugins.playerConfig.voiceChannelID = memberVoice.id;
      msg.guild.config.markModified("plugins.playerConfig.voiceChannelID");
      msg.guild.config.save();
    }

    let query = args.join(" ");

    let result;
    let cacheLoad = false;

    let node = this.client.shoukaku.getNode();

    if (this.client.shoukaku.searchResults.has(query) && !this.client.shoukaku.searchResults.get(query).playlist) {
      result = this.client.shoukaku.searchResults.get(query);
      cacheLoad = true;
    }

    else result = await node.rest.resolve(query, "youtube").catch(() => {
      return this.client.send(msg.channel.id, {
        embed: {
          color: this.client.util.color.error,
          description: `${this.client.util.emoji.error} An error occured while searching tracks`
        }
      });
    });


    if (!result || !result.tracks || (result.tracks && !result.tracks.length)) return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | No results found!`
      }
    });

    let tracks = result.tracks.slice(0, 9);

    if (result && tracks && tracks.length) {
      if (!cacheLoad) this.client.shoukaku.searchResults.set(query, tracks.shift());

      switch (result.type) {
        case "LOAD_FAILED":
          this.client.send(msg.channel.id, {
            embed: {
              color: this.client.util.color.error,
              title: `${this.client.util.emoji.error} | Search failed!`,
              description: result.exception.message
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
        case "SEARCH":
        case "TRACK":
          let embed = await msg.channel.send({
            embed: {
              color: this.client.util.color.warning,
              title: `${this.client.util.emoji.search} | Track search`,
              description: tracks.map((track, i) => `\`${++i}.\` ${track.info.title}`).join("\n"),
              footer: { text: `Select a track from 1-${tracks.length} | \`c\` to cancel` }
            }
          });

          const filter = m => (msg.author.id === m.author.id) && ((parseInt(m.content) >= 1 && parseInt(m.content) <= tracks.length || m.content.toLowerCase() === 'c'));

          const response = await msg.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] });

          if (!response.size) return this.client.send(msg.channel.id, {
            embed: {
              color: this.client.util.color.error,
              description: `${this.client.util.emoji.error} | Track selection cancelled`
            }
          });

          try {
            const entry = response.first().content.toLowerCase();

            if (entry === "c") {
              this.client.send(msg.channel.id, {
                embed: {
                  color: this.client.util.color.error,
                  description: `${this.client.util.emoji.error} | Track selection cancelled`
                }
              });

              if (response.first().deletable && !response.first().deleted) response.first().delete();
              if (embed.deletable && !embed.deleted) embed.delete();
              if (msg.deletable && !msg.deleted) msg.delete();
            } else if (!isNaN(entry)) {
              if (dispatcher.current) this.client.send(msg.channel.id, {
                embed: {
                  color: this.client.util.color.primary,
                  description: `${this.client.util.emoji.success} | Enqueued ${tracks[entry - 1].info.title}`
                }
              });

              dispatcher.queue.push(new Track(tracks[entry - 1], msg.author));

              if (!dispatcher.playing && !dispatcher.player.paused && dispatcher.queue.length) await dispatcher.play();

              if (response.first().deletable && !response.first().deleted) response.first().delete();
              if (msg.deletable && !msg.deleted) msg.delete();
              if (embed.deletable && !embed.deleted) embed.delete();
            }
          } catch (e) {
            this.client.logger.error(e);

            if (!dispatcher.current) dispatcher.destroy();

            if (response.first().deletable && !response.first().deleted) response.first().delete();
            if (msg.deletable && !msg.deleted) msg.delete();
            if (embed.deletable && !embed.deleted) embed.delete();
          }
          break;
      }
    }
  }
}
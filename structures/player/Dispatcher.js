const Queue = require('./Queue');
const Track = require('./Track');
const { WebhookClient } = require('discord.js');
const nodeStatus = new WebhookClient("857942764032360498", "lOXfraY-TKQ0wpqnJn1IJ4kUyX47gElviJ1nM3YrsmZslcD8-4kZK9iQu9F_jPHvU1-I");

const Filter = require('./Filter');

module.exports = class OfiraDispatcher {
  constructor(client, { guildID, textChannelID, voiceChannelID, node, player, guildData, livePlayer }) {
    this.client = client;
    this.guildID = guildID;
    this.textChannelID = textChannelID;
    this.voiceChannelID = voiceChannelID;
    this.node = node;
    this.player = player;
    this.guildData = guildData;
    this.queue = new Queue(this);
    this.current = this.queue.current;
    this.previous = [];
    this.skips = new Set();
    this.trackRepeat = false;
    this.queueRepeat = false;
    this.queueEnded = false;
    this.playing = false;
    this.currentPosition = 0;
    this.triggeredClosed = false;
    this.autoPlay = false;

    this.filter = new Filter(this.player);
    
		this.livePlayer = livePlayer;
    this.checkTime = Date.now() + 60000 * 3;

    if (this.player) this.firePlayerEvents();
  }

  get exists() {
    return this.client.players.has(this.guildID);
  }

  get isPlaying() {
		return this.exists && this.playing;
	}

  get isQueueEmpty() {
    return !this.queue.length && !this.current && !this.trackRepeat && !this.queueRepeat;
  }

  checkCache() {
   let check = this.client.shoukaku.getNode([...this.client.shoukaku.nodes.values()].filter(n => n.players.has(this.guildID)));
   if (check) check.players.get(this.guildID).disconnect();
  }

  setTextChannel(channel) {
    this.textChannelID = channel;
  }

  setPlayer(player) {
    this.player = player;
  }

  voteSkip(userID) {
		this.skips.add(userID);
		return this.skips.size;
	}

  setTrackRepeat(value) {
		if (typeof value !== "boolean") throw new RangeError(`Player#setTrackRepeat(), Value must be true or false`);

		if(value) {
			this.trackRepeat = true;
			this.queueRepeat = false;
		} else {
			this.trackRepeat = false;
			this.queueRepeat = false;
		}
	}

	setQueueRepeat(value) {
		if (typeof value !== "boolean") throw new RangeError(`Player#setQueueRepeat(), Value must be true or false`);

		if (value) {
			this.trackRepeat = false;
			this.queueRepeat = true;
		} else {
			this.trackRepeat = false;
			this.queueRepeat = false;
		}
	}

  storePosition(reason) {
    if (reason) return this.currentPosition;
    this.interval = setInterval(() => {
      if (this.player && this.current) this.currentPosition = this.player.position;
    }, 5000);
  }

  stop() {
    if (!this.exists) this.destroy();

    //this.current = null;
    this.skips.clear();
    this.player.stopTrack();
  }

  async pause(value = true) {
		await this.player.setPaused(value);
		return true;
	}

  async startAutoPlay() {
    if (!this.previous.length) return;

    let baseTrack;

    if (this.previous.length > 0) baseTrack = this.previous.shift(); 
    else if (this.previous.length > 1) baseTrack = this.previous.pop();

    if (!baseTrack) return;

    if (!baseTrack.info.uri.match(this.client.config.regex.youtube)) return;

    let searchURI = `https://www.youtube.com/watch?v=${baseTrack.info.identifier}&list=RD${baseTrack.info.identifier}`;

    let search = await this.node.rest.resolve(searchURI).catch(e => this.client.logger.debug("Autoplay", e));

    if (!search) return;

    if (["LOAD_FAILED", "NO_MATCHES"].includes(search.type)) return;

    if (!search.tracks.length) return;

    let tracks = search.tracks.slice(1, 5);

    for (let track of tracks) this.queue.push(new Track(track, this.client.user, true));

    if (!this.playing && !this.player.paused && this.queue.length) this.play();    
  }

  async play() {
    if(!this.exists) return this.destroy();
    
    if(this.queueEnded) {
			this.queue.shift();
			this.queueEnded = false;
		}

		const track = this.previous[this.previous.length - 1];

		if(this.trackRepeat && track) {
			this.current = track;

			await this.player.playTrack(this.current.track, { noReplace: false });
			this.playing = true;
		} else if(this.queueRepeat && (this.queue.length || track)) {
			if(track) this.queue.push(track);

			this.current = this.queue.shift();

			await this.player.playTrack(this.current.track, { noReplace: false });
			this.playing = true;
		} else if(this.queue.length) {
			this.current = this.queue.shift();

			await this.player.playTrack(this.current.track, { noReplace: false });
			this.playing = true;
		} else {
			if(this.current) {
				this.queue.unshift(this.current);
				this.current = null;
				this.queueEnded = true;
			}
	
			if(this.live) return this;

			this.destroy();
		}
  }

  async destroy(reason) {
    if(!this.exists) return;

    if (reason === "EMPTY_QUEUE") {
      await this.client.util.delay(this.client.config.timers.checkQueueDelay);

      if(!this.isQueueEmpty) return;

      clearInterval(this.interval);

      this.client.send(this.textChannelID, {
        embed: {
          description: "My Playlist Is Empty.",
          color: this.client.util.color.primary
        }
      });
      if (this.livePlayer) return;
      return this.destroy();
    } else if (reason === "COMPLETE" || !reason) {
      this.queue.clear();
      if (this.player) this.player.disconnect();
      this.checkCache();
      this.client.players.delete(this.guildID);
    }
  }

  firePlayerEvents() {
    if (!this.player) return;
    
    /* Fires when a track starts playing */
    this.player.on("start", async () => {
      if (this.trackRepeat || this.queueRepeat) return;
      if (!this.current || (this.current && !this.current.info)) return;
      if (this.current.info.playlist) return;

      if (this.current) this.storePosition();

      this.client.send(this.textChannelID, {
          embed: {
              color: this.client.util.color.primary,
              author: { 
                  name: " | Now Playing",
                  icon_url: this.client.util.assets.clientPicture
              },
              thumbnail: { 
                  url: `https://i.ytimg.com/vi/${this.current.info.identifier}/default.jpg`
              },
              description: this.current.info.title
          }
      }).catch(e => this.logger.error(e));
            
      if (Date.now() > this.checkTime) {
        this.checkTime = 7.2e+6;
        let channel = this.client.channels.cache.get(this.textChannelID);

        let m = await channel.send({
          embed: {
            color: this.client.util.color.primary,
            description: `Enjoying using Ofira, give us a vote on top.gg, [Click here](https://top.gg/bot/818570692847992902/vote) to vote`
          }
        });
        
        await this.client.util.delay(20000);
        
        m.delete();
      }
    });

    /* Fires when a track ends */
    this.player.on("end", () => {
      if (this.triggeredClosed) return;
      this.previous.push(this.current);
      this.current = null;
      this.skips.clear();
      this.playing = false;

      if (!this.current && !this.queue.length &&  this.autoPlay) this.startAutoPlay();  

      if (this.isQueueEmpty) return this.destroy("EMPTY_QUEUE");

      this.play()
        .catch(e => {
          this.client.logger.error(e);
          this.destroy();
        });
    });

    this.player.on("trackException", e => {
      if (!this.current.info.playlist) this.client.send({
        embed: {
          color: this.client.util.color.error,
          description: `This track cannot be played: ${e.error}`
        }
      });
      
      this.client.logger.debug(`TrackException`, e);
        if (e.error === "This IP address has been blocked by YouTube (429).") {
        if (nodeStatus) nodeStatus.send(`${this.node.name}, has been blocked by YouTube for 1 week`);
        this.client.shoukaku.removeNode(this.node.name, "This node has been banned");
    } 
    });

    this.player.on("closed", async payload => {
      if (payload.code === 4014) return this.destroy();

      this.triggeredClosed = true;

      let position = this.storePosition("GET");

      await this.client.util.delay(2000);

      if (this.player && ["DISCONNECTED", "DISCONNECTING"].includes(this.player.voiceConnection.state)) {
        let reconnectedPlayer = await this.player.voiceConnection.attemptReconnect({
          voiceChannelID: this.voiceChannelID,
          forceReconnect: true
        }).catch(e => {
          if (!["The voice connection is not established in 15 seconds", "This player is not yet connected, please wait for it to connect"].includes(e.message)) {
          this.client.logger.error(e);
          this.destroy();
          }
        });

        if(reconnectedPlayer) {
          reconnectedPlayer.resume();
          if (!this.player) this.player = reconnectedPlayer;
          await this.client.util.delay(3000);
          if (this.player) this.player.seekTo(position);
          this.triggeredClosed = false;
        }
      }
    });
    this.player.on("error", e => {
      this.client.logger.error(e);
      this.destroy();
    });

   /* for (const playerEvent of ["closed", "error", "nodeDisconnect"]) {
      this.player.on(playerEvent, async data => {
        if(playerEvent === "closed" && this.player && ["DISCONNECTED", "DISCONNECTING"].includes(this.player.voiceConnection.state)) {
          if (this.player.voiceConnection.state === "DISCONNECTED") {
            let reconnectedPlayer = await this.player.voiceConnection.attemptReconnect({
              voiceChannelID: this.voiceChannelID
            }).catch(e => {
              if (["The voice connection is not established in 15 seconds", "This player is not yet connected, please wait for it to connect"].includes(e.message)) {
                this.client.logger.error(e);
                this.destroy();
              }
            });

            if(reconnectedPlayer) {
              reconnectedPlayer.resume();
              if (!this.player) this.player = reconnectedPlayer;
            }
          }
        } else {
          if (data instanceof Error || data instanceof Object) this.client.logger.error(data);
          this.destroy();
        }
      });
   }*/

  }

  async loadTracks(trackData) {

    if (!this.player) this.destroy();

    if (!this.client.shoukaku.nodes.size) return;

    let { msg, searchData, node, playlist, tracks: spotifyTracks } = trackData;

    node = node || this.client.shoukaku.getNode();

    let results = this.client.shoukaku.searchResults;
    let cacheLoad = false;

    let result = null;

    if (msg.attachments.size) {
      let result = await node.rest.resolve(msg.attachments.first().proxyURL, null);

      switch(result.type) {
        case 'TRACK':  
        case 'SEARCH':   
        if (this.current) this.client.send(this.textChannelID, {
          embed: {
            color: this.client.util.color.primary,
            description: `${this.client.util.emoji.success} Enqueued | ${result.tracks.shift().info.title}`
          }
        });
        this.queue.push(new Track(result.tracks.shift(), msg.author));

        if (!this.playing && !this.player.paused && this.queue.length) await this.play();
        return;
      }
    }

    if (!searchData && playlist && spotifyTracks.length) {
      for (let track of spotifyTracks) this.queue.push(new Track(track, msg.author, true));
    
      if (!this.playing && !this.player.paused && this.queue.length) this.play();
      return;
    }

    if (!searchData && !playlist && spotifyTracks.length) {
      
       this.queue.push(new Track(spotifyTracks[0], msg.author));

       if (this.current) this.client.send(this.textChannelID, {
         embed: {
           color: this.client.util.color.primary,
           description: `${this.client.util.emoji.success} | Enqueued ${spotifyTracks[0].info.title}`
         }
       });
       
       if (!this.playing && !this.player.paused && this.queue.length) this.play();
       return;
    }

    if (typeof searchData === "string") searchData = {
      query: searchData,
      source: "youtube"
    };

    if (!searchData || (searchData && !searchData.query)) return this.client.send(this.textChannelID, {
      embed: {
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | Provide a query to search!`
      }
    });

    if (this.client.util.validateURL(searchData.query)) searchData = {
      query: searchData.query,
      source: null
    };

    if (searchData.source === "youtube" && results.has(searchData.query.toLowerCase()) && !results.get(searchData.query.toLowerCase()).playlist) {
       result = results.get(searchData.query.toLowerCase());
       cacheLoad = true;
    } else result = await node.rest.resolve(searchData.query, searchData.source ? searchData.source : null).catch(() => {
      return this.client.send(this.textChannelID, {
        embed: {
          color: this.client.util.color.error,
          description: `${this.client.util.emoji.error} | An error occured while searching!`
        }
      });
    });
    
    if (!result) return this.client.send(this.textChannelID, {
      embed: {
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | No results found!`
      }
    });
    
    if (result && result.tracks && result.tracks.length) {
      if (!cacheLoad && result.type === "SEARCH" && searchData.source === "youtube") results.set(searchData.query.toLowerCase(), result);

      let { type, tracks, playlistName } = result;
      
      switch (type) {
        case "LOAD_FAILED":
        this.client.send(this.textChannelID, {
          embed: {
            color: this.client.util.color.error,
            title: `${this.client.util.emoji.error} | Search failed!`,
            description: result.exception.message
          }
        });
        break;
        case "NO_MATCHES":
        this.client.send(this.textChannelID, {
          embed: {
            color: this.client.util.color.error,
            description: `${this.client.util.emoji.error} | No results found!`
          }
        });
        break;
        case "PLAYLIST":
        for (let track of tracks) this.queue.push(new Track(track, msg.author, true));
        this.client.send(this.textChannelID, {
          embed: {
            color: this.client.util.color.primary,
            title: `${this.client.util.emoji.success} | Enqueued ${playlistName}`,
            description: `Total \`${tracks.length}\` are enqueued`
          }
        });

        if (!this.playing && !this.player.paused && this.queue.length) await this.play();
        break;
        case "SEARCH":
        case "TRACK":
        this.queue.push(new Track(result.tracks[0], msg.author));
        if (this.current) this.client.send(this.textChannelID, {
          embed: {
            color: this.client.util.color.primary,
            description: `${this.client.util.emoji.success} | Enqueued ${tracks[0].info.title}`
          }
        });
        if (!this.playing && !this.player.paused && this.queue.length) await this.play();
        break;
      }
      if (!this.playing && !this.player.paused && this.queue.length) await this.play();
    }
  };
};

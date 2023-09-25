const Command = require("../../abstract/Command.js");

module.exports = class Join extends Command {
  constructor(client) {
    super(client, {
      name: "join",
      description: "Summons bot to your voice channel",
      category: 'Music',
      aliases: ["summon", "j"],
      votelocm: true,
    });
  }
  
  async run(msg) {
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

    player.handle(playerOptions);

    return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.primary,
        description: `${this.client.util.emoji.success} | Connected to ${memberVoice.toString()}`
      }
    });
  }
};
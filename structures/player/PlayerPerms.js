const { MessageEmbed, Message } = require("discord.js");

const replies = {
  no_member_vc: "You need to be in a voice channel for this command!",
  no_player: "No queue found for this server!",
  different_member_vc: "You're not in the same voice channel as me!",
  not_joinable: "I don't have permission to connect to that voice channel!",
  not_speakable: "I don't have permission to speak in that voice channel!",
};

module.exports = class PlayerPerms {
  constructor() {
    this.tests = {
      DEAD_DISAPTCHER: (msg) => {
        let dispatcher = msg.client.players.get(msg.guild.id);
        if(dispatcher && !dispatcher.player) dispatcher.destroy();
      },
      MEMBER_VC: (message) => !!message.member.voice.channel,
      PLAYING: (message) => message.client.players.has(message.guild.id),
      PLAYING_CURRENT: (message) => !!message.client.players.get(message.guild.id).current,
      PLAYING_QUEUE: (message) => !!message.client.players.get(message.guild.id).queue.length,
      SAME_VC: (message) => {
        const dispatcher = message.client.players.get(message.guild.id);


        if (dispatcher) {
          const clientVC = dispatcher.player.voiceConnection.voiceChannelID;
          const memberVC = message.member.voice.channel.id;

          return memberVC == clientVC;
        } else return false;
      },
      JOINABLE: (message) => message.member.voice.channel.joinable,
      SPEAKABLE: (message) => message.member.voice.channel.speakable,
      CHECK_STATUS: (message) => {

      },
    };
  }

  canJoin(message) {
    if (!this.tests.MEMBER_VC(message)) {
      this.errorEmbed(message, "no_member_vc");
      return false;
    }

    if(!this.tests.JOINABLE(message)) {
      this.errorEmbed(message, "not_joinable");
      return false;
    }

    if(!this.tests.SPEAKABLE(message)) {
      this.errorEmbed(message, "not_speakable");
      return false;
    }

    this.tests.DEAD_DISAPTCHER(message);

    if (this.tests.PLAYING(message) && this.tests.SAME_VC(message)) {
      return true;
    } else if (!this.tests.PLAYING(message)) {
      return true;
    }

    if (this.tests.PLAYING(message) && !this.tests.SAME_VC(message)) {
      this.errorEmbed(message, "different_member_vc");
      return false;
    }
  }

  canStartOrPlay(message) {
    if (!this.tests.MEMBER_VC(message)) {
      this.errorEmbed(message, "no_member_vc");
      return false;
    }

    if(!this.tests.JOINABLE(message)) {
      this.errorEmbed(message, "not_joinable");
      return false;
    }

    if(!this.tests.SPEAKABLE(message)) {
      this.errorEmbed(message, "not_speakable");
      return false;
    }

    this.tests.DEAD_DISAPTCHER(message);

    if (this.tests.PLAYING(message) && this.tests.SAME_VC(message)) {
      return true;
    } else if (!this.tests.PLAYING(message)) {
      return true;
    }

    if (this.tests.PLAYING(message) && !this.tests.SAME_VC(message)) {
      this.errorEmbed(message, "different_member_vc");
      return false;
    }
  }

  canStop(message) {
    if (!this.tests.MEMBER_VC(message)) {
      this.errorEmbed(message, "no_member_vc");
      return false;
    }

    this.tests.DEAD_DISAPTCHER(message);

    if (!this.tests.PLAYING(message)) {
      this.errorEmbed(message, "no_player");
      return false;
    }

    if (!this.tests.SAME_VC(message)) {
      this.errorEmbed(message, "different_member_vc");
      return false;
    }

    return true;
  }

  canStopCurrent(message) {
    if (!this.tests.MEMBER_VC(message)) {
      this.errorEmbed(message, "no_member_vc");
      return false;
    }

    this.tests.DEAD_DISAPTCHER(message);

    if (!this.tests.PLAYING(message)) {
      this.errorEmbed(message, "no_player");
      return false;
    }

    if (!this.tests.PLAYING_CURRENT(message)) {
      this.errorEmbed(message, "no_player");
      return false;
    }

    if (!this.tests.SAME_VC(message)) {
      this.errorEmbed(message, "different_member_vc");
      return false;
    }

    return true;
  }

  canStopQueue(message) {
    if (!this.tests.MEMBER_VC(message)) {
      this.errorEmbed(message, "no_member_vc");
      return false;
    }

    this.tests.DEAD_DISAPTCHER(message);

    if (!this.tests.PLAYING(message)) {
      this.errorEmbed(message, "no_player");
      return false;
    }

    if (!this.tests.PLAYING_QUEUE(message)) {
      this.errorEmbed(message, "no_player");
      return false;
    }

    if (!this.tests.SAME_VC(message)) {
      this.errorEmbed(message, "different_member_vc");
      return false;
    }

    return true;
  }
  

  /**
   * Check if there's a queue playing
   * @param {Message} message
   */
  isPlaying(message) {
    this.tests.DEAD_DISAPTCHER(message);
    
    if (!this.tests.PLAYING(message)) {
      this.errorEmbed(message, "no_player");
      return false;
    }

    return true;
  }

  /**
   * Send an embed for an error
   * @param {Message} message the message object
   * @param {string} type The error type
   */
  errorEmbed(msg, type) {
    const embed = new MessageEmbed().setColor(msg.client.util.color.error);

    if (replies[type]) {
      embed.setDescription(`${msg.client.util.emoji.error} | ${replies[type]}`);
  //    embed.setAuthor(msg.author.tag, msg.author.avatarURL({ dynamic: true }))
    } else {
      embed.setDescription(
        "You're not allowed to use this command for some reason..."
      );
    }

    return msg.client.send(msg.channel.id, { embed: embed.toJSON() });
  }
}
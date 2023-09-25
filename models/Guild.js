const { model, Schema } = require('mongoose');
const { prefix } = require('../config');

const guildSchema = new Schema({
  id: { type: String, default: null, unique:true },
  prefix: { type: String, default: prefix },
  premium: { type: Object, default: {
    type: 0,
    expiresAt: 0,
  }},
  plugins: { type: Object, default: {
    dj: {
      enabled: false,
      djRoles: [],
      djUsers: [],
      djCommands: [],
    },
    playerConfig: {
      livePlayer: false,
      textChannelID: null,
      voiceChannelID: null,
      defaultVolume: 50,
      nowPlayingMessage: true,
      duplicateTracks: true,
    }
  }}
});

module.exports = model('guilds', guildSchema);
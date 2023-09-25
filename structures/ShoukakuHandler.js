const { Shoukaku } = require('shoukaku');
const { shoukakuNodes } = require('../lavalinkConf.js');
const { Collection } = require('discord.js');

const options = {
  moveOnDisconnect: true, resumable: 'resumableTune',
  resumableTimeout: 20, reconnectTries: 2,
  restTimeout: 25000, userAgent: 'Ofira Client'
};

module.exports = class ShoukakuHandler extends Shoukaku {
  constructor(client) {
    super(client, shoukakuNodes, options);

    this.searchResults = new Collection();

    this.on('ready', (name, resumed) => client.logger.log(`Node: ${name} is now connected`, `This connection is ${resumed ? 'resumed' : 'a new connection'}`));

    this.on('error', (name, error) => client.logger.error(`Node: ${name} ${error ? `\n${error}` : ""}`));

    this.on('close', (name, code, reason) => client.logger.log(`Node: ${name} closed with code ${code}`, reason || 'No reason'));

    this.on('disconnected', (name, reason) => client.logger.log(`Node: ${name} disconnected`, reason || 'No reason'));
  }
}

const BaseEvent = require('../abstract/Event.js');
const path = require('path');
const fs = require('fs').promises;

module.exports = class EventHandler {
  constructor(client) {
    this.client = client;
    this.client.on("shardReconnecting", (id) => this.client.logger.debug(`[Shard] [${id}]`, 'Shard Reconnecting'));
    this.client.on("shardResumed", (id, rep) => this.client.logger.debug(`[Shard] [${id}]`, `Shard Resume | ${rep} events replayed`));
    this.client.on("shardReady", (id) => this.client.logger.debug(`[Shard] [${id}]`, 'Shard Ready'));
    this.client.on("shardDisconnected", (event, id) => this.client.logger.debug(`[Shard] [${id}]`, `Shard disconnected`));
    this.client.on("shardError", (error, id) => this.client.logger.error(`Shard [${id}]`, `Error:\n${error}`));
  }
  
  async build(dir) {
    const filePath = path.join(__dirname, dir);
    const files = await fs.readdir(filePath);
    for (const file of files) {
      const stat = await fs.lstat(path.join(filePath, file));
      if (stat.isDirectory()) this.build(path.join(dir, file));
      if (file.endsWith('.js')) {
        const Event = require(path.join(filePath, file));
        if (Event.prototype instanceof BaseEvent) {
          const event = new Event(this.client);
          this.client.events.set(event.name, event);
          event.once ? this.client.once(event.name, event.run.bind(event)) : this.client.on(event.name, event.run.bind(event));
        }
      }
    }
  }
};
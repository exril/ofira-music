const AbstractEvent = require('../../abstract/Event');
const Topgg = require('@top-gg/sdk')

module.exports = class ReadyEvent extends AbstractEvent {
  constructor(client) {
    super(client, { name: 'ready', once: true });
  }
  async run() {
    this.client.logger.debug(`${this.client.user.username}`, `Ready with ${this.client.guilds.cache.size} servers!`);

    if (this.client.spotifyHandler) await this.client.spotifyHandler.requestToken();

   /* setInterval(() => {
      const activityType = [
        { name: `@Ofira`, type: "LISTENING" },
        { name: `${this.client.config.prefix}help`, type: "WATCHING" },
      ]

      this.client.user.setPresence({ activity: this.client.util.shuffle(activityType).shift() })
    }, 64 * 1000);*/
    
    const api = new Topgg.Api(this.client.config.dbl)
    this.client.dbl = api;

      this.client.setInterval(async () => {
      const guilds = await this.client.shard.fetchClientValues(`guilds.cache.size`);

    /*  this.client.snek({
        method: "post",
        url: `https://botsfordiscord.com/api/bot/${this.client.user.id}`,
        headers: { Authorization: this.client.config.BFD },
        data: {
          server_count: guilds.reduce((a, b) => a + b, 0)
        }
      }); */

      api.postStats({
        serverCount: guilds,
        shardCount: this.client.shard.shardCount,
        shardId: this.client.shard.id
      });
    }, 1800000);

    await this.client.util.delay(12000);

    this.client.liveDeployers();

    this.client.sweeper.setup();

    //to redeploy the players which has been disconnected either by discord or abnormal closure
    this.client.setInterval(() => this.client.liveDeployers(), 30000);
  }
}
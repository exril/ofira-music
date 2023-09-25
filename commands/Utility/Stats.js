const Command = require("../../abstract/Command.js");

const { MessageEmbed } = require('discord.js');

const { utc } = require('moment');

module.exports = class Stats extends Command {

  constructor(client) {

    super(client, {

      name: "stats",

      description: "Shows statistics of the bot",

      category: 'Utility',

      aliases: ["botinfo"],

    });

  }

  async run(msg) {

    /* let owners = this.client.config.ownersID.map(async (ownerID) => {

     this.client.users.fetch(ownerID).then(u => console.log(u))

     }).join(", ");

 */

    let owners = [];

    for (let owner of this.client.config.owners) owners.push(await this.client.users.fetch(owner.id, true, false));

    let ownerI = this.client.users.cache.has(this.client.config.owners[0].id) ? this.client.users.cache.get(this.client.config.owners[0].id).tag : ' Unknown#0000';

    let ownerII = this.client.users.cache.has(this.client.config.owners[1].id) ? this.client.users.cache.get(this.client.config.owners[1].id).tag : 'Unknown#0000';
/*
    let ownerIII = this.client.users.cache.has(this.client.config.owners[2].id) ? this.client.users.cache.get(this.client.config.owners[2].id).tag : 'Unknown#0000';
*/
    let [streams, activeStreams, heapUsed, heapTotal] = [0, 0, 0, 0, 0];

    

    const results = await this.client.shard.broadcastEval(`[ this.players.size, this.players.getPlayers(true).size, process.memoryUsage().heapUsed, process.memoryUsage().heapTotal]`);

    const guilds = await this.client.shard.fetchClientValues("guilds.cache.size");

    const users = await this.client.shard.fetchClientValues("users.cache.size");

      let totalUsers = users.reduce((prev, val) => prev + val)

    for (const result of results) {

      streams += result[0];

      activeStreams += result[1];

      heapUsed += result[2];

      heapTotal += result[3];

    }

    return this.client.send(msg.channel.id, {

      embed: {

        thumbnail: { url: this.client.user.displayAvatarURL({ size: 4096 }) },

        color: this.client.util.color.primary,

        description: `\`\`\`fix

› Version: 3.0.8
› Owners: ${ownerI}, ${ownerII}
› Guilds: ${guilds.reduce((acc, cur) => acc + cur).toLocaleString()}
› Shard: ${msg.guild.shardID + 1}/${this.client.shard.shardCount}
› Clusters: ${this.client.shard.clusterCount}
› Creation Date: ${utc(this.client.user.createdAt).format('LL')} (${utc(this.client.user.createdAt, "YYYYMMDD").fromNow()})
› Total Streams: ${streams.toLocaleString()}
› Active Streams: ${activeStreams.toLocaleString()}
› Uptime: ${this.client.util.formatSeconds(process.uptime())}
› Memory Usage: ${this.client.util.formatBytes(heapUsed)}/${this.client.util.formatBytes(heapTotal)}

\`\`\``

      }

    });

  };

};
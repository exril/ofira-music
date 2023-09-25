const { Structures } = require("discord.js");

module.exports = Structures.extend("Guild", (Guild) => class TuneGuild extends Guild {
 /* get prefix() {
    return this.settings().prefix;
  }

*/
  async settings() {
   return await this.client.db.fetchGuild(this.id);
  }

 /* get blacklisted() {
    return this.client.db.guildBlacklist.includes(this.id);
  }
*/
  async syncSettings() {
    return await this.client.db.fetchGuild(this.id);
  }
});
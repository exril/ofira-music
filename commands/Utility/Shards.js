const Command = require("../../abstract/Command.js");
const { MessageEmbed } = require('discord.js');

module.exports = class Shards extends Command {
  constructor(client) {
    super(client, {
      name: "shards",
      description: "Show's the bot's shard information.",
      category: 'Utility',
      aliases: ["shardinfo", "shard"],
    });
  }

  async run(msg) {
      let values = await this.client.shard.broadcastEval(`
    [
        this.shard.id,
        this.guilds.cache.size
    ]
`);
let finalString = "• Shard Information •\n\n";
values.forEach((value) => {
    finalString += "› SHARD ID #"+value[0]+" | > GUILDS: "+value[1]+"\n";
});
      this.client.send(msg.channel.id, {embed: {
      color: this.client.util.color.primary,
      description: `\`\`\`fix
${finalString}
\`\`\``
    }});
  };
};

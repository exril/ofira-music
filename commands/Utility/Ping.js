const Command = require("../../abstract/Command.js");

module.exports = class Ping extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "Displays all the latenices",
      category: 'Utility',
      aliases: ["pong", "latency"],
    });
  }
  
  async run(msg) {
    this.client.send(msg.channel.id, {embed: {
      color: this.client.util.color.primary,
      description: `\`\`\`fix
REST Latency: ${Date.now() - msg.guild.restTimestamp}ms
Gateway Latency: ${Math.round(msg.guild.shard.ping)}ms
\`\`\``
    }});    
  }
};
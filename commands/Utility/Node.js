const Command = require("../../abstract/Command.js");
const { MessageEmbed } = require('discord.js');

module.exports = class Node extends Command {
  constructor(client) {
    super(client, {
      name: "node",
      description: "Gives you information about all the nodes",
      category: 'Utility',
      aliases: ["nodeinfo"],
    });
  }
  
  async run(msg) {
    const nodes = [...this.client.shoukaku.nodes.values()];
        
    let string = "";
    
    nodes.map(n => string += `${this.client.util.codeBlock(this.getData(n), "fix")}\n`);
    const embed = new MessageEmbed()
      .setDescription(string)
      .setColor(this.client.util.color.primary)
    return msg.channel.send(embed)
    //return msg.channel.send(this.client.util.codeBlock(nodes.map(n => this.getData(n)), "fix"));
    
    //return msg.channel.send(nodes.map(n => this.client.util.codeBlock(this.getData(n), "fix")));
        
    //return msg.channel.send(nodes.map(n => `\`\`\`fix\n${this.getData(n)}\`\`\`\``));
  }
  
  getData(node) {
    //console.log(node.stats)
    return (
    `ID: ${node.name}\n`+
    `State: ${node.state ? "CONNECTED" : node.state.toUpperCase()}\n`+
    `${node.state === "CONNECTED" ?(
      `Latency: ${(node.pings.reduce((a, c) => a + c, 0) / node.pings.length).toFixed(0)}ms\n`+
      `Streams: ${node.stats.playingPlayers}/${node.stats.players}\n`+
      `Memory: ${this.client.util.formatBytes(node.stats.memory.used)}/${this.client.util.formatBytes(node.stats.memory.reservable)}\n`+
      `${node.stats.frameStats ? `Frames:\n\u200B\u200BSent: ${node.stats.frameStats.sent}\n\u200B\u200BDeficit: ${node.stats.frameStats.deficit}\n\u200B\u200BNulled: ${node.stats.frameStats.nulled}` : ""}`
    ) : ""}`
    )
  }
};
const Command = require("../../abstract/Command.js");

const { MessageEmbed } = require('discord.js');

module.exports = class Reload extends Command {
  constructor(client) {
    super(client, {
      name: "reload",
      description: "A simple command that help the Owner to reload the commands",
      category: 'Owner',
      aliases: ["rel"],
      ownerOnly: true,
    });
  }

  async run(msg, args) {
    if (!args.length) return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | Provide a command to reload.`
      }
    });
    
    let state;
    
    if (args.length && !args[1]) state = this.client.reloadCommand(args);
    else if (args[1] && args[1] === "sync") state = await this.client.shard.broadcastEval(`this.reloadCommand("${args}"")`);
    
    
    if (state) return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.success,
        description: `\`${args[0]}\` was reloaded`
      }
    })
	}
};


const Command = require("../../abstract/Command.js");

module.exports = class Prefix extends Command {
  constructor(client) {
    super(client, {
      name: "prefix",
      description: "Assigns a new prefix for this server",
      category: 'Configuration',
      aliases: ["setprefix"],
      usage: ["<prefix>"],
      example: ["+"],
      userPerms: ["ADMINISTRATION"]
    });
  }
  
  async run(msg, [prefix]) {
    if (!prefix) return this.argsMissing(msg);

    if (prefix.length > 4) return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.error,
        description: `${this.client.util.emoji.error} | Prefix must not be longer than \`4\` characters`
      }
    });

    msg.guild.config.prefix = prefix;
    msg.guild.config.save();

    return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.success,
        description: `${this.client.util.emoji.success} | Prefix has been changed to \`${prefix}\``
      }
    });
  }
};

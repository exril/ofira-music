const Command = require("../../abstract/Command.js");
const { MessageEmbed } = require('discord.js');

module.exports = class Help extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      description: "Shows all the commands available",
      usage: ["[command]"],
      category: 'Utility',
      aliases: ["help", "h"],
    });
  }
  
  async run(msg, args) {
    if (args.length) {
      let cmd = this.client.fetchCommand(args[0]);

      if (!cmd) return this.client.send(msg.channel.id, {embed: {
        color: this.client.util.color.error,
        description: `No command found with name or alias \`${args[0]}\``,
        footer: { text: msg.author.tag, icon_url: msg.author.displayAvatarURL({ dynamic: true, size: 4096 }) }
      }});

      let embed = new MessageEmbed()
      .setColor(this.client.util.color.primary)
      .setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true, size: 4096 }))
      .setFooter(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setDescription(`> Name: ${this.client.util.toProperCase(cmd.name)}\n> Description: ${cmd.description}\n> Category: ${cmd.category}`);
      if (cmd.aliases.length > 0) embed.addField(`Alias`, cmd.aliases.map(a => `\`${msg.guild.prefix}${a}\``).join(', '));
      if (cmd.usage.length > 0) embed.addField('Usage(s)', cmd.usage.map(u => `\`${msg.guild.prefix}${cmd.name} ${u}\``).join('\n'));
      if (cmd.example.length > 0) embed.addField('Example(s)', cmd.example.map(e => `\`${msg.guild.prefix}${cmd.name} ${e}\``).join('\n'));

      return this.client.send(msg.channel.id, { embed: embed.toJSON() });
    }
    
    let categories = this.client.commands.map(c => c.category).filter((item, pos, self) => {
      return self.indexOf(item) == pos;
    });
      
    let embed = new MessageEmbed()
    .setAuthor(`${this.client.user.username} - Commands List`, this.client.util.assets.clientPicture)
    .setThumbnail(this.client.user.displayAvatarURL({ size: 4096 }))
    .setDescription(`You Can Use ${msg.guild.prefix}help <command-name> For More Informations.`)
    .setColor(this.client.util.color.primary);
      
    for (const category of categories) embed.addField(`• ${category} [${this.client.commands.filter(c => c.category === category).size}]`, this.client.commands.filter(c => c.category === category).map(c => `\`${c.name}\``).join(', '));
    embed.addField(`• Links [3]`, `[Invite Me](${this.client.config.inviteURL(this.client.user.id)}) | [Support Server](${this.client.config.supportServer('ndYpyzAU2Z')}) | [Patreon](https://patreon.com/ofira)`);
    return this.client.send(msg.channel.id, { embed: embed.toJSON() });
  }
};
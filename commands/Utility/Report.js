const Command = require("../../abstract/Command.js");
const Discord = require ('discord.js');

module.exports = class Report extends Command {
  constructor(client) {
    super(client, {
      name: "report",
      description: "Report a bug to developer.",
      category: 'Utility',
      aliases: ["bug", "bug-report"],
    });
  }
  
  async run(msg, args) {
      const Channel = this.client.channels.cache.get('889482343780339752');

        if(!args[0])
        return msg.reply(`${this.client.util.emoji.error} | Please provide a report so that we can look through !! **\`${msg.guild.prefix}report [Your report]\`**`)

        let report = msg.content.slice(msg.content.indexOf(args[0]), msg.content.length);

        const Embed = new Discord.MessageEmbed()
        .setTitle('__Report__')
        .setThumbnail(msg.author.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setDescription(report)
        .addField('User', `\`${msg.member.user.tag}\` | \`${msg.member.id}\``)
        .addField('Server', `\`${msg.guild.name}\` | \`${msg.guild.id}\``)
        .setTimestamp()
        .setColor(msg.guild.me.displayHexColor);

        Channel.send(Embed)

        await msg.channel.send(`${this.client.util.emoji.success} | Your report has been sent to my developer !!`)
  }
};
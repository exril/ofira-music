const { MessageEmbed } = require('discord.js');
const permissions = require('../assets/Permission.js');

const PlayerPerms = require('../structures/player/PlayerPerms');

module.exports = class AbstractCommand {
	constructor(client, options = {}) {
		this.client = client;
		this.name = options.name;
		this.aliases = options.aliases || [];
		this.description = options.description || 'No description provided.';
		this.category = options.category || 'General';
		this.usage = options.usage || [];
		this.example = options.example || [];
		this.userPerms = options.userPerms || ["SEND_MESSAGES"];
		this.clientPerms = options.botPerms || ['SEND_MESSAGES'];
		this.voteLock = options.voteLock || false;
		this.ownerOnly = options.ownerOnly || false;
		this.playerPerms = new PlayerPerms();
	}

	async run(...args) {
		throw new Error(`Command ${this.name} doesn't provide a run method!`);
	}

	checkPermissions(message, ownerOverride = true) {
		if (!message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) return false;
		const clientPermission = this.checkClientPermissions(message);
		const userPermission = this.checkUserPermissions(message, ownerOverride);

		if (clientPermission && userPermission) return true;
		else return false;
	}

	checkUserPermissions(message, ownerOverride = true) {
		if (!this.ownerOnly && !this.userPermissions) return true;
		if (ownerOverride && message.client.config.owners.find(o => o.id === message.author.id)) return true;
		if (this.ownerOnly && !message.client.config.owners.find(o => o.id === message.author.id)) return false;

		if (message.guild.members.cache.get(message.member.id).permissions.has('ADMINISTRATOR')) return true;
		if (this.userPermissions) {
			const missingPermissions =
				message.channel.permissionsFor(message.member).missing(this.userPerms).map(p => permissions[p]);
			if (missingPermissions.length !== 0) {
				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
					.setTitle(`❌ | Missing User Permissions: \`${this.name}\``)
					.setDescription(`\`\`\`diff\n${missingPermissions.map(p => `- ${p}`).join('\n')}\`\`\``)
					.setColor(message.guild.me.displayHexColor);
				message.channel.send(embed);
				return false;
			}
		}
		return true;
	}

	checkClientPermissions(message) {
		const missingPermissions =
			message.channel.permissionsFor(message.guild.me).missing(this.clientPerms).map(p => permissions[p]);
		const missingUserPermissions =
			message.channel.permissionsFor(message.member).missing(this.userPerms).map(p => permissions[p]);
		if (missingPermissions.length !== 0 && missingUserPermissions.length === 0) {
			const embed = new MessageEmbed()
				.setAuthor(`${message.client.user.tag}`, message.client.user.displayAvatarURL({ dynamic: true }))
				.setTitle(`❌ | Missing Bot Permissions: \`${this.name}\``)
				.setDescription(`\`\`\`diff\n${missingPermissions.map(p => `- ${p}`).join('\n')}\`\`\``)
				.setColor(message.guild.me.displayHexColor);
			message.channel.send(embed);
			return false;
		} else return true;
	}

	argsMissing(msg) {
		const embed = new MessageEmbed()
			.setColor(this.client.util.color.primary)
			.setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true, size: 4096 }))
			.setFooter(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true, size: 4096 }))
			.setDescription(`> Name: ${this.client.util.toProperCase(this.name)}\n> Description: ${this.description}\n> Category: ${this.category}`);
		if (this.aliases.length > 0) embed.addField(`Alias`, this.aliases.map(a => `\`${msg.guild.prefix}${a}\``).join(', '));
		if (this.usage.length > 0) embed.addField('Usage(s)', this.usage.map(u => `\`${msg.guild.prefix}${this.name} ${u}\``).join('\n'));
		if (this.example.length > 0) embed.addField('Example(s)', this.example.map(e => `\`${msg.guild.prefix}${this.name} ${e}\``).join('\n'));
		return msg.channel.send(embed);
	}
};
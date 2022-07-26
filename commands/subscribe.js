const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'subscribe',
	description: 'Subscribe to a role',
	usage: '<role>',
	example: 'subscribe status',
	getSlashCommandBuilder: () => {
		const subscription_roles = require('../config').subscription_roles;
		const choices = Object.keys(subscription_roles).map(role => {
			return {name: subscription_roles[role].title, value: role};
		});
		return new SlashCommandBuilder()
			.setName(module.exports.name)
			.setDescription(module.exports.description)
			.addStringOption(option => 
				option.setName('role')
					.setDescription('Enter a role to subscribe to')
					.addChoices(...choices)
					.setRequired(true));
	},
	args: false,
	cooldown: 5,
	guildOnly: true,
	adminOnly: false,
	async execute(message, args, depend) {
		const client = message.client;

		const {
			config,
			discord_lib: Discord,
		} = depend;

		// command starts here
		// const guild_self = await message.guild.members.fetch(client.user.id);
		// if (message.channel.permissionsFor(guild_self).has(Discord.PermissionsBitField.ManageMessages)) {
		//     message.delete()
		// };
		let roles = config.subscription_roles;


		if (args.length < 1) {
			let list = new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle('Subscribe to notifications')
				.setDescription('**»** Subscribe to specific notifications by giving yourself a role that will be mentioned (by staff or bots, not players).')
				.setFooter({text: config.name, iconURL: client.user.avatarURL()})
				.setTimestamp();



			for (let role in roles) {
				list.addFields({name: `:white_small_square: **${roles[role].title}**: ${roles[role].id}`, value: roles[role].description + `\n\n**Type \`${config.prefix}subscribe ${roles[role].id}\` to subscribe**`});
			}
			return message.channel.send({embeds: [list]});
		}


		if (roles[args[0]]) {
			const role = message.guild.roles.cache.find(r => r.id === roles[args[0]].role);

			if (message.member.roles.cache.some(r => r.id === roles[args[0]].role)) {
				message.member.roles.remove(role);
				message.channel.send({embeds: [
					new Discord.EmbedBuilder()
						.setColor(config.color.success)
						.setTitle(':thumbsup: Unsubscribed')
						.setDescription(`**»** ${message.author}, you are no longer subscribed to **${roles[args[0]].title.toLowerCase()}**.\nYou can use \`${config.prefix}subscribe ${roles[args[0]].id}\` to resubscribe.`)
				]});
			} else {
				message.member.roles.add(role);
				message.channel.send({embeds: [
					new Discord.EmbedBuilder()
						.setColor(config.color.success)
						.setTitle(':thumbsup: Subscribed')
						.setDescription(`**»** ${message.author}, you are now subscribed to **${roles[args[0]].title.toLowerCase()}**.\nYou can use \`${config.prefix}unsubscribe ${roles[args[0]].id}\` to unsubscribe.`)
				]});
			}


		} else {
			message.channel.send({embeds: [
				new Discord.EmbedBuilder()
					.setTitle('Error')
					.setColor(config.color.fail)
					.addFields({name: 'Unkown role', value: `Type \`${config.prefix}${module.exports.name}\` for a list of roles`})
					.addFields({name: 'Information', value: `\`${config.prefix}help ${module.exports.name}\` for more information`})
			]});
		}




	}
};
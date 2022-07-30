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
	async execute(interaction, depend) {
		const {
			config,
			discord_lib: Discord,
		} = depend;

		const role_arg = interaction.options.getString('role');

		await interaction.deferReply();

		let roles = config.subscription_roles;

		const role = interaction.guild.roles.cache.find(r => r.id === roles[role_arg].role);
		if (interaction.member.roles.cache.some(r => r.id === roles[role_arg].role)) {
			await interaction.member.roles.remove(role);
			await interaction.editReply({embeds: [
				new Discord.EmbedBuilder()
					.setColor(config.color.success)
					.setTitle(':thumbsup: Unsubscribed')
					.setDescription(`**»** ${interaction.member.displayName}, you are no longer subscribed to **${roles[role_arg].title.toLowerCase()}**.\nYou can use \`/subscribe ${roles[role_arg].id}\` to resubscribe.`)
			]});
		} else {
			await interaction.member.roles.add(role);
			await interaction.editReply({embeds: [
				new Discord.EmbedBuilder()
					.setColor(config.color.success)
					.setTitle(':thumbsup: Subscribed')
					.setDescription(`**»** ${interaction.member.displayName}, you are now subscribed to **${roles[role_arg].title.toLowerCase()}**.\nYou can use \`/unsubscribe ${roles[role_arg].id}\` to unsubscribe.`)
			]});
		}
	}
};
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'prune',
	description: 'Bulk-delete messages',
	usage: '<1-100>',
	example: 'prune 100',
	getSlashCommandBuilder: () => new SlashCommandBuilder()
		.setName(module.exports.name)
		.setDescription(module.exports.description)
		.addIntegerOption(option => 
			option.setName('messages')
				.setDescription('Enter the number of messages to delete')
				.setRequired(true)),
	args: true,
	guildOnly: true,
	adminOnly: true,
	async execute(interaction, depend) {
		const client = interaction.client;

		const {
			config,
			discord_lib: Discord,
			log,
		} = depend;

		// command starts here
		const guild_self = await interaction.guild.members.fetch(client.user.id);
		if (interaction.channel.permissionsFor(guild_self).has(Discord.PermissionsBitField.ManageMessages)) {
			let amount = interaction.options.getInteger('messages');

			if (amount < 1 || amount > 100) {
				await interaction.reply({embeds: [
					new Discord.EmbedBuilder()
						.setColor(config.color.fail)
						.setTitle('Error')
						.setDescription('❌ **»** Number of messages to delete must be btween 1 and 100.')
				]});
				return;
			}
			await interaction.deferReply({ ephemeral: true });
			interaction.channel.bulkDelete(amount, true).then(async () => {
				interaction.editReply({embeds: [
					new Discord.EmbedBuilder()
						.setColor(config.color.success)
						.setTitle('Messages pruned')
						.setDescription(`✅ **»** Deleted ${amount} messages`)
				]});

				(await client.channels.fetch(config.log_chan_id)).send({embeds: [
					new Discord.EmbedBuilder()
						.setAuthor({name: interaction.member.displayName, iconURL: interaction.user.avatarURL()})
						.setColor(config.color.success)
						.setTitle('Messages pruned')
						.addFields({name: 'By', value: interaction.member.displayName, inline: true})
						.addFields({name: 'Messages', value: amount.toString(), inline: true})
						.setFooter({text: config.name, iconURL: client.user.avatarURL()})
						.setTimestamp()
				]});
			}).catch(async err => {
				log.error(err);
				await interaction.editReply(':bangbang: **»** An error occured');
			});

		} else {
			await interaction.editReply(':bangbang: **»** Permission error');
		}
	}
};

module.exports = {
	name: 'prune',
	description: 'Bulk-delete messages',
	usage: '<1-100>',
	aliases: ['purge'],
	example: 'prune 100',
	args: true,
    
	guildOnly: true,
	adminOnly: true,
	async execute(message, args, depend) {
		const client = message.client;

		const {
			config,
			discord_lib: Discord,
			log,
		} = depend;

		// command starts here
		const guild_self = await message.guild.members.fetch(client.user.id);
		if (message.channel.permissionsFor(guild_self).has(Discord.PermissionsBitField.ManageMessages)) {
			
			// add 1 to delete the original message
			let amount = parseInt(args[0]) + 1;

			if (isNaN(amount)) {
				return message.channel.send({embeds: [
					new Discord.EmbedBuilder()
						.setColor(config.color.fail)
						.setTitle('Error')
						.setDescription(`❌ **»** Invalid number. Type \`${config.prefix}help prune\` for help.`)
				]});

			} else if (amount < 1 || amount > 100) {
				return message.channel.send({embeds: [
					new Discord.EmbedBuilder()
						.setColor(config.color.fail)
						.setTitle('Error')
						.setDescription('❌ **»** Number of messages to delete must be btween 1 and 100.')
				]});
			}

			message.channel.bulkDelete(amount, true).then(async () => {
				message.channel.send({embeds: [
					new Discord.EmbedBuilder()
						.setColor(config.color.success)
						.setTitle('Messages pruned')
						.setDescription(`✅ **»** Deleted ${amount-1} messages`)
				]});

				(await client.channels.fetch(config.log_chan_id)).send({embeds: [
					new Discord.EmbedBuilder()
						.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
						.setColor(config.color.success)
						.setTitle('Messages pruned')
						.addFields({name: 'By', value: message.author.toString(), inline: true})
						.addFields({name: 'Messages', value: amount.toString(), inline: true})
						.setFooter({text: config.name, iconURL: client.user.avatarURL()})
						.setTimestamp()
				]});
			}).catch(err => {
				log.error(err);
				message.channel.send(':bangbang: **»** An error occured');
			});

		} else {
			message.channel.send(':bangbang: **»** Permission error');
		}

        

	}
};

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
		if (message.channel.permissionsFor(message.channel.guild.me).has('MANAGE_MESSAGES')) {
			message.delete();

			let amount = parseInt(args[0]);

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
						.setDescription(`✅ **»** Deleted ${amount} messages`)
				]});

				(await client.channels.fetch(config.log_chan_id)).send({embeds: [
					new Discord.EmbedBuilder()
						.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
						.setColor(config.color.success)
						.setTitle('Messages pruned')
						.addFields({name: 'By', value: message.author, inline: true})
						.addFields({name: 'Messages', value: amount, inline: true})
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
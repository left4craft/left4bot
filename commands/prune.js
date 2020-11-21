
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
				return message.channel.send(
					new Discord.MessageEmbed()
						.setColor('#E74C3C')
						.setTitle('Error')
						.setDescription(`:x: **»** Invalid number. Type \`${config.prefix}help prune\` for help.`)
				);

			} else if (amount < 1 || amount > 100) {
				return message.channel.send(
					new Discord.MessageEmbed()
						.setColor('#E74C3C')
						.setTitle('Error')
						.setDescription(':x: **»** Number of messages to delete must be btween 1 and 100.')
				);
			}

			message.channel.bulkDelete(amount, true).then(() => {
				message.channel.send(
					new Discord.MessageEmbed()
						.setColor(config.colour)
						.setTitle('Messages pruned')
						.setDescription(`:white_check_mark: **»** Deleted ${amount} messages`)
				);

				client.channels.cache.get(config.log_chan_id).send(
					new Discord.MessageEmbed()
						.setAuthor(message.author.username, message.author.avatarURL())
						.setColor(config.colour)
						.setTitle('Messages pruned')
						.addField('By', message.author, true)
						.addField('Messages', amount, true)
						.setFooter(config.name, client.user.avatarURL())
						.setTimestamp()
				);
			}).catch(err => {
				log.error(err);
				message.channel.send(':bangbang: **»** An error occured');
			});

		} else {
			message.channel.send(':bangbang: **»** Permission error');
		}

        

	}
};
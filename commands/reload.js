module.exports = {
	name: 'reload',
	description: 'Clear cache and reload a command',
	usage: '<command>',
	aliases: ['none'],
	example: 'reload help',
	args: true,
	guildOnly: true,
	adminOnly: true,
	async execute(client, message, args, Ticket, depend) {
        
		const {config, discord_lib: Discord, log } = depend;

		// command starts here
		// if (message.channel.permissionsFor(message.channel.guild.me).has('MANAGE_MESSAGES')) {
		//     message.delete()
		// };

		if (!args.length) return message.channel.send('❌ **»** No command given');

		const commandName = args[0].toLowerCase();
		const command = message.client.commands.get(commandName) ||
            message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command) return message.channel.send({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.fail)
				.setTitle('Error')
				.setDescription(`❌ **»** There is no command with the name or alias \`${commandName}\``)
		]});


		delete require.cache[require.resolve(`./${command.name}.js`)];

		try {
			const newCommand = require(`./${command.name}.js`);
			message.client.commands.set(newCommand.name, newCommand);


			message.channel.send({embeds: [
				new Discord.EmbedBuilder()
					.setColor(config.color.success)
					.setTitle('Command reloaded')
					.setDescription(`✅ **»** Reloaded the \`${newCommand.name}\` command.`)
			]});

			(await client.channels.fetch(config.log_chan_id)).send({embeds: [
				new Discord.EmbedBuilder()
					.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
					.setColor(config.color.success)
					.setTitle('Command reloaded')
					.addFields({name: 'By', value: message.author, inline: true})
					.addFields({name: 'Command', value: `\`${newCommand.name}\``, inline: true})
					.setFooter({text: config.name, iconURL: client.user.avatarURL()})
					.setTimestamp()
			]});

			log.console(`[CMD] > Reloaded '${config.prefix}${command.name}' command (by ${message.author.tag})`);


		} catch (error) {
			message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
		}








	}
};
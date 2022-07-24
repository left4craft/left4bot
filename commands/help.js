module.exports = {
	name: 'help',
	description: 'Displays help menu',
	usage: '[command]',
	aliases: ['command', 'commands'],
	example: 'help poll',
	args: false,
	guildOnly: true,
	adminOnly: false,
	async execute(message, args, depend) {
		const client = message.client;
		const {
			config,
			discord_lib: Discord,
			log,
		} = depend;


		const commands = Array.from(client.commands.values());

		if (!args.length) {
			var cmds = [];

			for (let command of commands) {
				if (command.hide) continue;

				// console.log((await message.member.fetch()).roles);
				if ((command.permission && !message.member.hasPermission(command.permission)) || (command.staffOnly === true && !message.member.roles.cache.some(r => config.staff_ranks.includes(r.name.toLowerCase()))) || (command.adminOnly === true && !message.member.roles.cache.some(r => config.admin_roles.includes(r.name.toLowerCase())))) {
					continue;
				}

				cmds.push(`**${config.prefix}${command.name}** **·** ${command.description}`);
			}
			const embed = new Discord.EmbedBuilder() 
				.setTitle('Commands')
				.setColor(config.color.success)
				.setDescription(`\nThe commands you have access to are listed below. Type \`${config.prefix}help [command]\` for more information about a specific command.\n\n${cmds.join('\n\n')}\n\nPlease contact a member of staff if you require assistance.`)
				.setFooter({text: config.name, iconURL: client.user.avatarURL()});


			message.channel.send({embeds: [embed]})
				.catch((error) => {
					log.warn('Could not send help menu');
					log.error(error);
				});

		} else {
			const name = args[0].toLowerCase();
			const command = client.commands.get(name) || client.commands.find(c => c.aliases && c.aliases.includes(name));

			if (!command) {
				const notCmd = new Discord.EmbedBuilder()
					.setColor(config.color.fail)
					.setDescription(`❌ **Invalid command name** (\`${config.prefix}help\`)`);
				return message.channel.send({embeds: [notCmd]});
			}

			const cmd = new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle(command.name);


			if (command.long) {
				cmd.setDescription(command.long);
			} else {
				cmd.setDescription(command.description);
			}
			if (command.aliases) cmd.addFields({name: 'Aliases', value: `\`${command.aliases.join(', ')}\``, inline: true});

			if (command.usage) cmd.addFields({name: 'Usage', value: `\`${config.prefix}${command.name} ${command.usage}\``, inline: false});

			if (command.usage) cmd.addFields({name: 'Example', value: `\`${config.prefix}${command.example}\``, inline: false});


			if (command.permission && !message.member.hasPermission(command.permission)) {
				cmd.addFields({name: 'Required Permission', value: `\`${command.permission}\` :exclamation: You don't have permission to use this command`, inline: true});
			} else {
				cmd.addFields({name: 'Required Permission', value: `\`${command.permission || 'none'}\``, inline: true});
			}
            
			message.channel.send({embeds: [cmd]});

		}

		// command ends here
	},
};
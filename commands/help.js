const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'help',
	description: 'Displays help menu',
	usage: '[command]',
	example: 'help poll',
	// note: this is a special getSlashCommandBuilder()
	getSlashCommandBuilder: (commands) => new SlashCommandBuilder()
		.setName(module.exports.name)
		.setDescription(module.exports.description)
		.addStringOption(option => option.setName('command')
			.setDescription('Enter a command')
			.addChoices(...commands.map(cmd => {return {name: cmd, value: cmd};}))
			.setRequired(false)),
	args: false,
	guildOnly: true,
	adminOnly: false,
	async execute(interaction, depend) {
		const client = interaction.client;
		const {
			config,
			discord_lib: Discord,
		} = depend;


		const commands = Array.from(client.commands.values());

		if (!interaction.options.getString('command')) {
			var cmds = [];

			for (let command of commands) {
				if (command.hide) continue;

				// console.log((await message.member.fetch()).roles);
				if ((command.permission && !interaction.member.hasPermission(command.permission)) || (command.staffOnly === true && !interaction.member.roles.cache.some(r => config.staff_ranks.includes(r.name.toLowerCase()))) || (command.adminOnly === true && !interaction.member.roles.cache.some(r => config.admin_roles.includes(r.name.toLowerCase())))) {
					continue;
				}

				cmds.push(`**/${command.name}** **·** ${command.description}`);
			}
			const embed = new Discord.EmbedBuilder() 
				.setTitle('Commands')
				.setColor(config.color.success)
				.setDescription(`\nThe commands you have access to are listed below. Type \`/help [command]\` for more information about a specific command.\n\n${cmds.join('\n\n')}\n\nPlease contact a member of staff if you require assistance.`)
				.setFooter({text: config.name, iconURL: client.user.avatarURL()});


			await interaction.reply({embeds: [embed]});
		} else {
			const name = interaction.options.getString('command').toLowerCase();
			const command = client.commands.get(name) || client.commands.find(c => c.aliases && c.aliases.includes(name));

			if (!command) {
				const notCmd = new Discord.EmbedBuilder()
					.setColor(config.color.fail)
					.setDescription('❌ **Invalid command name** (`/help`)');
				await interaction.reply({embeds: [notCmd]});
				return;
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

			if (command.usage) cmd.addFields({name: 'Usage', value: `\`/${command.name} ${command.usage}\``, inline: false});

			if (command.usage) cmd.addFields({name: 'Example', value: `\`/${command.example}\``, inline: false});

			if ((command.permission && !interaction.member.hasPermission(command.permission)) || (command.staffOnly === true && !interaction.member.roles.cache.some(r => config.staff_ranks.includes(r.name.toLowerCase()))) || (command.adminOnly === true && !interaction.member.roles.cache.some(r => config.admin_roles.includes(r.name.toLowerCase())))) {
				cmd.addFields({name: 'Required Permission', value: ':exclamation: You don\'t have permission to use this command', inline: true});
			} else {
				cmd.addFields({name: 'Required Permission', value: 'You have permission to use this command', inline: true});
			}
            
			await interaction.reply({embeds: [cmd]});

		}

		// command ends here
	},
};
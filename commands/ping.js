const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'ping',
	description: 'Calculate latency',
	usage: '',
	example: 'ping',
	getSlashCommandBuilder: () => new SlashCommandBuilder()
		.setName(module.exports.name)
		.setDescription(module.exports.description),
	args: false,
	cooldown: 10,
	guildOnly: true,
	adminOnly: false,
	async execute(message, args, depend) {
		const client = message.client;

		const {
			config,
			discord_lib: Discord,
		} = depend;



		// command starts here
		const guild_self = await message.guild.members.fetch(client.user.id);
		if (message.channel.permissionsFor(guild_self).has(Discord.PermissionsBitField.ManageMessages)) {
			message.delete();
		}

		message.channel.startTyping();
		const m = await message.channel.send('Calculating ping...');
		m.edit('...');
		m.delete();

		message.channel.send({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle('Pong!')
				.addFields({name: 'Latency', value: `\`${m.createdTimestamp - message.createdTimestamp}ms\``, inline: true})
				.setFooter({text: config.name, iconURL: client.user.avatarURL()})
				.setTimestamp()
		]});
		message.channel.stopTyping();


	}
};
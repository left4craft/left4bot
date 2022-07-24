module.exports = {
	name: 'ping',
	description: 'Calculate latency',
	usage: '',
	aliases: ['none'],
	example: 'ping',
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
		if (message.channel.permissionsFor(message.channel.guild.me).has('MANAGE_MESSAGES')) {
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
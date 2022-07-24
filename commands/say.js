module.exports = {
	name: 'say',
	description: 'Make the bot say something',
	usage: '<message>',
	aliases: ['echo'],
	example: 'say ok',
	args: true,
    
	guildOnly: true,
	adminOnly: true,
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

		const text = args.join(' '); 

		message.channel.send({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
				.setDescription(text)
		]});

		(await client.channels.fetch(config.log_chan_id)).send({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle(`${message.author.username} said`)
				.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
				.setDescription(text)
				.setFooter({text: config.name, iconURL: client.user.avatarURL()})
				.setTimestamp()
		]}); // log channel message

       
	}
};
module.exports = {
	name: 'eval',
	description: 'Evaluate javascript code',
	usage: '<statement>',
	aliases: ['none'],
	example: 'eval 5 + 5',
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
		}

		const clean = (text) => text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));

		const code = args.join(' ');
		let res;
		try {
			res = eval(code);
			if (typeof res !== 'string') res = require('util').inspect(res);

		} catch (err) {
			if(err.toString().length > 1000) return message.channel.send('❌ **»** An error occurred and the output is too big.');
			return message.channel.send(
				new Discord.MessageEmbed()
					.setColor('RED')
					.setTitle('Evaluation Error')
					.setAuthor(message.author.username, message.author.avatarURL())
					.addField('⌨️ Input', `\`\`\`js\n${clean(code)}\`\`\``)
					.addField('🖥️ Output', `\`\`\`js\n${clean(err)}\`\`\``)
					.setFooter(config.name, client.user.avatarURL())
					.setTimestamp()
			);
		}

		if(res.toString().length > 1000) return message.channel.send('❌ **»** Output is too big.');

		message.channel.send(
			new Discord.MessageEmbed()
				.setColor(config.colour)
				.setTitle('Evaluation')
				.setAuthor(message.author.username, message.author.avatarURL())
				.addField('⌨️ Input', `\`\`\`js\n${clean(code)}\`\`\``)
				.addField('🖥️ Output', `\`\`\`js\n${clean(res)}\`\`\``)
				.setFooter(config.name, client.user.avatarURL())
				.setTimestamp()
		);

		client.channels.cache.get(config.log_chan_id).send(
			new Discord.MessageEmbed()
				.setColor(config.colour)
				.setTitle(`${message.author.username} evaluated a statement`)
				.setAuthor(message.author.username, message.author.avatarURL())
				.addField('⌨️ Input', `\`\`\`${clean(code)}\`\`\``)
				.addField('🖥️ Output', `\`\`\`${clean(res)}\`\`\``)
				.setFooter(config.name, client.user.avatarURL())
				.setTimestamp()
		); // log channel message

		log.info(`${message.author.username} evaluated a statement`);


	}
};
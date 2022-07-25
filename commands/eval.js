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
		const guild_self = await message.guild.members.fetch(client.user.id);
		if (message.channel.permissionsFor(guild_self).has(Discord.PermissionsBitField.ManageMessages)) {
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
			return message.channel.send({
				embeds: [
					new Discord.EmbedBuilder()
						.setColor(config.color.fail)
						.setTitle('Evaluation Error')
						.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
						.addFields({name: '⌨️ Input', value: `\`\`\`js\n${clean(code)}\`\`\``})
						.addFields({name: '🖥️ Output', value:  `\`\`\`js\n${clean(err)}\`\`\``})
						.setFooter({text: config.name, iconURL: client.user.avatarURL()})
						.setTimestamp()
				]
			}
			);
		}

		if(res.toString().length > 1000) return message.channel.send('❌ **»** Output is too big.');

		message.channel.send(
			{embeds: [
				new Discord.EmbedBuilder()
					.setColor(config.color.success)
					.setTitle('Evaluation')
					.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
					.addFields({name: '⌨️ Input', value: `\`\`\`js\n${clean(code)}\`\`\``})
					.addFields({name: '🖥️ Output',value:  `\`\`\`js\n${clean(res)}\`\`\``})
					.setFooter({text: config.name, iconURL: client.user.avatarURL()})
					.setTimestamp()
			]}
		);

		(await client.channels.fetch(config.log_chan_id)).send(
			{embeds: [
				new Discord.EmbedBuilder()
					.setColor(config.color.success)
					.setTitle(`${message.author.username} evaluated a statement`)
					.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
					.addFields({name: '⌨️ Input', value: `\`\`\`${clean(code)}\`\`\``})
					.addFields({name: '🖥️ Output',value:  `\`\`\`${clean(res)}\`\`\``})
					.setFooter({text: config.name, iconURL: client.user.avatarURL()})
					.setTimestamp()
			]}
		); // log channel message

		log.info(`${message.author.username} evaluated a statement`);


	}
};
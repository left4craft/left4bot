const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'poll',
	description: 'Create a poll',
	usage: '<question> |OR| <question> <option1;option2;etc>',
	example: 'poll Which colour? Blue; Orange; Red',
	getSlashCommandBuilder: () => new SlashCommandBuilder()
		.setName(module.exports.name)
		.setDescription(module.exports.description)
		.addStringOption(option => 
			option.setName('question')
				.setDescription('Enter a question')
				.setRequired(true))
		.addStringOption(option => 
			option.setName('options')
				.setDescription('Enter options separated by semicolons')
				.setRequired(false)),
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
		// const guild_self = await message.guild.members.fetch(client.user.id);
		// if (message.channel.permissionsFor(guild_self).has(Discord.PermissionsBitField.ManageMessages)) {
		//     message.delete()
		// };

		const alphabet = 'abcdefghijklmnopqrstuvwxyz';
		// const unicode = "🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯🇰🇱🇲🇳🇴🇵🇶🇷🇸🇹🇺🇻🇼🇽🇾🇿";
		const unicode = '🇦 🇧 🇨 🇩 🇪 🇫 🇬 🇭 🇮 🇯 🇰 🇱 🇲 🇳 🇴 🇵 🇶 🇷 🇸 🇹 🇺 🇻 🇼 🇽 🇾 🇿'.split(' ');

		let joined = args.join(' '); // make it a string again

		let split = joined.trim().split(';'); // array of question and options, no type, split at the ;


		for (let i = 0; i < split.length; i++) {
			let newStr = split[i].trim(); // remove whitespace
			if (newStr[newStr.length - 1] == ';') newStr = newStr.substring(0, newStr.length - 1); // remove semicolons
			split[i] = newStr;
			if (newStr.length < 1) split.pop();
		}

		let question = split.shift(); // this is the question
		let options = split; // array of the options

		const channel = await client.channels.fetch(config.poll_chan_id);

		if (options.length > 26) {
			return message.channel.send({embeds:[
				new Discord.EmbedBuilder()
					.setTitle('Error')
					.setColor(config.color.fail)
					.addFields({name: 'Too many options', value: 'Polls are limited to maximum of 26 options'})
					.addFields({name: 'Information', value: `\`${config.prefix}help ${module.exports.name}\` for more information`})
			]}
			);
		}


		if (options.length < 1) {
			// basic with thumbs up and down
			log.info(`${message.author.username} created a basic poll`);

			channel.send(`<@&${config.subscription_roles.polls.role}>`);
			const poll = await channel.send({
				embeds: [new Discord.EmbedBuilder()
					.setColor(config.color.success)
					.setTitle(question)
					.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
					.setDescription('Please react with your choice: \n\n:thumbsup: Yes\n\n:thumbsdown: No\n\nPlease only react once.')
				// .addFields({name: "Options", value: `\n\n:thumbsup: Yes\n\n:thumbsdown: No\n\n`, inline: true})
					.setFooter({text: config.name, iconURL: client.user.avatarURL()})
					.setTimestamp()]
			});

			await poll.react('👍');
			await poll.react('👎');



		} else {
			// advanced with A-Z (26 max options) 
			log.info(`${message.author.username} created an advanced poll with ${options.length} options`);

			let options_string = '';
			for (let i = 0; i < options.length; i++) {
				options_string += `:regional_indicator_${alphabet[i]}: ${options[i]}\n\n`;
			}
			channel.send(`<@&${config.subscription_roles.polls.role}>`);
			const poll = await channel.send({embeds: [
				new Discord.EmbedBuilder()
					.setColor(config.color.success)
					.setTitle(question)
					.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
					.setDescription(`Please react with your choice: \n\n${options_string}`)
					.setFooter({text: config.name, iconURL: client.user.avatarURL()})
					.setTimestamp()]}
			);

			for (let i = 0; i < options.length; i++) {
				try {
					await poll.react(unicode[i]);
				} catch (e) {
					log.warn(`Failed to react to poll with ${unicode[i]} (${alphabet[i]})`);
				} 
			}


		}

		message.channel.send({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle(':thumbsup: Poll created')
				.setDescription(`**»** Go to <#${config.poll_chan_id}> to view`)
				.addFields({name: 'Question', value: question, inline: false})
		]}); // success message


		(await client.channels.fetch(config.log_chan_id)).send({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle('Poll created')
				.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
				.addFields({name: 'By', value: message.author.tag, inline: true})
				.addFields({name: 'Question', value: question, inline: false})
				.addFields({name: 'Options', value: options.length, inline: true})
				.setFooter({text: config.name, iconURL: client.user.avatarURL()})
				.setTimestamp()
		]}); // log channel message

	}
};